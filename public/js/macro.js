/**
 * Created by pi on 8/30/16.
 */

$(function () {
    var pressed = false;
    var chars = [];
    var progressbarValue, barcodeText, progressbar, conn, cmd;
    var selected, selectedProductIdent, selectedTargetWeight, selectedActualWeight, tareWeight = 0;
    var toAssemblyDataTable, haveAssemblyedDataTable;
    var disLocation = $('#disLocation').html();
    var selectedProduct;
    var positiveDev = 0;
    var negativeDev = 0;
    var assemblyId = $('#assemblyId').val();
    var state = $('#state').val();
    console.log('disLocation: ' + disLocation);
    selected = [];
    progressbar = $("#progressbar");
    progressbar.progressbar({
        value: 0
    });
    progressbarValue = progressbar.find(".ui-progressbar-value");
    if(state == '3'){
        $('#printAssembly').prop('disabled', false);
    }
    $(window).keypress(function (e) {
        if ((e.which >= 48 && e.which <= 57) || (e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122) || e.which == 95 || e.which == 47) {
            chars.push(String.fromCharCode(e.which));
        }
        console.log(e.which + ":" + chars.join("|"));
        if (pressed == false) {
            setTimeout(function () {
                if (chars.length >= 10) {
                    barcodeText = chars.join("");
                    console.log("Barcode Scanned: " + barcodeText);
                    // assign value to some input (or do whatever you want)
                    $("#barcode").val(barcodeText);
                    barcodeScanned(barcodeText);
                }
                chars = [];
                pressed = false;
            }, 500);
        }
        pressed = true;
    });

    try{
        if (window["WebSocket"]) {
            conn = new WebSocket("ws://localhost:8989/ws");

            conn.onclose = function (evt) {
                $('#infos').append('<li>Connection closed.</li>');
            };
            conn.onmessage = function (evt) {
                //$('#infos').append('<li>' + evt.data + '</li>');
                showInfo(evt.data);
            };
            cmd = 'close COM1';
            setTimeout(function () {
                conn.send(cmd + "\n");
                cmd = 'open COM1 9600 tinyg';
                setTimeout(function () {
                    conn.send(cmd + "\n");
                }, 250);
            }, 250);


        } else {
            $('#errors').append('<li>Your browser does not support WebSockets.</li>');
        }
    }catch (ex){
        $('#errors').append('<li>' +ex+ '</li>');
    }

    toAssemblyDataTable = $('#toAssemblyTable').DataTable();
    haveAssemblyedDataTable = $('#haveAssemblyedTable').DataTable();

    $('#toAssemblyTable tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selected.pop();
            selectedProductIdent = '';
            selectedTargetWeight = 0;
            $('#targetWeight').val(selectedTargetWeight);
        }
        else {
            toAssemblyDataTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            console.log('id: ' + this.id);
            selected.pop();
            selected.push(this.id);
            selectedProductIdent = $(this).find('input[type="text"]').val();
            selectedTargetWeight = $(this).find('input[type="number"]').val();
            selectedActualWeight = $(this).find('input.actualWeight').val();
            selectedTargetWeight = parseFloat(selectedTargetWeight);
            if(!$.isNumeric(selectedActualWeight)){
                selectedActualWeight = 0;
            }
            selectedActualWeight = parseFloat(selectedActualWeight);
            selectedTargetWeight = selectedTargetWeight -selectedActualWeight;
            $('#targetWeight').val(selectedTargetWeight);
            progressbar.progressbar({max: selectedTargetWeight * 2});
            if (selectedProductIdent) {
                $.get('/product/getProductByIdent/:' + selectedProductIdent, function (data) {
                    if (data.error) {
                        $('#errors').append('<li>' + data.error + '</li>');
                    }
                    if (data.product) {
                        selectedProduct = data.product;
                        positiveDev = selectedProduct.positiveDeviation * selectedTargetWeight * 0.01;
                        negativeDev = selectedProduct.negativeDeviation * selectedTargetWeight * 0.01;
                    }
                });
            }
            console.log('selected');
            console.dir(selected);
            // console.dir(this);
            // console.dir($(this).find('input[type="number"]'));

        }
    });

    $('#tare').click(_tare);
    $('#scaleWeight').click(function () {

    });
    $('#acceptWeight').click(function () {
        var actualWeight = parseFloat($('#actualWeight').val());
        var itemInfo = {
            actualWeight: actualWeight,
            isFinished: true
        };
        $.post('/station/dispensary/acceptWeight/:' + selected[0] + '/:' + barcodeText, {itemInfo:itemInfo}, function (data) {
            if (data.info) {
                $('#infos').append('<li>' + data.info + '</li>');
                _tare();
                toAssemblyDataTable.row('.selected').remove().draw(false);
                $('#acceptWeight').prop('disabled', true);
                $('#actualWeight').val(0);

                $('#navBar').find('a[href=#general]').click();
                var scaleLink = $('#navBar').find('a[href=#scale]');
                var scaleTab = $(scaleLink).removeAttr('data-toggle').parent();
                $(scaleTab).addClass('disabled');
                var rowNode = haveAssemblyedDataTable.row.add([
                    selectedProductIdent,
                    actualWeight
                ]).draw(false).node();

            }
            if(data.isReady === true){
                $('#printAssembly').prop('disabled', false);
            }
            if (data.error) {
                $('#errors').append('<li>' + data.error + '</li>');
            }
        });
    });
    $('#interrupt').click(function () {
        var actualWeight = parseFloat($('#actualWeight').val());

        var targetWeight = parseFloat(selectedTargetWeight) - actualWeight;
        if (targetWeight < 0) {
            targetWeight = 0;
        }
        var itemInfo = {
            id: selected[0],
            actualWeight: actualWeight,
            isFinished: false
        };
        $.post('/station/dispensary/acceptWeight/:id', itemInfo, function (data) {
            if (data.info) {
                $('#infos').append('<li>' + data.info + '</li>');
                _tare();
                $('#navBar').$('li.active').removeClass('active').$('a[href=#general]').parent().addClass('active');
                if (targetWeight > 0) {
                    toAssemblyDataTable.$('tr.selected').find('input[type="number"]').val(targetWeight);
                } else {
                    toAssemblyDataTable.row('.selected').remove().draw(false);
                }
            }
            if (data.error) {
                $('#errors').append('<li>' + data.error + '</li>');
            }
        });
    });
    $('#test').click(function () {
        simulateScale(selectedTargetWeight);
    });
    var changed = false;
    $('#testTab').click(function () {
        if (!changed) {
            // console.log('li.active');
            // console.dir($('#navBar').find('li.active'));
            var activeTab = $('#navBar').find('li.active');
            // $(activeTab).removeClass('active');
            var scaleLink = $('#navBar').find('a[href=#scale]');
            var scaleTab = $(scaleLink).attr('data-toggle', 'pill').parent();
            $(scaleTab).removeClass('disabled');
            // var e = new $.Event('click');
            $(scaleLink).click();
            // $('#navBar').find('li.active').removeClass('active').
            // $('a[href=#scale]').attr('data-toggle','pill').parent().addClass('active');
            // changed =true;
        } else {
            $('#navBar').find('li.active').removeClass('active').$('a[href=#general]').parent().addClass('active');
            changed = false;
        }

    });
    $("#barcode").keypress(function (e) {
        if (e.which === 13) {
            barcodeText = $(this).val();
            barcodeScanned(barcodeText);
            console.log("Barcode input: " + barcodeText);
        }
    });
    $('#confirmBarcode').click(function () {
        barcodeText = $('#barcode').val();
        barcodeScanned(barcodeText);
    });

    $('#printAssembly').click(function () {
        $.get('/macro/printAssembly/:' + assemblyId,function (data) {
            if (data.info) {
                $('#infos').append('<li>' + data.info + '</li>');
            }
            if (data.error) {
                $('#errors').append('<li>' + data.error + '</li>');
            }else{
                setTimeout(function () {
                    window.location.replace('/station/dispensary/dispensaryJobList/:' +disLocation);
                },500);
            }
        });
    });
    function _tare() {
        var actualWeight = $('#actualWeight').val();
        actualWeight = parseFloat(actualWeight);
        if ($.isNumeric(actualWeight)) {
            tareWeight += actualWeight;
            $('#actualWeight').val(0);
            progressbar.progressbar({value: 0});
        }
    }

    function checkAssemblyIsFinished() {
        var remainRows = toAssemblyDataTable.data().count();

    }

    var simulatedValue = 0;

    function simulateScale(targetValue) {
        simulatedValue += 0.1;
        if (targetValue > simulatedValue) {
            cmd = 'send COM1 ' + simulatedValue + '\n';
            if (conn) {
                conn.send(cmd);
            }
            setTimeout(function () {
                simulateScale(targetValue);
            }, 300);
        }

    }

    function barcodeScanned(barcode) {
        $('#infos').empty();
        $('#errors').empty();
        if (selectedProductIdent) {
            barcode = barcode.trim();
            var id = selected[0];
            if (barcode) {
                var segments;
                segments = barcode.split('_');
                if (segments.length == 0) {
                    segments = barcode.split('/');
                }
                barcode = segments[0] +'_' + segments[1] +'_' + segments[2];
                if (segments.length > 0) {
                    if (segments[0] === selectedProductIdent) {
                        $.get('/station/macro/scanBarcode/:' + id + '/:' + barcode, function (data) {
                            if (data.info) {
                                var actualWeight = 0;
                                $('#infos').append('<li>' + data.info + '</li>');
                                toAssemblyDataTable.row('.selected').remove().draw(false);
                                $('#acceptWeight').prop('disabled', true);
                                $('#actualWeight').val(0);

                                $('#navBar').find('a[href=#general]').click();
                                var scaleLink = $('#navBar').find('a[href=#scale]');
                                var scaleTab = $(scaleLink).removeAttr('data-toggle').parent();
                                $(scaleTab).addClass('disabled');
                                if(data.update){
                                    actualWeight = data.update.actualWeight;
                                }
                                var rowNode = haveAssemblyedDataTable.row.add([
                                    selectedProductIdent,
                                    actualWeight
                                ]).draw(false).node();

                            }
                            if(data.isReady === true){
                                $('#printAssembly').prop('disabled', false);
                            }
                            if (data.error) {
                                $('#errors').append('<li>' + data.error + '</li>');
                            }
                        });
                    } else {
                        $('#errors').append('<li>Product ident is not correct, please take right product</li>');
                    }
                } else {
                    $('#errors').append('<li>No barcode found</li>');
                }

            }
        } else {
            $('#errors').append('<li>No product selected.</li>');
        }

    }

    function showInfo(dataStr) {
        var data;
        var valueStr;
        var value;
        var per;
        var length;
        var diff;

        try {
            data = $.parseJSON(dataStr);
            if (typeof data == 'object') {
                if (data.D) {
                    if (Array.isArray(data.D)) {
                        valueStr = data.D[0];
                        length = valueStr.length;
                        data = valueStr.substring(0, length - 1);
                        value = parseFloat(data);

                        console.log('value: ' + value);
                        value = value - tareWeight;
                        per = Math.floor(value * 100 / selectedTargetWeight);
                        if (progressbar) {
                            progressbar.progressbar({value: value});
                            if (per < 50) {

                            } else if (per < 95) {
                                $('#progressbar .ui-progressbar-value').css('background-color', 'Orange');
                            } else if (per) {
                                $('#progressbar .ui-progressbar-value').css('background-color', 'Red');
                            }

                        }
                        $('#actualWeight').val(value);
                        diff = value - selectedTargetWeight;
                        if ((diff < 0 && -diff < negativeDev) || (diff > 0 && diff < positiveDev) || diff == 0.0) {
                            $('#acceptWeight').removeAttr('disabled');
                        } else {
                            $('#acceptWeight').prop('disabled', true);
                        }
                    } else {
                        return;
                    }


                }
            }
            if (data.Error) {
                $('#errors').append('<li>' + data.Error + '</li>');
            }
        } catch (ex) {

        }


    }
});
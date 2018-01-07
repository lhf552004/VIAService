/**
 * Created by pi on 9/17/16.
 */


$(function () {
    var pressed = false;
    var chars = [];
    var disLocation, barcodeText;
    var dispensaryJobsDataTable = $('#disJobsTable').DataTable();
    var stockDataTable = $('#stockTable').DataTable();
    var layersDataTable = $('#layersTable').DataTable();

    var selected = [];
    var logisticUnitSelected = [];
    var layerSelected = [];
    var server = location.href;
    var index = server.lastIndexOf(':');
    disLocation = server.substring(index + 1, server.length);
    console.log('disLocation: ' + disLocation);
    $('#disJobsTable tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selected.pop();
        }
        else {
            dispensaryJobsDataTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            console.log('id: ' + this.id);
            selected.pop();
            selected.push(this.id);
            console.log('selected');
            console.dir(selected);
        }
    });
    $('#stockTable tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            logisticUnitSelected.pop();
            layersDataTable.clear().draw();
        }
        else {
            stockDataTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            console.log('id: ' + this.id);
            logisticUnitSelected.pop();
            logisticUnitSelected.push(this.id);
            console.log('logisticUnitSelected');
            console.dir(logisticUnitSelected);
            layersDataTable.clear();
            if (this.id && this.id > 0) {
                $.get('/warehouse/layers/:' + this.id, function (data) {
                    if(data.layers){
                        data.layers.forEach(function (theLayer) {
                            var rowNode = layersDataTable.row.add([
                                theLayer.sscc,
                                theLayer.bagNo,
                                theLayer.actualWeight
                            ]).draw(false).node();
                            $(rowNode).attr('id', theLayer.id);
                        });
                    }

                });
            }


        }
    });

    $('#layersTable tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            layerSelected.pop();
        }
        else {
            layersDataTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            console.log('id: ' + this.id);
            layerSelected.pop();
            layerSelected.push(this.id);
            console.log('layerSelected');
            console.dir(layerSelected);
        }
    });

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
                    $("#transferBarcode").val(barcodeText);
                    barcodeScanned(barcodeText);
                }
                chars = [];
                pressed = false;
            }, 500);
        }
        pressed = true;
    });
    $("#transferBarcode").keypress(function (e) {
        if (e.which === 13) {
            barcodeText = $(this).val();
            barcodeScanned(barcodeText);
            console.log("Barcode input: " + barcodeText);
        }
    });
    $('#confirmTransfer').click(function () {
        barcodeText = $('#transferBarcode').val();
        barcodeScanned(barcodeText);
    });
    function barcodeScanned(barcode) {
        if (barcode) {
            var segments;
            segments = barcode.split('_');
            if (segments.length == 0) {
                segments = barcode.split('/');
            }
            if (segments.length > 0) {
                $.get('/station/dispensary/transferToDis/:' + disLocation + '/:' + barcode, function (data) {
                    if (data.info) {
                        $('#infos').append('<li>' + data.info + '</li>');
                    }
                    if (data.error) {
                        $('#errors').append('<li>' + data.error + '</li>');
                    }
                    if (data.update && data.update.logisticUnit) {
                        var theLogisticUnit = data.update.logisticUnit;
                        var existedRowNode = $('#' + theLogisticUnit.id);
                        if(existedRowNode.length ==0){
                            var rowNode = stockDataTable.row.add([
                                theLogisticUnit.ident,
                                theLogisticUnit.productIdent,
                                theLogisticUnit.unitSize,
                                theLogisticUnit.nbOfUnits
                            ]).draw(false).node();
                            $(rowNode).attr('id', theLogisticUnit.id);
                        }

                    }
                    $('#transferBarcode').val('');
                });
            } else {
                $('#errors').append('<li>No barcode found</li>');
            }

        }

    }
});



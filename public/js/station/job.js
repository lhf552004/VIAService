/**
 * Created by pi on 8/30/16.
 */
$(function () {
    var job = {};

    var options = [];
    var gateStorages = [];
    var bulkStorages = [];
    //$scope.job = JSON.parse($("#job").val());
    var senderStorages = [];
    var receiverStorages = [];
    var line = {};
    var lineIdent = $('#lineIdent').val();
    var recipe = JSON.parse($('#recipe').val());
    var product = {};

    console.log('senders: ');
    console.log(recipe.senders);
    $('#sender').val(recipe.senders[0].storageIdent);
    $('#receiver').val(recipe.receivers[0].storageIdent);
    setBKColor(parseInt($('#state').val()));
    console.log('receiver: ');
    console.log(recipe.receivers);
    //getProduct(recipe.receivers[0].StorageId);
    console.log('lineId: ' + lineIdent);
    $.get('/storage/getStorageList/:' + 1, function (storagesOfGate) {
        console.log('storagesOfGate');
        console.log(storagesOfGate);
        gateStorages = storagesOfGate;

        $.get('/storage/getStorageList/:' + 10, function (storagesOfBulk) {
            console.log('storagesOfBulk');
            console.log(storagesOfBulk);
            bulkStorages = storagesOfBulk;


            $.get(' /line/getLine/:' + lineIdent, function (data) {
                console.log('line data');
                console.dir(data);
                if (!data.error) {
                    line = data.line;
                    if (line.category === 1) {
                        senderStorages = gateStorages;
                        receiverStorages = bulkStorages;
                    }
                    else {
                        senderStorages = bulkStorages;
                        receiverStorages = gateStorages;
                    }
                }

                senderStorages.forEach(function (senderStorage) {
                    options.push("<option value='" + senderStorage.id + "'>" + senderStorage.ident + "</option>");
                });
                $('#senderStorages')
                    .append(options.join(""))
                    .selectmenu({
                        change: function (event, ui) {
                            $('#sender').val(ui.item.label);
                            recipe.senders[0].StorageId = ui.item.value;
                            recipe.senders[0].storageIdent = ui.item.label;
                            $.post('/admin/recipe/updateIngredient', {ingredientStr: JSON.stringify(recipe.senders[0])}, function (message) {
                                console.log(message);
                            });

                        }
                    });
                options = [];
                receiverStorages.forEach(function (receiverStorage) {
                    options.push("<option value='" + receiverStorage.id + "'>" + receiverStorage.ident + "</option>");
                });
                $('#receiverStorages')
                    .append(options.join(""))
                    .selectmenu({
                        change: function (event, ui) {
                            recipe.receivers[0].StorageId = ui.item.value;
                            recipe.receivers[0].storageIdent = ui.item.label;
                            $('#receiver').val(ui.item.label);
                            getProduct(recipe.receivers[0].StorageId).then(function (productId) {
                                recipe.receivers[0].ProductId = productId;
                                console.log('receiver productid: ' + recipe.receivers[0].ProductId);
                                $.post('/admin/recipe/updateIngredient', {ingredientStr: JSON.stringify(recipe.receivers[0])}, function (message) {
                                    console.log(message);
                                    $('#infos').append('<li>' + message + '</li>');
                                });

                            });

                        }
                    });
            });
        });
    });

    // $('#checkJob').click(function () {
    //     $('#error').val('');
    //     $('#errors').empty();
    //     var jobId = $('#jobId').val();
    //     $.get('/job/jobDetail/checkJob/:' + jobId, function (data) {
    //         if (data.errors) {
    //             data.errors.forEach(function (error) {
    //                 $('#errors').append('<li>' + error + '</li>');
    //             });
    //         }
    //         if (data.info) {
    //             $('#infos').append('<li>' + data.info + '</li>');
    //         }
    //     });
    // });
    // $('#startJob').click(function () {
    //     $('#error').val('');
    //     var jobId = $('#jobId').val();
    //     $.get('/job/jobDetail/startJob/:' + jobId, function (data) {
    //         if (data.error) {
    //             $('#error').val(data.error);
    //         } else if (data.update && data.update.state) {
    //             $('#state').val(data.update.state);
    //         }
    //
    //     });
    // });
    $('#suspendJob').click(function () {
        //TODO
    });

    $('#doneJob').click(function () {
        $('#error').val('');
        var jobId = $('#jobId').val();
        $.get('/job/jobDetail/doneJob/:' + jobId, function (data) {
            if (data.error) {
                $('#error').val(data.error);
            }
            if (data.update) {
                $('#displayState').val(data.update.displayState);
                $('#state').val(data.update.state);
                setBKColor(data.update.state);
            }
            if(data.info){
                $('#infos').append('<li>' + data.info + '</li>');
            }
            setTimeout(function () {
                window.location.replace('/job/station/jobList/:' + lineIdent);
            },1000);

        });
    });
    $("form").submit(function (event) {
        console.log('prevent event');
        event.preventDefault();
        var jobInfo = {
            targetWeight: parseFloat($('#targetWeight').val()).toFixed(2),
            locked: $('#locked').prop('checked')
        };
        console.log('Job info: ');
        console.dir(jobInfo);
        $.post('/job/jobDetail/:' + $('#jobId').val(), jobInfo, function (data) {
            console.log(data);
            $('#infos').empty();
            if (!data.error) {
                $('#infos').append('<li>' + data.info + '</li>');
            } else {
                $('#errors').append('<li>' + data.error + '</li>');
            }
        });
    });
    function getProduct(storageId) {
        console.log("storageId: " + storageId);
        return new Promise(function (resolve, reject) {
            if (storageId) {
                $.get('/storage/getStorage/:' + storageId, function (data) {
                    if (!data.error) {
                        var productId = data.storage.ProductId;
                        console.log("productId: " + productId);
                        resolve(productId);
                        if (productId) {
                            $.get('/product/getProduct/:' + productId, function (data) {
                                if (!data.error) {
                                    product = data.product;
                                    console.log("product: ");
                                    console.dir(product);
                                    $('#productIdent').val(product.ident);
                                    $('#productName').val(product.name);
                                    $.post('/job/jobDetail/:' + $('#jobId').val(), {
                                        productIdent: product.ident,
                                        productName: product.name
                                    }, function (data) {
                                    });


                                } else {
                                    $('#error').html(data.error);

                                }
                            });
                        }

                    }
                    else {
                        console.log("error: " + data.error);
                        reject(data.error);
                    }

                });
            }
        });


    }

    $('#barcode').focus();
    $('#confirmBarcode').click(function () {
        var barcode = $('#barcode').val();
        _scaneBarcode(barcode);
    });
    function _scaneBarcode(barcode) {
        var jobId = $('#jobId').val();
        $('#barcode').attr('disabled', true);
        if (barcode) {
            $.get('/job/station/scanBarcode/:' + jobId + '/:' + barcode, function (data) {
                if (data) {
                    if (data.error) {
                        $('#errors').append('<li>' + data.error + '</li>');
                        console.log('Error:');
                        console.dir(data.error);
                    }else {
                        if (data.update) {
                            $('#displayState').val(data.update.displayState);
                            $('#state').val(data.update.state);
                            setBKColor(data.update.state);
                            $('#actualWeight').val(data.update.actualWeight);
                        }
                        if (data.info) {
                            $('#infos').append('<li>' + data.info + '</li>');
                        }
                        $('#barcode').val('');
                    }

                }
                $('#barcode').removeAttr('disabled');

            });
        }
    }


});

function setBKColor(state) {
    var color;
    switch (state) {
        case 15:
            //Error
            color = 'Red';
            break;
        case 30:
            //Loading
            color = 'LightGreen';
            break;
        case 40:
            //Active
            color = 'Green';
            break;
        case 50:
            //Suspended
            color = 'Pink';
            break;
        case 80:
            //Suspended
            color = 'Silver';
            break;

    }
    $('#displayState').css({'background-color': color});
}

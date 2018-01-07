/**
 * Created by pi on 8/30/16.
 */
$(function () {
    var job = {};

    var options = [];
    var processOrderId = $('#processOrderId').val();


    var products = JSON.parse($('#products').val());
    var productsForName =[];
    var mixers = JSON.parse($('#mixers').val());
    var productIdent = '';
    var productName = '';
    var supplierIdent = '';
    var supplierName = '';
    var selected = [];
    var orderItemsDataTable = $('#bomTable').DataTable();
    setBKColor($('#state').val());
    $('#15').html('the text is 15');
    options = [];
    products.forEach(function (product) {
        options.push("<option value='" + product.id + "'>" + product.ident + "</option>");
        productsForName[product.ident] = product.name;
    });
    $('#productsSelect')
        .append(options.join(""))
        .selectmenu({
            change: function (event, ui) {
                $('#productIdent').val(ui.item.label);
                $('#productId').val(ui.item.value);


            }
        });
    options = [];
    mixers.forEach(function (mixer) {
        options.push("<option value='" + mixer.id + "'>" + mixer.ident + "</option>");
    });
    $('#mixersSelect')
        .append(options.join(""))
        .selectmenu({
            change: function (event, ui) {
                var selectedMixerIdent = ui.item.label;
                $('#mixerIdent').val(selectedMixerIdent);
                if (selectedMixerIdent) {
                    $.get('/mixer/getLine/:' + selectedMixerIdent, function (data) {
                        if (data.error) {
                            $('#errors').append('<li>' + data.error + '</li>');
                        }
                        if (data.line) {
                            $('#lineIdent').val(data.line.ident);
                            $('#lineId').val(data.line.id);
                        }
                    });
                }else {
                    $('#lineIdent').val('');
                    $('#lineId').val('');

                }


            }
        });
    $('#bomTable tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selected.pop();
            $(this).find('input[type="number"]').attr('disabled', true);
        }
        else {
            orderItemsDataTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            console.log('id: ' + this.id);
            selected.pop();
            selected.push(this.id);
            console.log('selected');
            console.dir(selected);
            // console.dir(this);
            // console.dir($(this).find('input[type="number"]'));
            $(this).find('input[type="number"]').attr('disabled', false);
        }
    });
    $('#newItem').click(function () {
        $.get('/order/process/createNewItem/:' + processOrderId, function (data) {
            var newOrderItem = null;
            console.log('data: ' + data);
            if (!data.error) {
                newOrderItem = data.newOrderItem;
                console.log('newOrderItem: ' + newOrderItem);
                console.log('newOrderItem id: ' + newOrderItem.id);
                var rowNode = orderItemsDataTable.row.add([
                    newOrderItem.productIdent,
                    '<input type="text" value="' + newOrderItem.targetWeight + '" disabled>',
                    '<input type="number" value="' + newOrderItem.targetPercentage + '" disabled>'
                ]).draw(false).node();
                $(rowNode).attr('id', newOrderItem.id);
            } else {
                $('#errors').append('<li>' + data.error + '</li>');
            }

        });
    });
    $('#removeItem').click(function () {


        $('#errors').empty();
        $('#infos').empty();
        if (selected.length > 0) {
            var toDeleteOrderItemIdsStr = JSON.stringify(selected);
            console.log('toDeleteOrderItemIdsStr: ' + toDeleteOrderItemIdsStr);
            orderItemsDataTable.row('.selected').remove().draw(false);
            $.post('/order/process/deleteOrderItem', {toDeleteOrderItemIdsStr: toDeleteOrderItemIdsStr}, function (data) {
                console.log(data);
                if (data.error) {
                    $('#errors').append('<li>' + data.error + '</li>');
                }
                if (data.info) {
                    $('#infos').append('<li>' + data.info + '</li>');
                }
            });
        } else {
            $('#errors').append('<li>No row selected</li>');
        }
    });

    $.get('/product/getProductList/:0', function (data) {
        console.log(data);
        options = [];
        if (data.products) {
            data.products.forEach(function (product) {
                options.push("<option value='" + product.id + "'>" + product.ident + "</option>");
            })
            $('#rawProducts')
                .append(options.join(""))
                .selectmenu({
                    change: function (event, ui) {
                        //TODO: save product to orderItem
                        if (selected.length > 0) {
                            var itemId = selected[0];
                            $('#' + itemId).find('label').html(ui.item.label);
                            console.log('label: ');
                            console.dir($('#' + itemId).find('label'));
                            console.log('text: ');
                            console.dir($('#' + itemId).find('input[type="text"]'));
                            var orderItemInfo = {
                                productIdent: ui.item.label,
                                ProductId: ui.item.value
                            };
                            $.post('/order/process/orderItem/:' + itemId, {orderItemInfo: orderItemInfo}, function (data) {
                                if (data.error) {
                                    $('#errors').append('<li>' + data.error + '</li>');
                                }
                                if (data.info) {
                                    $('#infos').append('<li>' + data.info + '</li>');


                                }
                            });
                        } else {
                            $('#errors').append('<li>Please select item.</li>');
                        }
                        // $.post('/admin/recipe/updateIngredient', {ingredientStr: JSON.stringify(recipe.senders[0])}, function (message) {
                        //     console.log(message);
                        // });

                    }
                });
        }
    });

    function getValidNumber(value) {
        console.log('value: ' + value);
        return value || 0;

    }

    $("form").submit(function (event) {
        console.log('prevent event');
        event.preventDefault();
        var productId = parseInt(getValidNumber($('#productId').val()));
        var productIdent = $('#productIdent').val();
        var lineId = parseInt(getValidNumber($('#lineId').val()));
        var lineIdent = $('#lineIdent').val();
        var mixerIdent = $('#mixerIdent').val();
        var processOrderInfo = {
            name: $('#name').val(),
            targetWeight: parseFloat(getValidNumber($('#targetWeight').val())).toFixed(2),
            packSize: parseFloat(getValidNumber($('#packSize').val())).toFixed(2),
            mixingTime: parseFloat(getValidNumber($('#mixingTime').val())).toFixed(2)
        };
        if (productId && productId > 0) {
            processOrderInfo.ProductId = productId;
            processOrderInfo.productIdent = productIdent;
            processOrderInfo.productName = productsForName[productIdent];
        }
        if (lineId > 0) {
            processOrderInfo.LineId = lineId;
            processOrderInfo.lineIdent = lineIdent;
            processOrderInfo.mixerIdent = mixerIdent;
        }
        console.log('processOrder info: ');
        console.dir(processOrderInfo);
        $.post('/order/process/processOrderDetail/:' + processOrderId, {processOrderInfo: processOrderInfo}, function (data) {
            console.log(data);
            $('#infos').empty();
            $('#errors').empty();
            if (!data.error) {
                $('#infos').append('<li>' + data.info + '</li>');
            } else {
                $('#errors').append('<li>' + data.error + '</li>');
            }
        });
    });
    $('#bomTable').on('keypress', 'tbody td input', function (event) {
        //console.dir(orderItemsDataTable.cell(this).data(10));
        var code = event.charCode || event.keyCode;
        var me = this;
        console.log('code: ' + code);
        console.log('this: ');
        console.dir(this);
        if (code === 13) {
            var itemTargetPercentage = $(this).val();
            var orderTargetWeight = $('#targetWeight').val();
            if (orderTargetWeight > 0) {
                var itemTargetWeight = orderTargetWeight * itemTargetPercentage * 0.01;
                console.log('selected parent');
                console.dir($(me).parent());
                console.log('selected brother');
                console.dir($(me).parent().find('input[type="text"]'));
                $(me).parent().parent().find('input[type="text"]').val(itemTargetWeight);
                var itemId = selected[0];
                var orderItemInfo = {
                    targetWeight: itemTargetWeight,
                    targetPercentage: itemTargetPercentage
                };
                $.post('/order/process/orderItem/:' + itemId, {orderItemInfo: orderItemInfo}, function (data) {
                    if (data.error) {
                        $('#errors').append('<li>' + data.error + '</li>');
                    }
                    if (data.info) {
                        $('#infos').append('<li>' + data.info + '</li>');


                    }
                });
                calculateTotalPer();
            }

        }

    });
    $('#checkProcessOrder').click(function () {
        $.get('/order/process/checkProcessOrder/:' + processOrderId, function (data) {
            console.log(data);
            $('#errors').empty();
            $('#infos').empty();
            if (data.info) {
                $('#infos').append('<li>' + data.info + '</li>');
            }
            if (data.errors) {
                data.errors.forEach(function (error) {
                    $('#errors').append('<li>' + error + '</li>');
                });
            }
        });
    });
    $('#releaseProcessOrder').click(function () {
        $.get('/order/process/releaseProcessOrder/:' + processOrderId, function (data) {
            console.log(data);
            $('#errors').empty();
            $('#infos').empty();
            if (data.info) {
                $('#infos').append('<li>' + data.info + '</li>');
            }
            if (data.error) {
                $('#infos').append('<li>' + data.error + '</li>');
            }
            if (data.errors) {
                data.errors.forEach((function (error) {
                    $('#errors').append('<li>' + error + '</li>');
                }));
            }
            if (data.update) {
                $('#displayState').val(data.update.displayState);
                $('#state').val(data.update.state);
                setBKColor(data.update.state);
            }
        });
    });
    calculateTotalPer();
});

function calculateTotalPer() {
    var totalPer = 0;
    var pers = $('#bomTable tbody').find('tr td input[type=number]');
    var length = pers.length;
    for(var i =0; i<length;i++){
        var targetPercentage = pers[i];
        totalPer += parseFloat($(targetPercentage).val());
    }
    $('#total').val(totalPer);
}
function setBKColor(state) {
    var color;
    switch (state) {
        case 10:
        case '10':
            //Error
            color = 'LightGreen';
            break;
        case 15:
        case '15':
            //Error
            color = 'Red';
            break;
        case 20:
        case '20':
            //Loading
            color = 'Green';
            break;
        case 80:
        case '80':
            //Suspended
            color = 'Silver';
            break;

    }
    $('#displayState').css({'background-color': color});
}


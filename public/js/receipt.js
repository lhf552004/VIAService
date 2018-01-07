/**
 * Created by pi on 8/30/16.
 */
$(function () {
    var job = {};

    var options = [];

    var lineIdent = $('#lineIdent').val();
    //var receipt = JSON.parse($('#receipt').val());
    var packingCategory = JSON.parse($('#packingCategory').val());
    var products = JSON.parse($('#products').val());
    var companyList = JSON.parse($('#companys').val());


    var supplierId = parseInt($('#supplierId').val());
    var productId = parseInt($('#productId').val());
    var productIdent = '';
    var productName = '';
    var supplierIdent = '';
    var supplierName = '';
    var packagingType = parseInt($('#packagingType').val());
    console.log('supplierId: ' + supplierId);
    console.log('productId: ' + productId);
    console.log('packagingType: ' + packagingType);

    companyList.forEach(function (company) {
        if (supplierId && supplierId === company.id) {
            console.log('supplierName: ' + company.name);
            $('#supplierName').val(company.name);
        }
        options.push("<option value='" + company.id + "'>" + company.name + "</option>");
    });
    $('#suppliers')
        .append(options.join(""))
        .selectmenu({
            change: function (event, ui) {
                $('#supplierName').val(ui.item.label);
                $('#supplierId').val(ui.item.value);
                // $.post('/admin/recipe/updateIngredient', {ingredientStr: JSON.stringify(recipe.senders[0])}, function (message) {
                //     console.log(message);
                // });

            }
        });


    options = [];
    packingCategory.forEach(function (category) {
        if (packagingType && packagingType === category.value) {
            console.log('packagingType: ' + category.name);
            $('#packagingTypeName').val(category.name);
        }
        options.push("<option value='" + category.value + "'>" + category.name + "</option>");
    });
    $('#packagingTypes')
        .append(options.join(""))
        .selectmenu({
            change: function (event, ui) {
                $('#packagingTypeName').val(ui.item.label);
                $('#packagingType').val(ui.item.value);
                // $.post('/admin/recipe/updateIngredient', {ingredientStr: JSON.stringify(recipe.senders[0])}, function (message) {
                //     console.log(message);
                // });

            }
        });
    options = [];
    products.forEach(function (product) {
        if (productId && productId === product.id) {
            console.log('productName: ' + product.name);
            $('#productName').val(product.name);
        }
        options.push("<option value='" + product.id + "'>" + product.ident + "</option>");
    });
    $('#productsSelect')
        .append(options.join(""))
        .selectmenu({
            change: function (event, ui) {
                $('#productName').val(ui.item.label);
                $('#productId').val(ui.item.value);
                // $.post('/admin/recipe/updateIngredient', {ingredientStr: JSON.stringify(recipe.senders[0])}, function (message) {
                //     console.log(message);
                // });

            }
        });
    function changeWeight() {
        var actualUnitSize = parseFloat($('#actualUnitSize').val()).toFixed(2);
        var actualNbOfUnits = parseFloat($('#actualNbOfUnits').val()).toFixed(2);
        $('#actualWeight').val(actualUnitSize * actualNbOfUnits);
    }

    function getIdentAndName(items, id, category) {
        items.forEach(function (item) {
            if (item.id === id) {
                switch (category) {
                    case 'product':
                        productIdent = item.ident;
                        productName = item.name;
                        break;
                    case 'supplier':
                        supplierIdent = item.ident;
                        supplierName = item.name;
                        break;
                }
                return false;
            }
        })
    }

    $('#actualUnitSize').change(changeWeight);
    $('#actualNbOfUnits').change(changeWeight);
    function getValidNumber(value) {
        console.log('value: ' + value);
        return value || 0;

    }

    $("form").submit(function (event) {
        console.log('prevent event');
        event.preventDefault();
        var receiptInfo = {
            name: $('#name').val(),
            actualWeight: parseFloat(getValidNumber($('#actualWeight').val())).toFixed(2),
            actualUnitSize: parseFloat(getValidNumber($('#actualUnitSize').val())).toFixed(2),
            actualNbOfUnits: parseFloat(getValidNumber($('#actualNbOfUnits').val())).toFixed(2),
            packagingType: parseInt(getValidNumber($('#packagingType').val())),
            lot: $('#lot').val()
        };
        productId = parseInt(getValidNumber($('#productId').val()));
        supplierId = parseInt(getValidNumber($('#supplierId').val()));
        if (productId > 0) {
            getIdentAndName(products, productId, 'product');
            receiptInfo.ProductId = productId;
            receiptInfo.productIdent = productIdent;
            receiptInfo.productName = productName;
        }
        if (supplierId > 0) {
            getIdentAndName(companyList, supplierId, 'supplier');
            receiptInfo.SupplierId = supplierId;
            receiptInfo.supplierIdent = supplierIdent;
            receiptInfo.supplierName = supplierName;
        }
        console.log('receipt info: ');
        console.dir(receiptInfo);
        $.post('/receipt/receiptDetail/:' + $('#receiptId').val(), {receiptInfo: receiptInfo}, function (data) {
            console.log(data);
            $('#infos').empty();
            if (!data.error) {
                $('#infos').append('<li>' + data.info + '</li>');
            } else {
                $('#errors').append('<li>' + data.error + '</li>');
            }
        });
    });

    $('#confirmReceipt').click(function () {
        $.get('/receipt/confirmReceipt/:' + $('#receiptId').val(), function (data) {
            console.log(data);
            $('#infos').empty();
            if (!data.errors) {
                $('#infos').append('<li>' + data.info + '</li>');
                window.location.replace("/station/receipt/receiptList");
            } else {
                data.errors.forEach((function (error) {
                    $('#errors').append('<li>' + data.error + '</li>');
                }));
            }
        });

    });
});


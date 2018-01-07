/**
 * Created by pi on 8/30/16.
 */
$(function () {
    var job = {};

    var options = [];
    var recipeId = $('#recipeId').val();
    //
    //
    // var products = JSON.parse($('#products').val());
    // var productsForName =[];
    // var mixers = JSON.parse($('#mixers').val());
    var productIdent = '';
    var productName = '';
    var supplierIdent = '';
    var supplierName = '';
    var selected = [];
    var parameterSelected = [];
    var rawProducts = [];
    var sendersDataTable = $('#sendersTable').DataTable();
    var receiversDataTable = $('#receiversTable').DataTable();
    var jobParametersDataTable = $('#jobParametersTable').DataTable();

    $('#sendersTable tbody').on('click', 'tr', function () {
        console.log(sendersDataTable.row(this).data());
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selected.pop();
            $(this).find('input').attr('disabled', true);
        }
        else {
            sendersDataTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            console.log('id: ' + this.id);
            selected.pop();
            selected.push(this.id);
            console.log('selected');
            console.dir(selected);
            // console.dir(this);
            // console.dir($(this).find('input[type="number"]'));
            $(this).find('input').attr('disabled', false);
        }
    });
    $('#sendersTable tbody').on('keypress', 'tr', function () {
        var id = this.id;
        var data = sendersDataTable.row(this).data();
        var productIdent = $(data[0]).val();
        var storageIdent = $(data[1]).val();
        var targetPercentage = $(data[2]).val();
        var ingredient = {
            id: id,
            productIdent: productIdent,
            storageIdent: storageIdent,
            targetPercentage: targetPercentage
        };
        $.post('/admin/recipe/updateIngredient', {ingredientStr: JSON.stringify(ingredient)}, function (data) {
            if (data.error) {
                $('#errors').append('<li>' + data.error + '</li>');
            }
            if (data.info) {
                $('#infos').append('<li>' + data.info + '</li>');
            }
        });
    });
    $('#jobParametersTable tbody').on('click', 'tr', function () {
        console.log(jobParametersDataTable.row(this).data());
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            parameterSelected.pop();
            $('#parameterForm').addClass('hidden');
        }
        else {
            jobParametersDataTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            console.log('id: ' + this.id);
            parameterSelected.pop();
            parameterSelected.push(this.id);
            $('#parameterForm').addClass('hidden');
            $.get('/admin/recipe/jobParameterDetail/:' + this.id, function (data) {
                var theParameter;
                if(data.theJobParameter){
                    theParameter = data.theJobParameter;
                    $('#paraIdent').val(theParameter.ident);
                    $('#paraId').val(theParameter.id);
                    $('#paraName').val(theParameter.name);
                    $('#paraNodeId').val(theParameter.nodeId);
                    $('#paraNodeValue').val(theParameter.nodeValue);
                    $('#paraType').val(theParameter.type);
                    $('#parameterForm').removeClass('hidden');
                }
                if(data.error){
                    $('#errors').append('<li>' + data.error + '</li>');
                }
            });
            console.log('parameterSelected');
            console.dir(parameterSelected);
            // console.dir(this);
            // console.dir($(this).find('input[type="number"]'));
            $(this).find('input').attr('disabled', false);
        }
    });
    $.get('/product/getProductList/:0', function (data) {
        console.log(data);
        options = [];
        if (data.products) {
            data.products.forEach(function (product) {
                // rawProducts[product.id] = product.ident;
                rawProducts.push(product.ident);
                options.push("<option value='" + product.id + "'>" + product.ident + "</option>");
            });
            console.log(rawProducts);
            $('input.autoComplete').autocomplete({
                source: rawProducts
            });
        }
    });
    $('#createParameter').click(function () {
        $.get('/admin/recipe/createJobParameter/:' + recipeId, function (data) {
            var newParameter = null;
            console.log('data: ' + data);
            if (!data.error) {
                newParameter = data.newParameter;
                console.log('newParameter: ' + newParameter);
                console.log('newParameter id: ' + newParameter.id);
                var rowNode = jobParametersDataTable.row.add([
                    newParameter.ident,
                    newParameter.name
                ]).draw(false).node();
                $(rowNode).attr('id', newParameter.id);
            } else {
                $('#errors').append('<li>' + data.error + '</li>');
            }

        });
    });
    $('#removeParameter').click(function () {
        $('#errors').empty();
        $('#infos').empty();
        if (parameterSelected.length > 0) {
            var toDeleteParameterIdsStr = JSON.stringify(parameterSelected);
            console.log('toDeleteParameterIdsStr: ' + toDeleteParameterIdsStr);
            jobParametersDataTable.row('.selected').remove().draw(false);
            $.post('/admin/recipe/deleteJobParameter', {toDeleteParameterIdsStr: toDeleteParameterIdsStr}, function (data) {
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
    function getValidNumber(value) {
        console.log('value: ' + value);
        return value || 0;

    }

    $("#recipeForm").submit(function (event) {
        console.log('prevent event');
        event.preventDefault();
        var recipeId = parseInt(getValidNumber($('#recipeId').val()));
        var recipeInfo = {
            name: $('#name').val(),
            isProduced: $('#isProduced').prop('checked')
        };
        console.log('recipe info: ');
        console.dir(recipeInfo);
        $.post('/admin/recipe/recipeDetail/:' + recipeId, {recipeInfo: recipeInfo}, function (data) {
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
    $('#sendersTable').on('keypress', 'tbody td input', function (event) {

    });

    calculateTotalPer();


});

function calculateTotalPer() {
    var totalPer = 0;
    var pers = $('#bomTable tbody').find('tr td input[type=number]');
    var length = pers.length;
    for (var i = 0; i < length; i++) {
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


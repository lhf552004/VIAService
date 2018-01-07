/**
 * Created by pi on 8/30/16.
 */
$(function () {

    setBKColor($('#state').val());





    function getValidNumber(value) {
        console.log('value: ' + value);
        return value || 0;

    }

    $("form").submit(function (event) {
        console.log('prevent event');
        event.preventDefault();
        var productId = $('#productId').val();

        var productInfo = {
            name: $('#name').val(),
            unitSize:  parseFloat($('#unitSize').val()),
            shelfLife:  parseInt($('#shelfLife').val()),
            positiveDeviation:  parseFloat($('#positiveDeviation').val()),
            negativeDeviation:  parseFloat($('#negativeDeviation').val())
        };
        console.log('productInfo: ');
        console.dir(productInfo);
        if (productId && productId > 0) {
            $.post('/product/productDetail/:' + productId, {productInfo: productInfo}, function (data) {
                console.log(data);
                $('#infos').empty();
                $('#errors').empty();
                if (!data.error) {
                    $('#infos').append('<li>' + data.info + '</li>');
                } else {
                    $('#errors').append('<li>' + data.error + '</li>');
                }
            });
        }



    });
});

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


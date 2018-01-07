/**
 * Created by pi on 8/30/16.
 */
$(function () {

    setBKColor($('#state').val());




    $('#categorySelect')
        .selectmenu({
            change: function (event, ui) {
                $('#displayCategory').val(ui.item.label);
                $('#category').val(ui.item.value);
            }
        });
    function getValidNumber(value) {
        console.log('value: ' + value);
        return value || 0;

    }

    $("form").submit(function (event) {
        console.log('prevent event');
        event.preventDefault();
        var sectionId = $('#sectionId').val();

        var sectionInfo = {
            id: parseInt(sectionId),
            name: $('#name').val(),
            nodeId: $('#nodeId').val(),
            category: $('#category').val()
        };
        console.log('sectionInfo: ');
        console.dir(sectionInfo);
        if (sectionId && sectionId > 0) {
            $.post('/section/sectionDetail/:' + sectionId, {sectionInfo: sectionInfo}, function (data) {
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
    $('#reset').click(function () {
        var sectionId = $('#sectionId').val();
        $.get('/section/sectionDetail/reset/:' + sectionId, function (data) {
            if (!data.error) {
                $('#infos').append('<li>' + data.info + '</li>');
            } else {
                $('#errors').append('<li>' + data.error + '</li>');
            }
        });
    })
});

function setBKColor(state) {
    var color;
    switch (state) {
        case 10:
        case '10':
            //Error
            color = 'Gray';
            break;
        case 80:
        case '80':
            //Error
            color = 'Red';
            break;
        case 30:
        case '30':
            //Loading
            color = 'Green';
            break;
        case 40:
        case '40':
            //Suspended
            color = 'Blue';
            break;

    }
    $('#displayState').css({'background-color': color});
}


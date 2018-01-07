/**
 * Created by pi on 9/24/16.
 */
$(function () {
    var logisticUnitsDataTable = $('#logisticUnitsTable').DataTable();
    var selected = [];
    $('#newLogisticUnit').click(function () {
        //TODO: new logisticUnit
    });
    $('#logisticUnitsTable tbody').on('click', 'tr', function () {
        var id = this.id;
        var index = $.inArray(id, selected);

        if (index === -1) {
            selected.push(id);
        } else {
            selected.splice(index, 1);
        }
        console.log('id: ');
        console.log(selected);
        $(this).toggleClass('selected');
    });
    $('#deleteLogisticUnit').click(function () {
        $('#errors').empty();
        $('#infos').empty();
        if (selected.length > 0) {
            var toDeleteLogisticUnitIdsStr = JSON.stringify(selected);
            console.log('toDeleteLogisticUnitIdsStr: ' + toDeleteLogisticUnitIdsStr);
            logisticUnitsDataTable.row('.selected').remove().draw(false);
            //TODO: delete logisticUnit
            // $.post('/order/process/processOrderList/deleteProcessOrder', {toDeleteProcessOrderIdsStr: toDeleteProcessOrderIdsStr}, function (data) {
            //     console.log(data);
            //     if (data.error) {
            //         $('#errors').append('<li>' + data.error + '</li>');
            //     }
            //     if (data.info) {
            //         $('#infos').append('<li>' + data.info + '</li>');
            //     }
            // });
        } else {
            $('#errors').append('<li>No row selected</li>');
        }

    });

});
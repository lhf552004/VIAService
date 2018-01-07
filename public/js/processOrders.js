/**
 * Created by pi on 9/17/16.
 */
$(function () {
    var processOrdersDataTable = $('#processOrdersTable').DataTable();
    var selected = [];
    $('#newProcessOrder').click(function () {
        $.get('/order/process/createProcessOrder', function (data) {
            var newProcessOrder = null;
            console.log('data: ' + data);
            if (!data.error) {
                newProcessOrder = data.processOrder;
                console.log('newProcessOrder: ' + newProcessOrder);
                console.log('newProcessOrder id: ' + newProcessOrder.id);
                console.log('newProcessOrder State: ' + newProcessOrder.displayState);
                var rowNode = processOrdersDataTable.row.add([
                    '<a href="/order/process/processOrderDetail/:' + newProcessOrder.id + '">' + newProcessOrder.ident + '</a>',
                    newProcessOrder.productIdent,
                    newProcessOrder.targetWeight,
                    newProcessOrder.mixerIdent
                ]).draw(false).node();
                $(rowNode).attr('id', newProcessOrder.id);

            } else {
                $('#errors').append('<li>' + data.error + '</li>');
            }

        });
    });
    $('#processOrdersTable tbody').on('click', 'tr', function () {
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
    $('#deleteProcessOrder').click(function () {
        $('#errors').empty();
        $('#infos').empty();
        if (selected.length > 0) {
            var toDeleteProcessOrderIdsStr = JSON.stringify(selected);
            console.log('toDeleteProcessOrderIdsStr: ' + toDeleteProcessOrderIdsStr);
            processOrdersDataTable.row('.selected').remove().draw(false);
            $.post('/order/process/processOrderList/deleteProcessOrder', {toDeleteProcessOrderIdsStr: toDeleteProcessOrderIdsStr}, function (data) {
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

});
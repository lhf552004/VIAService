/**
 * Created by pi on 9/17/16.
 */
$(function () {
    var receiptsDataTable = $('#receiptsTable').DataTable();
    var selected = [];
    $('#newReceipt').click(function () {
        $.get('/order/receipt/createReceipt', function (data) {
            var newReceipt = null;
            console.log('data: ' + data);
            if (!data.error) {
                newReceipt = data.receipt;
                console.log('newReceipt: ' + newReceipt);
                console.log('newReceipt id: ' + newReceipt.id);
                console.log('newReceipt State: ' + newReceipt.packagingTypeName);
                var rowNode = receiptsDataTable.row.add([
                    '<a href="/order/receipt/receiptDetail/:' + newReceipt.id + '">' + newReceipt.ident + '</a>',
                    newReceipt.productIdent,
                    newReceipt.actualUnitSize,
                    newReceipt.packagingTypeName
                ]).draw(false).node();
                $(rowNode).attr('id', newReceipt.id);

            } else {
                $('#errors').append('<li>' + data.error + '</li>');
            }

        });
    });
    $('#receiptsTable tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selected.pop();
        }
        else {
            receiptsDataTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            console.log('id: ' + this.id);
            selected.pop();
            selected.push(this.id);
            console.log('selected');
            console.dir(selected);
        }
    });
    $('#deleteReceipt').click(function () {
        $('#errors').empty();
        $('#infos').empty();
        if (selected.length > 0) {
            var toDeleteReceiptIdsStr = JSON.stringify(selected);
            console.log('toDeleteReceiptIdsStr: ' + toDeleteReceiptIdsStr);
            receiptsDataTable.row('.selected').remove().draw(false);
            $.post('/order/receipt/receiptList/deleteReceipt', {toDeleteReceiptIdsStr: toDeleteReceiptIdsStr}, function (data) {
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
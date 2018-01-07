/**
 * Created by pi on 8/2/16.
 */
/**
 * Created by Operator on 5/13/2016.
 */

var receiptApp = angular.module('receiptApp', []);
receiptApp.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
receiptApp.controller('ReceiptListCtrl', function ($scope, $http, $filter) {

    $scope.selectedAll = false;
    $scope.receipts =[];
    $scope.state = -1;
    var receiptsStr = $("#receipts").val();
    console.log("receiptsStr: " + receiptsStr);
    $scope.receipts = JSON.parse($("#receipts").val());
    $scope.state = $("#state").val();
    console.log("receipts: " + $scope.receipts);
    console.log("state: " + $scope.state);
    $scope.result = "";

    //$scope functions
    $scope.createReceipt = createReceipt;


    //function defintions
    function createReceipt() {
        console.log("create receipt.... ");
        $.getJSON('/warehouse/createReceipt', function (newReceipt) {
            console.log('newReceipt: ' + newReceipt);
            console.log('newReceipt id: ' + newReceipt.id);
            $scope.receipts.push(newReceipt);
            window.location.replace("/warehouse/receiptList/:"+$scope.state);
        });
    }

    $scope.remove = function () {
        var toDeleteIds = [];
        var remainreceipts = [];
        $scope.selectedAll = false;
        angular.forEach($scope.receipts, function (selectedRecipe) {
            if (selectedRecipe.selected) {
                toDeleteIds.push(selectedRecipe.id);
            } else {
                remainreceipts.push(selectedRecipe);
            }
        });
        $scope.receipts = remainreceipts;
        var toDeleteReceiptIdsStr = JSON.stringify(toDeleteIds);
        $.post('/warehouse/receiptList/deleteReceipt',{toDeleteReceiptIdsStr:toDeleteReceiptIdsStr}, function (data) {
            console.log(data);
        });

    };
    $scope.checkAll = function () {
        // if (!$scope.selectedAll) {
        //     $scope.selectedAll = true;
        // } else {
        //     $scope.selectedAll = false;
        // }
        angular.forEach($scope.receipts, function (receipt) {
            receipt.selected = $scope.selectedAll;
        });
    };


});
receiptApp.controller('ReceiptDetailCtrl', function ($scope, $http, $filter) {


    $scope.receipt = JSON.parse($("#receipt").val());
    console.log('packingCategory: ' + $("#packingCategory").val());
    $scope.packingCategoryOptions = JSON.parse($("#packingCategory").val());
    $scope.products = JSON.parse($("#products").val());
    $scope.companys = JSON.parse($("#companys").val());

    console.log('products: ' + $("#products").val());
    console.log('companys: ' + $("#companys").val());

    console.log('receipt' + $scope.receipt);
    $scope.result = "";

    $scope.update = function () {
        var receiptStr = JSON.stringify($scope.receipt);
        $.post('/warehouse/receiptDetail',{receiptStr:receiptStr}, function (message) {
            console.log(message);
            $scope.result = message;
            window.location.replace("/warehouse/receiptList/:" +$scope.receipt.State);
        },'json');
    };
    $scope.change = function () {
        var actualUnitSize = $scope.receipt.ActualUnitSize;
        var actualNbOfUnits = $scope.receipt.ActualNbOfUnits;
        $scope.receipt.ActualWeight = actualUnitSize * actualNbOfUnits;
    };
    $scope.confirmReceipt = function () {
        $.get('/warehouse/confirmReceipt/:' + $scope.receipt.id, function (data) {
           console.log('data:  ' + data);
        });
    };


    function getWarehouseTypeOptions () {
        var options =[];
        for(var pro in WarehousePackingType){
            if(WarehousePackingType.hasOwnProperty(pro)){
                var option ={};
                option.name =pro;
                option.value = WarehousePackingType[pro];
                options.push(option);
                console.log('option: ' + JSON.stringify(option));
            }

        }
        return options;
    }

});
receiptApp.filter('getByLabel', function () {
    return function (input, label) {
        var i = 0, len = input.length;
        for (; i < len; i++) {
            if (input[i].label == label) {
                return input[i];
            }
        }
        return null;
    }
});



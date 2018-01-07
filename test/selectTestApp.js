/**
 * Created by pi on 8/29/16.
 */
var selectTestApp = angular.module('selectTestApp', []);
selectTestApp.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
selectTestApp.controller('SelectTestCtrl', function ($scope, $http, $filter) {

    //internal variables


    var gateStorages =[];
    var bulkStorages =[];
    // $scope.job = JSON.parse($("#job").val());
    $scope.senderStorages =[];
    $scope.receiverStorages =[];
    $scope.line = {};

    $.get('localhost:3000/storage/getStorageList/:' + 1, function (storagesOfGate) {
        console.log('storagesOfGate');
        console.log(storagesOfGate);
        gateStorages = storagesOfGate;

        $.get('172.26.203.71:3000/storage/getStorageList/:' + 10, function (storagesOfBulk) {
            console.log('storagesOfBulk');
            console.log(storagesOfBulk);
            bulkStorages = storagesOfBulk;



            $.get('172.26.203.71:3000/line/getLine/:' + $scope.job.LineId, function (data) {
                console.log('line data');
                console.dir(data);
                if(!data.error){
                    $scope.line = data.line;
                    if($scope.line.category === 1){
                        $scope.senderStorages = gateStorages;
                        $scope.receiverStorages = bulkStorages;
                    }
                    else {
                        $scope.senderStorages = bulkStorages;
                        $scope.receiverStorages = gateStorages;
                    }

                }
            });
        });
    });

});
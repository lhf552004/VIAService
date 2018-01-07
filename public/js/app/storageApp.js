/**
 * Created by pi on 8/2/16.
 */
/**
 * Created by Operator on 5/13/2016.
 */

var storageApp = angular.module('storageApp', []);
storageApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
storageApp.controller('StorageListCtrl', function ($scope, $http, $filter) {


    $scope.storages = JSON.parse($("#storages").val());
    $scope.result = "";
    // $scope.recipes = [
    //     {
    //         Ident: '001',
    //         Name: 'INT1 recipe template',
    //         LineIdent: 'INT1'
    //     },
    //     {
    //         Ident: '002',
    //         Name: 'INT2 recipe template',
    //         LineIdent: 'INT2'
    //     },
    //     {
    //         Ident: '003',
    //         Name: 'MIX1 recipe template',
    //         LineIdent: 'MIX1'
    //     }
    // ];
    //$scope functions
    $scope.createStorage = createStorage;


    //function defintions
    function createStorage() {
        $.getJSON('/storage/storageList/createStorage',function (newLine) {
            console.log('newLine: ' + newLine);
            console.log('newLine id: ' + newLine.id);
            $scope.lines.push(newLine);
            window.location.replace("/line/lineList");
        });
    }
    $scope.remove = function(){
        var toDeleteLineIds=[];
        var remainLines=[];
        $scope.selectedAll = false;
        angular.forEach($scope.lines, function(selectedLine){
            if(selectedLine.selected){
                toDeleteLineIds.push(selectedLine.id);
            }else {
                remainLines.push(selectedLine);
            }
        });
        $scope.lines = remainLines;
        var toDeleteLineIdsStr = JSON.stringify(toDeleteLineIds);
        $.post('/line/lineList/deleteLine',{toDeleteLineIdsStr:toDeleteLineIdsStr}, function (data) {
            console.log(data);
        });
    };
    $scope.checkAll = function () {

        angular.forEach($scope.lines, function (line) {
            line.selected = $scope.selectedAll;
        });
    };


});
storageApp.controller('StorageDetailCtrl', function ($scope, $http, $filter) {
    $scope.storage ={};
    var storageFromServer = $("#storage").val();
    if(storageFromServer){
        $scope.storage = JSON.parse();
    }
    else{
        var delay=1000; //1 second

        setTimeout(function() {
            //your code to be executed after 1 second
            window.location.replace("/storage/storageList");
        }, delay);

    }
    // $scope.recipe = {
    //     id: $("#id").val(),
    //     Ident: $("#Ident").val(),
    //     Name: $("#Name").val(),
    //     JobIdent: $("#JobIdent").val(),
    //     LineIdent: $("#LineIdent").val(),
    //     SenderList: $("#SenderList").val(),
    //     ReceiverList: $("#ReceiverList").val()
    // };
    //console.log($("#recipe").val());
    console.log($scope.storage);
    $scope.result = "";

    //
    // $scope.update = function () {
    //     var lineStr = JSON.stringify($scope.storage);
    //     console.log('lineStr' + lineStr);
    //     $.post('/line/LineDetail',{lineStr:lineStr}, function (message) {
    //         console.log(message);
    //         $scope.result = message;
    //         window.location.replace("/line/LineList");
    //     },'json');
    // }

});
storageApp.filter('getByLabel', function () {
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



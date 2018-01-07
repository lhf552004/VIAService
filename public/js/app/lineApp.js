/**
 * Created by pi on 8/2/16.
 */
/**
 * Created by Operator on 5/13/2016.
 */

var lineApp = angular.module('lineApp', []);
lineApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
lineApp.controller('LineListCtrl', function ($scope, $http, $filter) {


    $scope.lines = JSON.parse($("#lines").val());
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
    $scope.createLine = createLine;


    //function defintions
    function createLine() {
        $.getJSON('/line/lineList/createLine',function (newLine) {
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
lineApp.controller('LineDetailCtrl', function ($scope, $http, $filter) {

    $scope.line = JSON.parse($("#line").val());
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
    console.log($scope.line);
    $scope.result = "";


    $scope.update = function () {
        var lineStr = JSON.stringify($scope.line);
        console.log('lineStr' + lineStr);
        $.post('/line/lineDetail',{lineStr:lineStr}, function (message) {
            console.log(message);
            $scope.result = message;
            window.location.replace("/line/lineList");
        },'json');
    }

});
lineApp.filter('getByLabel', function () {
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



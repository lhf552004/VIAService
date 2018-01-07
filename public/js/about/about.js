var myApp = angular.module('myApp', []);
myApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
myApp.controller('myCtrl', function ($scope) {
    $scope.lucky =  $('#data').val();
    console.log($scope.lucky );
    $scope.update= function () {
        $scope.lucky = 'hello world, lucky guy!';
    };


});
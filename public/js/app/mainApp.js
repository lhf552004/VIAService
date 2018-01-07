/**
 * Created by pi on 8/8/16.
 */

var mainApp = angular.module('mainApp', []);
mainApp.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
mainApp.controller('MainCtrl', function ($scope, $http, $filter) {


    // $http.get('/admin/recipe/RecipeList/data').success(function (recipes) {
    //     console.log('recipes: ' + recipes);
    //     $scope.recipes = recipes;
    // });
    //var recipesStr = JSON.parse($("#recipes").val());

});


mainApp.filter('getByLabel', function () {
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



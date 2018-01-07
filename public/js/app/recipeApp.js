/**
 * Created by pi on 8/2/16.
 */
/**
 * Created by Operator on 5/13/2016.
 */

var recipeApp = angular.module('recipeApp', []);
recipeApp.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
recipeApp.controller('RecipeListCtrl', function ($scope, $http, $filter) {

    $scope.selectedAll = false;

    // $http.get('/admin/recipe/RecipeList/data').success(function (recipes) {
    //     console.log('recipes: ' + recipes);
    //     $scope.recipes = recipes;
    // });
    var recipesStr = JSON.parse($("#recipes").val());
    console.log("recipesStr: " + recipesStr);
    $scope.recipes = JSON.parse($("#recipes").val());
    console.log("recipes: " + $scope.recipes);
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
    $scope.createRecipe = createRecipe;


    //function defintions
    function createRecipe() {
        $.get('/line/getLineList', function (data) {
            console.log('linesStr' + data.lines);

            var lines = JSON.parse(data.lines);
            var options = [];
            for (i = 0; i < lines.length; i++) {
                options.push("<option value='" + lines[i].id + "'>" + lines[i].ident + "</option>");
            }
            //append after populating all options
            $('#lineList')
                .append(options.join(""))
                .selectmenu();
            console.log('dialogLineIdent' + dialogLineIdent);
            dialogLineIdent.dialog('option', 'title', 'Create recipe');
            dialogLineIdent.dialog('open');
        });
    }

    $scope.remove = function () {
        var toDeleteIds = [];
        var remainRecipes = [];
        $scope.selectedAll = false;
        angular.forEach($scope.recipes, function (selectedRecipe) {
            if (selectedRecipe.selected) {
                toDeleteIds.push(selectedRecipe.id);
            } else {
                remainRecipes.push(selectedRecipe);
            }
        });
        $scope.recipes = remainRecipes;
        var toDeleteIdsStr = JSON.stringify(toDeleteIds);
        $.getJSON('/admin/recipe/recipeList/deleteRecipe/:' + toDeleteIdsStr, function (data) {
            console.log(data);
        });

    };
    $scope.checkAll = function () {
        // if (!$scope.selectedAll) {
        //     $scope.selectedAll = true;
        // } else {
        //     $scope.selectedAll = false;
        // }
        angular.forEach($scope.recipes, function (recipe) {
            recipe.selected = $scope.selectedAll;
        });
    };
    $scope.update = function () {

    }

});
recipeApp.controller('RecipeDetailCtrl', function ($scope, $http, $filter) {

    //internal variables

    var line = {};
    $scope.recipe = JSON.parse($("#recipe").val());
    $scope.receiverStorages = [];
    $scope.senderStorages = [];
    $scope.sendersSelectedAll = false;
    $scope.receiversSelectedAll = false;
    $scope.isProduce = false;
    console.log($scope.recipe);
    $scope.result = '';
    $scope.sender = {};
    $scope.setStorages = setStorages;
    setStorages();
    $scope.update = function () {
        var recipeStr = JSON.stringify($scope.recipe);
        $.getJSON('/admin/recipe/recipeDetail/updateRecipe/:' + recipeStr, function (message) {
            console.log(message);
            $scope.result = message;
            window.location.replace("/admin/recipe/recipeList");
        })
    };

    $scope.senderCheckAll = function () {
        angular.forEach($scope.recipe.senders, function (sender) {
            sender.selected = $scope.sendersSelectedAll;
        });
    };
    $scope.createSender = function () {
        $.get('/admin/recipe/createIngredient/:' + $scope.recipe.id + '/:' + 0, function (data) {
            console.log('data');
            console.dir(data);
            if (data.error) {
                $scope.result = data.error;
            } else {
                $scope.result = '';
                $scope.recipe.senders.push(data.newIngredient);
                location.reload();
            }
        });
    };

    $scope.removeSender = function () {
        var toDeleteSenderIds = [];
        var remainSenders = [];
        $scope.sendersSelectedAll = false;
        angular.forEach($scope.recipe.senders, function (selectedSender) {
            if (selectedSender.selected) {
                toDeleteSenderIds.push(selectedSender.id);
            } else {
                remainSenders.push(selectedSender);
            }
        });
        $scope.recipe.senders = remainSenders;
        var toDeleteSenderIdsStr = JSON.stringify(toDeleteSenderIds);
        console.log('toDeleteSenderIdsStr: ' + toDeleteSenderIdsStr);
        $.post('/admin/recipe/deleteIngredient', {toDeleteIngredientIdsStr: toDeleteSenderIdsStr}, function (message) {
            $scope.result = message;
            console.log(message);
        });
    };
    $scope.receiversCheckAll = function () {
        angular.forEach($scope.recipe.receivers, function (receiver) {
            receiver.selected = $scope.receiversSelectedAll;
        });
    };
    $scope.createReceiver = function () {
        $.get('/admin/recipe/createIngredient/:' + $scope.recipe.id + '/:' + 1, function (data) {
            console.log('data');
            console.dir(data);
            if (data.error) {
                $scope.result = data.error;
            } else {
                $scope.result = '';
                $scope.recipe.receivers.push(data.newIngredient);
                location.reload();
            }
        });
    };
    $scope.removeReceiver = function () {
        var toDeleteReceiverIds = [];
        var remainReceivers = [];
        $scope.receiversSelectedAll = false;
        angular.forEach($scope.recipe.receivers, function (selectedReceiver) {
            if (selectedReceiver.selected) {
                toDeleteReceiverIds.push(selectedReceiver.id);
            } else {
                remainReceivers.push(selectedReceiver);
            }
        });
        $scope.recipe.receivers = remainReceivers;
        var toDeleteReceiverIdsStr = JSON.stringify(toDeleteReceiverIds);
        console.log('toDeleteReceiverIdsStr: ' + toDeleteReceiverIdsStr);
        $.post('/admin/recipe/deleteIngredient', {toDeleteIngredientIdsStr: toDeleteReceiverIdsStr}, function (message) {
            $scope.result = message;
            console.log(message);
        });
    };
    function changeStorages() {
        console.log('Is produce: ' + $scope.isProduce);
        $scope.senderStorages = [
            {
                id: 11111,
                ident: '11111'
            },
            {
                id: 22222,
                ident: '22222'
            },
            {
                id: 33333,
                ident: '33333'
            }
        ];
        $scope.receiverStorages = [
            {
                id: 111,
                ident: '111'
            },
            {
                id: 222,
                ident: '222'
            },
            {
                id: 333,
                ident: '333'
            }
        ];
        if ($scope.isProduce) {
            getStorages(10, setStorageForSenders);
            // getStorages(1, setStorageForReceivers);
        } else {
            getStorages(1, setStorageForSenders);
            // getStorages(10, setStorageForReceivers);
        }
    }


    function setStorages() {
        var isProduce = $scope.isProduce;
        if (isProduce) {
            $.get('/storage/getStorageList/:' + 3, function (storages) {
                console.log('storages');
                console.log(storages);
                $scope.receiverStorages = storages;

                console.log('receiverStorages');
                console.dir($scope.receiverStorages);
            });
            $.get('/storage/getStorageList/:' + 10, function (storages) {
                console.log('storages');
                console.log(storages);
                $scope.senderStorages = storages;

                console.log('senderStorages');
                console.dir($scope.senderStorages);
            });
        }else {
            $.get('/storage/getStorageList/:' + 10, function (storages) {
                console.log('storages');
                console.log(storages);
                $scope.receiverStorages = storages;

                console.log('receiverStorages');
                console.dir($scope.receiverStorages);
            });
            $.get('/storage/getStorageList/:' + 1, function (storages) {
                console.log('storages');
                console.log(storages);
                $scope.senderStorages = storages;

                console.log('senderStorages');
                console.dir($scope.senderStorages);
            });
        }


    }

    function setStorageForSenders(storages) {
        $scope.senderStorages = storages;
        console.log('senderStorages');
        console.dir($scope.senderStorages);
    }

    function getStorages(category, callback) {
        $.get('/storage/getStorageList/:' + category, function (storages) {
            console.log('storages');
            console.log(storages);
            callback(storages);
        });
    }

});
recipeApp.filter('getByLabel', function () {
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



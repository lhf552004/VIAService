/**
 * Created by pi on 8/9/16.
 */
angular.module('ngrepeatSelect', [])
    .controller('ExampleController', ['$scope', function($scope) {
        $scope.data = {
            model: null,
            availableOptions: [
                {id: '1', name: 'Option A'},
                {id: '2', name: 'Option B'},
                {id: '3', name: 'Option C'}
            ]
        };
    }]);
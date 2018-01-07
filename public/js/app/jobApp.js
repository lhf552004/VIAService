/**
 * Created by pi on 8/2/16.
 */
/**
 * Created by Operator on 5/13/2016.
 */

var jobApp = angular.module('jobApp', []);
jobApp.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
jobApp.controller('JobListCtrl', function ($scope, $http, $filter) {


    // $http.get('/admin/recipe/RecipeList/data').success(function (recipes) {
    //     console.log('recipes: ' + recipes);
    //     $scope.recipes = recipes;
    // });
    //var recipesStr = JSON.parse($("#recipes").val());
    $scope.jobs = JSON.parse($("#jobs").val());
    var socket;
    console.log("jobs: " +  $scope.jobs);

    var server = location.href;
    console.log('server whole: ' + server);
    var header = server.indexOf('//');
    console.log('header: ' + header);
    var index = server.indexOf('/', header+2);
    console.log('index: ' + index);
    if(index>-1){
        server = server.substring(0,index);
        console.log('server: ' + server);
        socket = io(server);
        socket.on('newJob', function () {
            location.reload();
        });
    }



    $scope.lineIdent = $("#lineIdent").val();
    console.log("lineIdent: " +  $scope.lineIdent);
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
    $scope.createJob = createJob;


    //function defintions
    function createJob() {
        $.get('/job/jobList/createJob/:' +$scope.lineIdent, function (data) {
            var newJob = null;
            console.log('data: ' + data);
            if(!data.error){
                newJob = data.job;
                console.log('newJob: ' + newJob);
                console.log('newJob id: ' + newJob.id);
                console.log('newJob State: ' + newJob.displayState);
                $scope.jobs.push(newJob);

            }else {
                $('#errors').append('<li>' + data.error + '</li>');
            }
            location.reload();

        });
    }

    $scope.remove = function () {
        var toDeleteJobIds = [];
        var remainJobs =[];
        $scope.selectedAll = false;
        angular.forEach($scope.jobs, function (selectedJob) {
            if(selectedJob.selected){
                toDeleteJobIds.push(selectedJob.id);
            }else {
                remainJobs.push(selectedJob);
            }
        });
        $scope.jobs = remainJobs;
        var toDeleteJobIdsStr = JSON.stringify(toDeleteJobIds);
        console.log('toDeleteJobIdsStr: ' + toDeleteJobIdsStr);
        $.post('/job/jobList/deleteJob',{toDeleteJobIdsStr:toDeleteJobIdsStr}, function (data) {
            console.log(data);
        });

    };
    $scope.checkAll = function () {
        // if (!$scope.selectedAll) {
        //     $scope.selectedAll = true;
        // } else {
        //     $scope.selectedAll = false;
        // }
        angular.forEach($scope.jobs, function (job) {
            job.selected = $scope.selectedAll;
        });
    };

});
jobApp.controller('JobDetailCtrl', function ($scope, $http, $filter) {

    //internal variables
    var gateStorages =[];
    var bulkStorages =[];
    //$scope.job = JSON.parse($("#job").val());
    $scope.senderStorages =[];
    $scope.receiverStorages =[];
    $scope.line = {};

    $.get('/storage/getStorageList/:' + 1, function (storagesOfGate) {
        console.log('storagesOfGate');
        console.log(storagesOfGate);
        gateStorages = storagesOfGate;

        $.get('/storage/getStorageList/:' + 10, function (storagesOfBulk) {
            console.log('storagesOfBulk');
            console.log(storagesOfBulk);
            bulkStorages = storagesOfBulk;



            $.get(' /line/getLine/:' + $scope.job.LineId, function (data) {
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
    console.log($scope.job);
    $scope.result = "";

    $scope.job.recipe.senders[0].storageIdent = '501';
    $scope.update = function () {
        var jobStr = JSON.stringify($scope.job);
        $.post('/job/jobDetail',{jobStr:jobStr}, function (message) {
            console.log(message);
            $scope.result = message;
            location.reload();
        },'json');
    }

});
jobApp.filter('getByLabel', function () {
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



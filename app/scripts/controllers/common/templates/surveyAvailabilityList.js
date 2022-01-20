'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
  .controller('SurveyAvailabilityListCtrl', function ($scope, $state, $translate, $q, ModalService, APIService, PermissionService, ResourceService, StorageService, UtilsService, ENV) {

    $scope.availableSurveys = null;
    $scope.filteredAvailableSurveys = null;

    $scope.surveyType = null;
    $scope.surveyTypeOptions = null;
    $scope.search = null;

    $scope.permissionService = PermissionService;

    function init() {
        loadData(function(){
            initFilter();
            filter();
        });
    }

    function initFilter()
    {
        console.log("initFilter");

        var now = new Date();

        $scope.search = {};
        $scope.search.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        $scope.search.dateFrom = new Date($scope.search.today);
        $scope.search.dateTo = new Date($scope.search.dateFrom);
        $scope.search.dateTo.setMonth($scope.search.dateTo.getMonth() + 1);

        //if($scope.availableSurveys != null)
        //     $scope.surveyType = $scope.availableSurveys.map(function(obj){ return obj.id; });



        if($scope.availableSurveys != null)
        {
            $scope.surveyTypeOptions = [];

            var options = $scope.availableSurveys.map(function(av) {
                return { value: av.surveyType, label:av.surveyType };
            });


            for (var i = 0, l = options.length; i < l; i++)
                if ($scope.surveyTypeOptions.find(function(o) { return o.value == options[i].value }) == null)
                     $scope.surveyTypeOptions.push(options[i]);


            $scope.surveyTypeOptions.unshift({ value: null, label:'ALL' });
        }

        $scope.$watch('search.type', filter);
        $scope.$watch('search.dateFrom', filter);
        $scope.$watch('search.dateTo', filter);
    }

    $scope.book = function(item)
    {
        ModalService.dialogConfirm("sur-book-create-dialog-title",
            "sur-book-create-dialog-message", function(success, error) {

            var obj = {
              "userId": $scope.currentUser.id,
              "surveyAvailability": { "id": item.id }
            };

            console.log("booking:" , obj);

            APIService.createSurveyBooking(obj).then(
                function successCallback(data) {

                    loadData(function(){
                        filter();
                        success();

                        $scope.refreshCallback();
                    });
            });
        });
    }

    $scope.bookRequest = function(item)
    {
        ModalService.dialogConfirm("sur-book-create-dialog-title",
            "sur-book-create-dialog-message", function(success, error) {

            var obj = {
              "userId": $scope.currentUser.id,
              "surveyAvailability": { "id": item.id }
            };

            console.log("booking:" , obj);

            APIService.createSurveyBooking(obj).then(
                function successCallback(data) {

                    loadData(function(){
                        filter();
                        success();
                    });
            });
        });
    }

    $scope.showAll = function()
    {
        // clear fiilter;
        if($scope.availableSurveys != null)
        {
            var length = $scope.availableSurveys.length;

            if( length > 0)
            {
                $scope.search.dateFrom = new Date($scope.availableSurveys[0].startTime);
                $scope.search.dateTo = new Date($scope.availableSurveys[length-1].startTime);
                $scope.search.type = null;

                $scope.search.dateFrom.setDate( $scope.search.dateFrom.getDate() - 1);
                $scope.search.dateTo.setDate( $scope.search.dateTo.getDate() + 1);

                filter();
            }
        }
    };

    function filter() {
        if($scope.availableSurveys != null) {
           $scope.filteredAvailableSurveys = $scope.availableSurveys.filter(function(s) {

                return (
                    ($scope.search.dateFrom == null || s.startTime >= $scope.search.dateFrom.getTime()) &&
                    ($scope.search.dateTo == null || s.startTime <= $scope.search.dateTo.getTime()) &&
                    ($scope.search.type == null || s.surveyType == $scope.search.type)
                    );
           });
        }
    };

    function loadData(callback) {

        APIService.getSurveysAvailability().then(
            function successCallback(data) {
                $scope.availableSurveys = data;

                callback();
        });
    };

    init();

  });

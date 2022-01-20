angular.module('APP')
    .controller('DrawChartCtrl', function($rootScope, $scope, $log, $translate, $state, $uibModal, $timeout, $window,
                                      amMoment, notify, APIService, ResourceService, UtilsService, ENV) {
        
        $scope.charts = null;
        $scope.selectedChart = null;

        $scope.ADD = {
            SHAPE : "shape",
            ARROW : "arrow"
        };

        $scope.add = function() {
            $scope.selectedElement = new Chart();
        };

        $scope.edit = function(item) {
            $scope.selectedItem = angular.copy(item);
        };

        $scope.cancel = function() {
            $scope.selectedItem = null
        };


        $scope.delete = function(item){
            ModalService.dialogConfirm('Delete',
                'Chart <strong>' + item.name + '</strong> will be deleted. I proceed? ',
                function onConfirmAction() {
                    APIService.deleteChart(item.id);
                }
            ).then( init );
        };

        $scope.save = function (item) {

            if(item.id == null) {
                APIService.createChart(item).then(
                    function success(item) {
                        $scope.selectedItem = item;
                        notify.logSuccess('Success', 'new chart successfully created');
                        init();
                    },
                    savingError);
            } else // Update Chart {
                APIService.updateChart(item).then(
                    function success(item){
                        $scope.selectedItem = item;
                        notify.logSuccess('Success', 'chart successfully updated');
                        init();
                    },
                    savingError
                );
        };

        function savingError() {
            $scope.loader = false;
            $scope.errorMessage = "Saving data error!";
        }

        $scope.isValid = function(item) {
            return true;
        };

        function selectChart(chart) {
            $scope.selectedChart = chart;
        }

        function init() {

            $scope.charts = null;
            $scope.selectedChart = null;

            APIService.getChartsByOrganizationId().then(
                function successCallback(data) {
                    $scope.charts = data || [];

                    if(data.length > 0){
                        selectChart(data[0]);
                    }
                });
        }

        init();
    });
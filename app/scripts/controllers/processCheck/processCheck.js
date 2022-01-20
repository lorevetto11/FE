'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
    .controller('ProcessCheckCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, Command, Layout, Shape, Color, Procedure,
                                              PrerequisiteType, Frequency, ProcessCheck, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

        $scope.items = null;
        $scope.filter = {};

        $scope.processCheckTypes = ProcessCheck.TYPE;
        $scope.prerequisiteTypes = null;
        $scope.frequencyPeriods = Frequency.PERIOD;

        $scope.selectedOrganization = ResourceService.getSelectedOrganization();

        $scope.$on('resourceChange', function () {
            $scope.selectedOrganization = ResourceService.getSelectedOrganization();
            init();
        });

        $scope.add = function () {
            $scope.selectedItem = new ProcessCheck();
        };

        $scope.edit = function (item) {
            $scope.selectedItem = angular.copy(item);
        };

        $scope.cancel = function () {
            $scope.selectedItem = null
        };

        $scope.delete = function (item) {

            ModalService.dialogConfirm('Delete',
                'Process check <strong>' + item.name + '</strong> will be deleted. I proceed? ',
                function onConfirmAction() {
                    $scope.selectedItem = null;

                    $log.info("Deleting Process check: %O", item);
                    return APIService.deleteProcessCheck(item.id);

                }

            ).then(init);

        };

        $scope.clone = function (item) {
            var clone = angular.copy(item);
            clone.id = null;
            clone.name = 'copy of - ' + clone.name;
            $scope.selectedItem = clone;
        };

        $scope.save = function (item) {

            if (item.id == null) {

                item.frequency.prerequisiteType = item.prerequisiteType;
                item.frequency.type = "CUSTOM";
                item.frequency.organization = item.organization;

                $log.info("Creating Frequency: %O", item.frequency);
                APIService.createFrequency(item.frequency).then(
                    function success(frequency) {

                        item.frequency = frequency;

                        $log.info("Creating Process check: %O", item);
                        APIService.createProcessCheck(item).then(
                            function success(item) {

                                $scope.selectedItem = item;
                                notify.logSuccess('Success', 'New processCheck successfully created');
                                init();

                            }, savingError);

                    }, savingError);

            } else {

                item.frequency.prerequisiteType = item.prerequisiteType;
                item.frequency = Frequency.parse(item.frequency);
                item.frequency.organization = item.organization;

                $log.info("Creating Frequency: %O", item.frequency);
                APIService.createFrequency(item.frequency).then(
                    function success(frequency) {

                        item.frequency = frequency;

                        $log.info("Updating Process check: %O", item);
                        APIService.updateProcessCheck(item).then(
                            function success(item) {

                                $scope.selectedItem = item;
                                notify.logSuccess('Success', 'SystemCheck successfully updated');
                                init();

                            }, savingError);

                    }, savingError);

            }

        };

        function savingError() {
            $scope.loader = false;
            $scope.errorMessage = "Saving data error!";
        }

        $scope.itemsFilter = function (item) {

            var result = true;

            if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
                var keyword = $scope.filter.keyword.toLowerCase();
                result &= (item.name && item.name.toLowerCase().indexOf(keyword) != -1);
            }

            return result;
        };


        $scope.isValid = function (item) {
            return true;
        };


        function init() {

            if (!$scope.selectedOrganization) {
                return;
            }

            APIService.getPrerequisiteTypes().then(
                function success(data) {

                    $scope.prerequisiteTypes = data;
                    $log.info("Prerequisite types: %O", data);

                    APIService.getProcessChecksByOrganizationId($scope.selectedOrganization.id).then(
                        function successCallback(data) {
                            
                            $scope.items = data;
                            $log.info("Process checks: %O", data);
                            
                        });

                });

        }

        init();
    });

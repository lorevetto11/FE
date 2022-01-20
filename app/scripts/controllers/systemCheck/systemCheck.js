'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
    .controller('SystemCheckCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, Command, Layout, Shape, Color, Procedure,
                                             Prerequisite, SystemCheck, SystemCheckRequirement, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

        $scope.items = null;
        $scope.filter = {};
        $scope.requirements = null;

        $scope.selectedOrganization = ResourceService.getSelectedOrganization();

        $scope.$on('resourceChange', function () {
            $scope.selectedOrganization = ResourceService.getSelectedOrganization();
            init();
        });


        var toDelete = [];

        $scope.add = function () {
            $scope.selectedItem = new SystemCheck();
        };

        $scope.edit = function (item) {
            $scope.selectedItem = angular.copy(item);
            loadRequirements(item.id).then(
                function success(){

                        var requirement = {systemCheck: item};
                        $scope.requirements.push(new SystemCheckRequirement(requirement));

                });

        };

        $scope.cancel = function () {
            $scope.selectedItem = null
        };

        $scope.delete = function (item) {
            ModalService.dialogConfirm('Delete',
                'System check <strong>' + item.name + '</strong> will be deleted. I proceed? ',
                function onConfirmAction() {

                    $scope.selectedItem = null;

                    var requirementIds = $scope.requirements.map(function(requirement){
                       return requirement.id;
                    });

                    $log.info("Deleting System Check Requirements: %O", $scope.requirements);
                    return APIService.recursiveCall(requirementIds, APIService.deleteSystemCheckRequirement).then(
                        function success(){

                            $log.info("Deleting System Check: %O", item);
                            return APIService.deleteSystemCheck(item.id);

                        });

                }
            ).then(init);

        };

        $scope.deleteRequirement = function (index) {
            var item = $scope.requirements.splice(index, 1)[0];
            if (item && item.id != null) {
                toDelete.push(item.id);
            }
        };

        $scope.addRequirement = function (item) {
            var requirement = {systemCheck: item};
            $scope.requirements.push(new SystemCheckRequirement(requirement));
        };

        $scope.clone = function (item) {
            var clone = angular.copy(item);
            clone.id = null;
            clone.name = 'copy of - ' + clone.name;
            $scope.selectedItem = clone;
        };

        $scope.save = function (item) {

            if (item.id == null) {

                // item.revision = 100;
                $log.info("Creating System Check: %O", item);
                APIService.createSystemCheck(item).then(
                    function success(item) {

                        $scope.selectedItem = item;
                        notify.logSuccess('Success', 'new systemCheck successfully created');
                        init();


                        var requirement = {systemCheck: item};
                        $scope.requirements = [];
                        $scope.requirements.push(new SystemCheckRequirement(requirement));

                    }, savingError);

            } else {

                $log.info("Updating System Check: %O", item);
                APIService.updateSystemCheck(item).then(
                    function success(item) {
                        $scope.selectedItem = item;

                        saveRequirements().then(
                            function success(){

                                notify.logSuccess('Success', 'systemCheck successfully updated');
                                init();

                            }
                        );

                    }, savingError);

            }

        };

        function saveRequirements() {

            var toCreate = $scope.requirements.filter(function (c, index) {
                return c.id == null && index != $scope.requirements.length-1;
            });

            var toUpdate = $scope.requirements.filter(function (c) {
                return c.id != null;
            });

            $log.info("toDelete: ", toDelete);

            return APIService.recursiveCall(toCreate, APIService.createSystemCheckRequirement).then(
                function success(data) {

                    $log.info("recursiveCall toCreate success:", data);

                    APIService.recursiveCall(toDelete, APIService.deleteSystemCheckRequirement).then(
                        function success() {

                            $log.info("recursiveCall toDelete success");

                            APIService.recursiveCall(toUpdate, APIService.updateSystemCheckRequirement).then(
                                function success(data) {

                                    $log.info("recursiveCall toUpdate success:", data);

                                });

                        });

                });

        }

        $scope.saveRequirement = function (item) {
            if (item.id == null) {
                return APIService.createSystemCheckRequirement(item);
            } else {
                return APIService.updateSystemCheckRequirement(item);
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

        function loadRequirements(itemId) {

            toDelete = [];

            return APIService.getSystemCheckRequirementsBySystemCheckId(itemId).then(
                function successCallback(data) {

                    $scope.requirements = data;
                    $log.info("System Check Requirements: %O", data);

                });

        }

        function init() {

            $scope.selectedItem = null;
            if (!$scope.selectedOrganization) {
                return;
            }

            APIService.getSystemChecksByOrganizationId($scope.selectedOrganization.id).then(
                function successCallback(data) {

                    $scope.items = data;
                    $log.info("System Checks: %O", data);

                });

        }

        init();

    });

'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
    .controller('NoncomplianceDetailCtrl', ['$scope', '$uibModalInstance', '$log', 'processCheck', 'systemCheckRequirement', 'editMode', 'noncompliance', 'prerequisites', 'PrerequisiteType', 'Noncompliance', 'APIService', 'ResourceService', 'ValidationService',
        function ($scope, $uibModalInstance, $log, processCheck, systemCheckRequirement, editMode, noncompliance, prerequisites, PrerequisiteType, Noncompliance, APIService, ResourceService, ValidationService) {

            $scope.editMode = editMode != null ? editMode : (!noncompliance || !noncompliance.closeDate);

            $scope.originalItem = noncompliance ? noncompliance : new Noncompliance();
            $scope.item = angular.copy($scope.originalItem) || {};
            $scope.prerequisites = prerequisites ? prerequisites : null;
            $scope.prerequisiteTypes = null;
            $scope.prerequisiteType = null;

            $scope.selectedOrganization = ResourceService.getSelectedOrganization();

            $scope.$on('resourceChange', function () {
                $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                init();
            });

            $scope.closeNoncompliance = function(item) {
                item.closeDate = new Date();
            };

            $scope.save = function (form) {

                if (form.$invalid) {
                    ValidationService.dirtyForm(form);
                    return false;
                }

                if ($scope.item && $scope.item.context) {
                    delete $scope.item.context.subject;
                }
                if ($scope.item.id == null) {

                    $scope.item.startDate = new Date();

                    $log.info("Creating NonCompliance: %O", $scope.item);
                    APIService.createNoncompliance($scope.item).then(
                        function success(item) {
                            
                            $uibModalInstance.close(item);

                        }, savingError);

                } else {

                    if ($scope.item.closed) {
                        $scope.item.closeDate = new Date();
                    }

                    $log.info("Updating NonCompliance: %O", $scope.item);
                    APIService.updateNoncompliance($scope.item).then(
                        function success(item) {

                            $uibModalInstance.close(item);

                        }, savingError);

                }
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };

            $scope.isValid = function () {
                return true;
            };

            function savingError() {
                console.log('savingError');
                $scope.loader = false;
                $scope.errorMessage = "Saving data error!";
            }

            // function loadPrerequisites() {
            //
            //     var prerequisites = [];
            //
            //     APIService.getAllPrerequisitesByOrganizationId($scope.selectedOrganization.id).then(function (data) {
            //         prerequisites = prerequisites.concat(data);
            //         APIService.getWaterSupplyByOrganizationId().then(function (data) {
            //             prerequisites = prerequisites.concat(data);
            //             APIService.getAirConditioningByOrganizationId().then(function (data) {
            //                 prerequisites = prerequisites.concat(data);
            //                 APIService.getCleaningsByOrganizationId().then(function (data) {
            //                     prerequisites = prerequisites.concat(data);
            //                     APIService.getWasteDisposalByOrganizationId().then(function (data) {
            //                         prerequisites = prerequisites.concat(data);
            //                         APIService.getEquipmentsByOrganizationId().then(function (data) {
            //                             prerequisites = prerequisites.concat(data);
            //                             APIService.getPestControlsByOrganizationId().then(function (data) {
            //                                 prerequisites = prerequisites.concat(data);
            //                                 APIService.getStaffHygienesByOrganizationId().then(function (data) {
            //                                     $scope.prerequisites = prerequisites.concat(data);
            //
            //
            //
            //
            //                                 });
            //                             });
            //                         });
            //                     });
            //                 });
            //             });
            //         });
            //     });
            // }

            function init() {

                if (!$scope.selectedOrganization) {
                    return;
                }

                if ($scope.item.processCheck == null && $scope.item.systemCheckRequirement == null) {

                    if(!$scope.prerequisites) {
                        APIService.getAllPrerequisitesByOrganizationId($scope.selectedOrganization.id).then(
                            function (data) {

                                $scope.prerequisites = data;
                                $log.info("Prerequisites: %O", data);

                                $scope.prerequisiteTypes = PrerequisiteType.TYPES.filter(function (t) {

                                    return $scope.prerequisites.find(function (p) {
                                            return p.prerequisiteType && p.prerequisiteType.name == t;
                                        }) != null;

                                });

                            });
                    } else {

                        $log.info("Prerequisites: %O", $scope.prerequisites);

                        $scope.prerequisiteTypes = PrerequisiteType.TYPES.filter(function (t) {

                            return $scope.prerequisites.find(function (p) {
                                    return p.prerequisiteType && p.prerequisiteType.name == t;
                                }) != null;

                        });

                    }

                }

            }

            init();

        }
    ]);

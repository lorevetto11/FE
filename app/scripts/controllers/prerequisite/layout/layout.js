'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
    .controller('LayoutCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, Command, Layout, Shape, Color,
                                        PrerequisiteType, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

        $scope.layouts = null;
        $scope.command = null;

        $scope.prerequisiteType = PrerequisiteType.LAYOUT;
        $scope.selectedOrganization = ResourceService.getSelectedOrganization();

        $scope.$on('resourceChange', function () {
            $log.info("on resourceChange: ");
            $scope.selectedOrganization = ResourceService.getSelectedOrganization();
            init();
        });

        $scope.MODE = {
            SHOW_PLAN: 'show_plan',
            SHOW_PROCESS_CHECKS: 'show_checks',
            SHOW_ANALYSIS: 'show_analysis',
        };

        $scope.mode = $scope.MODE.SHOW_PLAN;

        $scope.showProcessChecks = function () {
            if ($scope.mode == $scope.MODE.SHOW_PROCESS_CHECKS) {
                $scope.mode = $scope.MODE.SHOW_PLAN;
            } else {
                $scope.mode = $scope.MODE.SHOW_PROCESS_CHECKS;
            }
        };

        $scope.showAnalysis = function () {
            if ($scope.mode == $scope.MODE.SHOW_ANALYSIS) {
                $scope.mode = $scope.MODE.SHOW_PLAN;
            } else {
                $scope.mode = $scope.MODE.SHOW_ANALYSIS;
            }
        };

        $scope.addLayout = function () {

            if ($scope.layouts == null) {
                $scope.layouts = [];
            }

            if ($scope.command.action == null) {
                $scope.command.action = Command.action.ADD; //_LAYOUT;
                $scope.command.element = new Layout();
            }
            else {
                $scope.command.action = null;
            }
        };

        $scope.onSaveLayout = function (item, floor) {

            if (PrerequisiteType.isLayout(item)) {

                if (item.id == null) {

                    delete item.drawing;
                    delete item.selected;

                    $log.info("Creating Shape: %O", item);
                    APIService.createShape(item.shape).then(
                        function successCallback(data) {

                            item.shape.id = data.id;

                            $log.info("Creating Layout: %O", item);
                            APIService.createLayout(item).then(
                                function successCallback(data) {

                                    data.selected = true;
                                    angular.extend(item, data);
                                    notify.logSuccess('Success', 'Element successfully created');

                                }
                            );

                        }
                    );

                    $scope.layouts.push(item);

                } else { // update existing layout

                    delete item.drawing;
                    delete item.selected;
                    $log.info("Updating shape: %O", item.shape);
                    APIService.updateShape(item.shape).then(
                        function successCallback(data) {

                            item.shape.id = data.id;
                            $log.info("Shape: %O", data);
                            $log.info("Updating layout: %O", item);
                            APIService.updateLayout(item).then(
                                function successCallback(data) {

                                    data.selected = true;
                                    angular.extend(item, data);
                                    notify.logSuccess('Success', 'Element successfully updated');

                                }
                            );

                        }
                    );

                }

                $scope.command.action = null;

            }

        };

        $scope.onDeleteLayout = function (item, callback) {

            if (PrerequisiteType.isLayout(item)) {

                if (item.id != null) {

                    $log.info("Deleting Shape: %O", item.shape);
                    APIService.deleteShape(item.shape.id).then(
                        function successCallback(data) {

                            $log.info("Deleting Layout: %O", item);
                            APIService.deleteLayout(item.id).then(
                                function successCallback(data) {

                                    var idx = $scope.layouts.indexOf(item);

                                    if (idx != -1) {

                                        $scope.layouts.splice(idx, 1);
                                        notify.logSuccess('Success', 'Element successfully deleted');

                                    }

                                    item.selected = false;

                                }
                            );

                        }
                    );

                }

                $scope.command.action = null;

            }

        };


        function init() {

            $scope.command = {
                action: null,
                type: "Layout"
            };

            if (!$scope.selectedOrganization) {
                return;
            }

            APIService.getLayoutsByOrganizationId($scope.selectedOrganization.id).then(
                function successCallback(data) {

                    $scope.layouts = data.sort(function (a, b) {
                        return a.order > b.order;
                    });

                    $log.info("Layouts: %O", $scope.layouts);
                }
            );
        }

        init();

    });

'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
    .controller('CleaningCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, PrerequisiteType, Command, Cleaning, Shape, Color, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {


        $scope.items = null;
        $scope.command = null;

        $scope.MODE = {
            SHOW_PLAN: 'show_plan',
            SHOW_ANALYSIS: 'show_analysis',
            SHOW_PROCEDURES: 'show_procedures',
            SHOW_PRODUCTS: 'show_products'
        };

        $scope.cleanings = [
            {
                name: 'New Element',
                description: '',
                shape: {
                    type: "1"
                }
            }
        ];

        $scope.mode = $scope.MODE.SHOW_PLAN;

        $scope.showAnalysis = function () {
            if ($scope.mode == $scope.MODE.SHOW_ANALYSIS) {
                $scope.mode = $scope.MODE.SHOW_PLAN;
            } else {
                $scope.mode = $scope.MODE.SHOW_ANALYSIS;
            }
        };

        $scope.showProcedures = function () {
            if ($scope.mode == $scope.MODE.SHOW_PROCEDURES) {
                $scope.mode = $scope.MODE.SHOW_PLAN;
            } else {
                $scope.mode = $scope.MODE.SHOW_PROCEDURES;
            }
        }

        $scope.showProducts = function () {
            if ($scope.mode == $scope.MODE.SHOW_PRODUCTS) {
                $scope.mode = $scope.MODE.SHOW_PLAN;
            } else {
                $scope.mode = $scope.MODE.SHOW_PRODUCTS;
            }
        }

        $scope.add = function () {

            $scope.mode = $scope.MODE.SHOW_PLAN;

            if ($scope.items == null) {
                $scope.items = [];
            }

            if ($scope.command.action == null) {
                $scope.command.action = Command.action.ADD;
                $scope.command.element = new Cleaning($scope.cleanings[0]);
            }
            else {
                $scope.command.action = null;
            }
        };

        $scope.onSaveItem = function (item, floor) {

            if (PrerequisiteType.isCleaning(item)) {

                if (item.id == null) {

                    delete item.drawing;
                    delete item.selected;
                    delete item.constrainedToType;
                    item.layout = item.constrainedTo;
                    delete item.layout.selected;
                    delete item.constrainedTo;
                    $log.info("Creating Shape: %O", item.shape);
                    APIService.createShape(item.shape).then(
                        function successCallback(data) {

                            item.shape.id = data.id;

                            $log.info("Creating Cleaning: %O", item);
                            APIService.createCleaning(item).then(
                                function successCallback(data) {

                                    setTimeout(function () {

                                        data.selected = true;
                                        data.constrainedTo = data.layout;

                                        angular.extend(item, data);

                                        $log.info("Item: %O", item);
                                        notify.logSuccess('Success', 'Element successfully created');
                                    }, 0);

                                }
                            );

                        }
                    );

                    $scope.items.push(item);

                } else { // update existing waterSupply

                    delete item.drawing;
                    delete item.selected;
                    delete item.constrainedToType;
                    delete item.constrainedTo;
                    $log.info("Updating shape: %O", item.shape);
                    APIService.updateShape(item.shape).then(
                        function successCallback(data) {

                            item.shape.id = data.id;

                            $log.info("Updating Cleaning: %O", item);
                            APIService.updateCleaning(item).then(
                                function successCallback(data) {

                                    data.selected = true;
                                    item.constrainedTo = data.layout;

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

        $scope.onDeleteItem = function (item) {

            if (PrerequisiteType.isCleaning(item)) {

                if (item.id != null) {

                    $log.info("Deleting Shape: %O", item.shape);
                    APIService.deleteShape(item.shape.id).then(
                        function successCallback(data) {

                            $log.info("Deleting Cleaning: %O", item);
                            APIService.deleteCleaning(item.id).then(
                                function successCallback(data) {

                                    var idx = $scope.items.indexOf(item);

                                    if (idx != -1) {

                                        $scope.items.splice(idx, 1);
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
                type: "Cleaning"
            };

            $scope.items = [];

            APIService.getLayoutsByOrganizationId(ResourceService.getSelectedOrganization().id).then(
                function successCallback(data) {

                    $scope.items = data;
                    $log.info("Layouts: %O", data);

                    APIService.getCleaningsByOrganizationId(ResourceService.getSelectedOrganization().id).then(
                        function successCallback(data) {

                            var cleanings = data.map(function(dat){
                                dat.constrainedTo = dat.layout;
                                return dat;
                            });

                            $scope.items = $scope.items.concat(cleanings);
                            $log.info("Cleanings: %O", cleanings);

                        }
                    );

                }
            );


        }

        init();
    });

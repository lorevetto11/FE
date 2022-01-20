'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
        .controller('CCPCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, Prerequisite, Command, WaterSupply, Shape, Color, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {


                $scope.items = null;
                $scope.command = null;

                $scope.MODE = {
                    SHOW_PLAN : 'show_plan',
                    SHOW_ANALYSIS : 'show_analysis',
                };

                $scope.mode = $scope.MODE.SHOW_PLAN;

                $scope.supplyWaterTypes = [
                    {   name:'PW',
                        description: 'Potable Water',
                        shape : angular.extend(new Shape(), {
                            type : Shape.CIRCLE_FIX,
                            radius: 0.02,
                            color : '#be7'
                        })
                    },
                    {   name:'NPW',
                        description: 'Non-potable Water',
                        shape : angular.extend(new Shape(), {
                            type : Shape.CIRCLE_FIX,
                            radius: 0.02,
                            color : '#b0f'
                        })
                    }
                ];

                $scope.showAnalysis = function() {
                    if($scope.mode == $scope.MODE.SHOW_ANALYSIS) {
                        $scope.mode = $scope.MODE.SHOW_PLAN;
                    } else {
                        $scope.mode = $scope.MODE.SHOW_ANALYSIS;
                    }
                }

                $scope.add = function(type){

                    $scope.mode = $scope.MODE.SHOW_PLAN;

                    if($scope.items == null) {
                        $scope.items = [];
                    }

                    if($scope.command.action == null) {
                        $scope.command.action = Command.action.ADD;
                        $scope.command.element = new WaterSupply(type);
                    }
                    else {
                        $scope.command.action = null;
                    }
                };

            $scope.onSaveItem = function(item, floor){

                if(Prerequisite.isWaterSupply(item)) {
                    if(item.id == null) { // add new item
                        item.floorId = floor.id;
                        APIService.createWaterSupply(item).then(
                            function successCallback(data){
                                data.selected = true;
                                angular.extend(item,data);
                                notify.logSuccess('Success', 'element successfully created');
                            }
                        );
                        $scope.items.push(item);
                    } else { // update existing item
                        APIService.updateWaterSupply(item).then(
                            function successCallback(data){
                                data.selected = true;
                                angular.extend(item,data);
                                notify.logSuccess('Success', 'element successfully updated');
                            }
                        );
                    }
                    $scope.command.action = null;
                }
            };

            $scope.onDeleteItem = function(item){
                if(Prerequisite.isWaterSupply(item)) {
                    if(item.id != null) {
                        APIService.deleteWaterSupply(item.id).then(
                            function successCallback(data){
                                var idx = $scope.items.indexOf(item);
                                if(idx != -1) {
                                    $scope.items.splice(idx,1);
                                    notify.logSuccess('Success', 'element successfully deleted');
                                }
                                item.selected = false;
                            }
                        );
                    }
                    $scope.command.action = null;
                }
            };


                function init(){

                    $scope.command = {
                        action : null,
                        type : Prerequisite.WATER_SUPPLY
                    };

                    $scope.items = [];

                    APIService.getLayoutsByOrganizationId().then(
                        function successCallback(data) {
                            $scope.items = $scope.items.concat(data);

                            APIService.getWaterSupplyByOrganizationId().then(
                                function successCallback(data) {
                                    $scope.items = $scope.items.concat(data);
                                }
                            );

                        }
                    );


                }

                init();
        });

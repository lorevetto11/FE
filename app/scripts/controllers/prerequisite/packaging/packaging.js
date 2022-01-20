'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
        .controller('PackagingCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, Prerequisite, Command, StaffHygiene, Shape, Color, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {
            
            $scope.MODE = {
                SHOW_MATERIALS : 'show_materials',
                SHOW_MONITORINGS : 'show_monitorings'
            };

            $scope.mode = $scope.MODE.SHOW_MATERIALS;

            $scope.showMonitorings = function() {
                if($scope.mode == $scope.MODE.SHOW_MONITORINGS) {
                    $scope.mode = $scope.MODE.SHOW_MATERIALS;
                } else {
                    $scope.mode = $scope.MODE.SHOW_MONITORINGS;
                }
            }

        });

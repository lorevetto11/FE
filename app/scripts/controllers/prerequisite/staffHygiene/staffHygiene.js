'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
        .controller('StaffHygieneCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, Prerequisite, Command, StaffHygiene, Shape, Color, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {
            
            $scope.MODE = {
                SHOW_USERS : 'show_users',
                SHOW_MONITORINGS : 'show_monitorings'
            };

            $scope.mode = $scope.MODE.SHOW_USERS;

            $scope.showMonitorings = function() {
                if($scope.mode == $scope.MODE.SHOW_MONITORINGS) {
                    $scope.mode = $scope.MODE.SHOW_USERS;
                } else {
                    $scope.mode = $scope.MODE.SHOW_MONITORINGS;
                }
            }

        });

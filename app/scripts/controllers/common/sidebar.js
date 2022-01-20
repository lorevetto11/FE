'use strict';

/**
 * @ngdoc function
 * @name APP.controller:NavCtrl
 * @description
 * # NavCtrl
 * Controller of the APP
 */
angular.module('APP')
    .controller('SideBarCtrl', function ($rootScope, $scope, $log, $translate, $state, notify, APIService, ResourceService, PermissionService, UtilsService, ENV) {

        $scope.currentUser = ResourceService.getCurrentUser();

        $scope.selectedOrganization = ResourceService.getSelectedOrganization();

        $scope.$on('resourceChange', function () {

            var changedSelectedOrganization = ResourceService.getSelectedOrganization();
            if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
                $scope.selectedOrganization = changedSelectedOrganization;
                initCount();
            }

        });

        $scope.isVerifier = null;

        $rootScope.$on('Noncompliance-update', function () {
            $log.info('SideBarCtrl Noncompliance-update');
            initCount();
        });

        $scope.count = {};

        $scope.version = ENV.version;


        $scope.isAdmin = function () {

            if ($scope.currentUser) {
                return $scope.currentUser && $scope.currentUser.role && $scope.currentUser.role.name == 'Administrator';
            }

            return false;

        };

        function initCount() {
            
            $scope.selectedOrganization = ResourceService.getSelectedOrganization();
            if ($scope.selectedOrganization == null) {
                return;
            }

            APIService.getNoncompliancesByOrganizationId($scope.selectedOrganization.id).then(
                function (data) {
                    $scope.count.closed = data.filter(function (n) {
                        return n.closeDate != null;
                    }).length;

                    $scope.count.opened = data.filter(function (n) {
                        return n.closeDate == null;
                    }).length;
                }
            );

            if ($scope.currentUser && $scope.currentUser.role) {

                APIService.getRoleById($scope.currentUser.role.id).then(
                    function success(data) {

                        var profile = data.profiles.find(function (profile) {

                            return profile.name == "Verificatore";

                        });

                        $scope.isVerifier = profile != null;
                        ResourceService.setIsVerifier($scope.isVerifier);

                    });

            } else {

                $scope.isVerifier = false;
                ResourceService.setIsVerifier($scope.isVerifier);

            }

        }

        initCount();

        /*
         $scope.isConsultant = function() {
         return PermissionService.isConsultant();
         };

         $scope.isSimple = function() {
         currentUser = ResourceService.getCurrentUser();
         var userType = currentUser.userType ;
         return currentUser != null && ( userType == 'SUPERADMIN' ||
         userType == 'PURCHASER' ||
         userType == 'ADMIN' ||
         userType == 'SIMPLE' );
         };

         $scope.isAdmin = function() {
         currentUser = ResourceService.getCurrentUser();
         var userType = currentUser.userType;
         return currentUser != null && ( userType == 'SUPERADMIN' ||
         userType == 'PURCHASER' ||
         userType == 'ADMIN' );
         };

         $scope.isPurchaser = function() {
         currentUser = ResourceService.getCurrentUser();
         var userType = currentUser.userType;
         return currentUser != null && ( userType == 'SUPERADMIN' ||
         userType == 'PURCHASER' );
         };

         $scope.isSuperadmin = function() {
         currentUser = ResourceService.getCurrentUser();
         return currentUser != null && currentUser.userType == 'SUPERADMIN';
         };
         */

    });

'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
        .controller('DataCtrl', function ($scope, $state, $translate,  $log, currentUser, currentOrganization, APIService, ResourceService) {

            $scope.selectedOrganization = ResourceService.getSelectedOrganization();

            $scope.$on('resourceChange', function () {

                var changedSelectedOrganization = ResourceService.getSelectedOrganization();
                if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
                    $scope.selectedOrganization = changedSelectedOrganization;
                    init();
                }

            });
            
        });

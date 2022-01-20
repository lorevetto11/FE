'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
    .controller('PrerequisiteCtrl', function ($scope, $state, $translate, $log, currentUser, currentOrganization, selectedOrganization, APIService, ResourceService) {

        $scope.selected = {
            organization: selectedOrganization
        };

        $scope.$on('resourceChange', function () {
            $scope.selected.organization = ResourceService.getSelectedOrganization();
        });

    });

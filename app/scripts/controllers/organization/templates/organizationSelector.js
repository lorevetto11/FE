'use strict';

angular.module('APP')
.controller('OrganizationSelectorCtrl', function ($scope, $state, $translate,  $log, APIService, UtilsService, ResourceService) {

    $scope.organizations = null;
    $scope.kinshipLevels = null;
    $scope.loading = false;

    $scope.selected = {
        organization: ResourceService.getSelectedOrganization()
    };

    $scope.$on('resourceChange', function(){
        $scope.selected.organization = ResourceService.getSelectedOrganization();
    });

    $scope.onOrganizationChanged = function() {
        $log.info("onOrganizationChanged: ",  $scope.selected.organization );
        ResourceService.setSelectedOrganization($scope.selected.organization);
    };

    $scope.clearOrganization = function() {
        $scope.selected.organization = null;
        ResourceService.setSelectedOrganization($scope.selected.organization);
    };

    $scope.$on('organizationsChange', function () {
        init();
    });

    function init(){

        if($scope.organizations == null) {
            $scope.loading = true;
        }

        APIService.getOrganizations().then(
            function successCallback(data) {
                $scope.loading = false;
                $scope.organizations = UtilsService.organizationOrderTree(data);
    
                setTimeout(function () {
                    $scope.kinshipLevels = UtilsService.organizationBuildKinshipLevel($scope.organizations);
                }, 0);

                $log.info("$scope.organizations:", $scope.organizations);

                // check if selectedOne has been updated or is still available
                if($scope.selected.organization != null) {

                    var selected = $scope.organizations.find(function(org){
                        return org.id == $scope.selected.organization.id;
                    });

                    if(selected == null) {
                        $scope.clearOrganization();
                    } else {
                        $scope.selected.organization = selected;
                    }
                }

                if($scope.organizations.length == 1) {
                    ResourceService.setSelectedOrganization($scope.organizations[0]);
                }
            }
        );
    }

    init();
});

'use strict';

angular.module('APP')
    .controller('ProfileHomeCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $filter, $timeout, UtilsService,
                                             Person, Profile, ValidationService, currentUser, currentOrganization, ModalService, APIService, ResourceService) {

        $scope.items = null;
        $scope.itemsLoading = null;
        $scope.itemAdding = null;
        $scope.itemNotInMyOrganization = null;

        $scope.organizations = null;

        $scope.grants = null;
        $scope.groupedGrants = null;
        $scope.kinshipLevels = null;

        $scope.selectedItem = null;

        $scope.filter = {
            keyword: null
        }
        $scope.pattern = ValidationService.PATTERN
        $scope.selectedOrganization = ResourceService.getSelectedOrganization();

        $scope.$on('resourceChange', function () {
            $scope.selectedOrganization = ResourceService.getSelectedOrganization();
            init();
        });

        $scope.add = function () {

            $scope.selectedItem = null;
            $timeout(function () {
                $scope.selectedItem = new Profile();
                $scope.itemNotInMyOrganization = true;
                $scope.organizations.forEach(function (organization) {
                    if ($scope.selectedItem.organization.id == organization.id) {
                        $scope.itemNotInMyOrganization = false;
                    }
                });
            }, 0);

        };

        $scope.edit = function (item) {

            $scope.selectedItem = null;
            $timeout(function () {
                $scope.selectedItem = angular.copy(item);
                $scope.itemNotInMyOrganization = true;
                $scope.organizations.forEach(function (organization) {
                    if ($scope.selectedItem.organization.id == organization.id) {
                        $scope.itemNotInMyOrganization = false;
                    }
                });
            }, 0);

        };

        $scope.cancel = function () {
            $scope.selectedItem = null;
        };

        $scope.delete = function (item) {

            ModalService.dialogConfirm(
                'Delete', 'Profile <strong>' + item.name + '</strong> will be deleted. May I proceed? ',
                function onConfirmAction() {
                    return APIService.deleteProfile(item.id);
                }).then(init);
        };

        $scope.save = function (item, form) {

            if (form.$invalid) {
                form.$dirty = true;
                angular.forEach(form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        angular.element(document.querySelector('[name="' + errorField.$name + '"]')).addClass('ng-touched');
                        errorField.$dirty = true;
                    })
                });
                return false;
            }


            if (item.id == null) {
                createProfile(item);
            } else {
                updateProfile(item);
            }

            function createProfile(item) {
                APIService.createProfile(item).then(
                    function success(item) {
                        init();
                        /*
                        $scope.selectedItem = item;
                        $scope.itemNotInMyOrganization = false;
                        */
                    }, savingError );
            }

            function updateProfile(item) {
                APIService.updateProfile(item).then(
                    function success(item) {
                        init();
                       // $scope.selectedItem = item;
                    }, savingError );
            }
        };

        $scope.itemsFilter = function (item) {

            var result = true;
            if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
                result &= (item.name && item.name.toLowerCase().indexOf($scope.filter.keyword.toLowerCase()) != -1);
            }
            return result;
        };

        $scope.someSelected = function (object) {
            return Object.keys(object).some(function (key) {
                return object[key];
            });
        };

        $scope.hasGrant = function (grant) {
            var result = false;
            if ($scope.selectedItem.grants.length > 0) {
                $scope.selectedItem.grants.forEach(function (g) {
                    if (g.id == grant.id) {
                        result = true;
                    }
                });
            }

            return result;
        };

        $scope.addGrant = function (grant) {
            $scope.selectedItem.grants.push(grant);
        };

        $scope.removeGrant = function (grant) {
            var grants = $scope.selectedItem.grants;
            for (var n = 0; n < grants.length; n++){
                if(grants[n].id == grant.id){
                    $scope.selectedItem.grants.splice(n, 1);
                }
            }
        };

        function savingError() {
            $scope.loader = false;
            $scope.errorMessage = "Saving data error!";
        }

        function buildGrantGroups(grants) {

            var groups = [];
            if(grants) {
                grants.forEach(function(grant){
                    var prefix = 'ALL';
                    if(grant.name.indexOf('_') != -1){
                         prefix = grant.name.substr(0,grant.name.indexOf('_'));
                    }
                    var group = groups.find(function(g){ return g.name == prefix});
                    if(group) {
                        group.grants.push(grant);
                    } else {
                        groups.push({
                            name: prefix,
                            grants: [grant]
                        });
                    }
                });
            }

            return groups;
        };

        function init() {

            $scope.items = null;
            $scope.itemsLoading = true;
            $scope.itemNotInMyOrganization = null;
            $scope.selectedItem = null;

            if (!$scope.selectedOrganization) {
                return;
            }

            APIService.getProfiles($scope.selectedOrganization.id).then(
                function successCallback(data) {
                    $scope.items = data;
                    APIService.getOrganizations($scope.selectedOrganization.id).then(
                        function successCallback(data) {

                            $scope.organizations = UtilsService.organizationOrderTree(data);
                            $timeout(function () {
                                $scope.kinshipLevels = UtilsService.organizationBuildKinshipLevel($scope.organizations);
                            }, 0);

                            APIService.getGrants().then(
                                function successCallback(data) {
                                    $scope.grants = data;
                                    $scope.groupedGrants = buildGrantGroups(data);
                                    $scope.itemsLoading = null;
                                }
                            );

                        }
                    );

                }
            );

        }

        init();

    });

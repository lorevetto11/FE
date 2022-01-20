'use strict';

angular.module('APP')
    .controller('RoleHomeCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $filter, $timeout,
                                          UserRole, Organization, Profile, ValidationService, currentUser, currentOrganization,
                                          ModalService, APIService, ResourceService, UtilsService) {

        $scope.items = null;
        $scope.itemsLoading = null;
        $scope.itemNotInMyOrganization = null;

        $scope.selectedItem = null;

        $scope.profiles = null;
        $scope.organizations = null;

        $scope.organizationFilter = null;

        $scope.pattern = ValidationService.PATTERN;

        $scope.profilesChecked = {};

        $scope.kinshipLevels = null;

        $scope.filter = {
            organization : null,
            keyword: null
        }

        $scope.add = function () {
            $scope.selectedItem = null;

            $timeout(function () { // setTimeout semplice per risparmiare tempo, visto che non sono in grado di risolvere utlizzando form.$dirt = false e non saprei come altro fare
                $scope.selectedItem = new UserRole();
                $scope.itemNotInMyOrganization = true;
                $scope.organizations.forEach(function (organization) {
                    if ($scope.selectedItem.organization.id == organization.id) {
                        $scope.itemNotInMyOrganization = false;
                    }
                });
            }, 0);

        };

        $scope.edit = function (item) {

            $log.info('edit:', item);

            $scope.selectedItem = null;

            $timeout(function () { // setTimeout semplice per risparmiare tempo, visto che non sono in grado di risolvere utlizzando form.$dirt = false e non saprei come altro fare
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

            //check if some user has this userRole
            // APIService.getPeopleByOrganizationId().then(
            //     function (data) {
            //
            //         if (data && data.find(function (d) {
            //                 return d.role && d.role.id == item.id;
            //             }) != null) {
            //
            //             ModalService.dialogAlert('Delete',
            //                 'Role <strong>\'' + item.name + '\'</strong> is assigned to some users. You can not delete it!');
            //
            //         } else {

            ModalService.dialogConfirm(
                'Delete', 'Role <strong>\'' + item.name + '\'</strong> will be deleted. May I proceed? ',

                function onConfirmAction() {

                    $log.info("Deleting role: %O", item);
                    return APIService.deleteRole(item.id);

                }
            ).then(init);

            //         }
            //
            //     }
            // );

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

                item.organization = Organization.parse(ResourceService.getCurrentOrganization());
                $scope.selectedItem = null;
                createRole(item);

            } else {
                $scope.selectedItem = null;
                updateRole(item);
            }

            function createRole(item) {

                $log.info("Creating role: %O", item);
                APIService.createRole(item).then(
                    function success(item) {
                        init();
                        $scope.selectedItem = item;
                        $scope.itemNotInMyOrganization = false;
                    },
                    savingError
                );

            }

            function updateRole(item) {

                $log.info("Updating role: %O", item);
                APIService.updateRole(item).then(
                    function success(item) {

                        init();
                        $scope.selectedItem = item;

                    },
                    savingError
                );
            }
        };

        $scope.itemsFilter = function (item) {

            var result = true;
            if ($scope.filter.organization && item.organization) {
                result &= item.organization.id == $scope.filter.organization.id;
            }

            if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
                result &= (item.name && item.name.toLowerCase().indexOf($scope.filter.keyword.toLowerCase()) != -1) ||
                    (item.description && item.description.toLowerCase().indexOf($scope.filter.keyword.toLowerCase()) != -1);
            }
            return result;
        };

        $scope.hasProfile = function (profile) {

            var result = false;

            if ($scope.selectedItem.profiles.length > 0) {

                $scope.selectedItem.profiles.forEach(function (p) {

                    if (p.id == profile.id) {

                        result = true;

                    }

                });

            }

            return result;

        };

        $scope.addProfile = function (profile) {

            $scope.selectedItem.profiles.push(profile);

        };

        $scope.removeProfile = function (profile) {

            var profiles = $scope.selectedItem.profiles;

            for (var n = 0; n < profiles.length; n++) {

                if (profiles[n].id == profile.id) {
                    $scope.selectedItem.profiles.splice(n, 1);
                }

            }

        };

        function savingError() {

            $scope.loader = false;
            $scope.errorMessage = "Saving data error!";

        }

        function init() {
            
            $scope.items = null;
            $scope.itemsLoading = true;
            $scope.itemAdding = null;
            $scope.itemNotInMyOrganization = null;

            $scope.selectedItem = null;

            $scope.organizations = null;

            var selectedOrganization = ResourceService.getSelectedOrganization();

            if(selectedOrganization == null) {
                return;
            }

            APIService.getRoles(selectedOrganization.id).then(
                function successCallback(data) {

                    data = data || [];

                    $scope.items = data.map(function (item) {
                        return UserRole.parse(item);
                    });

                    $log.info("Roles: %O", $scope.items);

                    APIService.getProfilesByOrganizationId(selectedOrganization.id).then(
                        function successCallback(data) {

                            $scope.profiles = data;
                            $log.info("Profiles: %O", $scope.profiles);

                            $scope.profilesToUpdate = angular.copy($scope.profiles);

                            APIService.getOrganizations(selectedOrganization.id).then(
                                function successCallback(data) {

                                    $scope.organizations = UtilsService.organizationOrderTree(data);

                                    $timeout(function () {
                                        $scope.kinshipLevels = UtilsService.organizationBuildKinshipLevel($scope.organizations);
                                    }, 0);

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

'use strict';

angular.module('APP')
    .controller('PersonHomeCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $filter, $timeout, UtilsService,
                                            Person, ValidationService, currentUser, currentOrganization, ModalService, APIService, ResourceService) {

        $scope.items = null;
        $scope.itemsLoading = null;

        $scope.selectedItem = null;

        $scope.userRoles = null;
        $scope.organizationRoles = null;
        $scope.organizationRolesLoading = null;

        $scope.organizations = null;

        $scope.keywordFilter = null;
        $scope.organizationFilter = null;
        $scope.roleFilter = null;

        $scope.pattern = ValidationService.PATTERN;

        $scope.kinshipLevels = null;

        $scope.filter = {
            organization : null,
            role: null,
            keyword: null
        };
        
        $scope.add = function () {

            $scope.selectedItem = null;

            setTimeout(function () {
                $scope.selectedItem = new Person();
                $scope.onOrganizationChanged($scope.selectedItem.organization);

                $scope.$apply();
            }, 0);

        };

        $scope.edit = function (item) {

            $scope.selectedItem = null;

            setTimeout(function () {
                $scope.selectedItem = angular.copy(item);
                $scope.onOrganizationChanged($scope.selectedItem.organization);

                $scope.$apply();
            }, 0);

        };

        $scope.cancel = function () {

            $scope.selectedItem = null;

        };

        $scope.delete = function (item) {

            ModalService.dialogConfirm(
                'Delete', 'Person <strong>' + item.firstname + " " + item.lastname + '</strong> will be deleted. May I proceed?',

                function onConfirmAction() {

                    return APIService.deleteUser(item.id);

                    // if(item.cvAttachmentId != null) {
                    //     return $q(function(resolve, reject) {
                    //         APIService.deleteAttachment(item.cvAttachmentId).then(
                    //             function success(data) {
                    //                 return APIService.deletePerson(item.id).then(resolve, reject);
                    //             }, reject);
                    //     });
                    // } else {
                    //     return APIService.deletePerson(item.id);
                    // }

                }
            ).then(init);

        };

        $scope.save = function (item, form) {

            if (form.$invalid) {

                form.$dirty = true;

                angular.forEach(form.$error, function (field) {

                    angular.forEach(field, function (errorField) {
                        angular.element(document.querySelector('[name="' + errorField.$name + '"]')).addClass('ng-touched');
                        errorField.$dirty = true;
                    });
                });

                return false;
            }

            if (item.id == null) {

                createUser(item);

                // if (item.cvAttachment) {
                //     APIService.createAttachment(item.cvAttachment).then(
                //         function success(data) {
                //             item.cvAttachmentId = data.id;
                //             createPerson(item);
                //         }, savingError);
                // }


            } else {

                updateUser(item);

                // if (!item.cvAttachment && item.cvAttachmentId) {
                //     APIService.deleteAttachment(item.cvAttachmentId).then(
                //         function success(data) {
                //             item.cvAttachmentId = null;
                //             updatePerson(item);
                //         }, savingError);
                // }
                // else if (item.cvAttachment && item.cvAttachmentId == null) {
                //     APIService.createAttachment(item.cvAttachment).then(
                //         function success(data) {
                //             item.cvAttachmentId = data.id;
                //             updatePerson(item);
                //         }, savingError);
                // } else if (item.cvAttachment) {
                //     APIService.createAttachment(item.cvAttachment).then(
                //         function success(data) {
                //             item.cvAttachmentId = data.id;
                //             updatePerson(item);
                //         }, savingError);
                // } else {


            }

            function createUser(item) {

                APIService.createUser(item).then(
                    function success(item) {

                        init();
                        $scope.selectedItem = item;

                    },

                    savingError
                );

            }

            function updateUser(item) {

                APIService.updateUser(item).then(
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

            if ($scope.filter.role && item.role) {
                result &= item.role.id == $scope.filter.role.id;
            }

            if ($scope.filter.organization && item.organization) {
                result &= item.organization.id == $scope.filter.organization.id;
            }

            if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
                var name =  (item.firstname || '') + ' ' + (item.lastname || '');
                result &= (name.toLowerCase().indexOf($scope.filter.keyword.toLowerCase()) != -1);
            }

            return result;
        };

        $scope.onOrganizationChanged = function (org, form) {

            $scope.organizationRolesLoading = null;
            $scope.organizationRoles = null;

            if (org) {

                $scope.organizationRolesLoading = true;

                APIService.getUserRoles(org.id).then(
                    function successCallback(data) {

                        $scope.organizationRolesLoading = null;
                        $scope.organizationRoles = data || [];

                        if (form) {
                            form.$setPristine();
                            form.$setUntouched();

                        }
                    }
                );
            }
        };

        // TODO chiedere a Marco se questa funzione serve
        function savingError() {
            $scope.loader = false;
            $scope.errorMessage = "Saving data error!";
        }

        function init() {

            $scope.items = null;
            $scope.itemsLoading = true;

            $scope.selectedItem = null;

            var selectedOrganization = ResourceService.getSelectedOrganization();
            
            APIService.getUsers(selectedOrganization ? selectedOrganization.id : null).then(
                function successCallback(data) {

                    $scope.items = data;

                    $scope.userRoles = $filter('unique')($scope.items, 'role.id')
                        .filter(function (item) {
                            return !item.role.deleted;
                        })

                        .map(function (item) {
                            return item.role;
                        });


                    APIService.getOrganizations(selectedOrganization ? selectedOrganization.id : null).then(
                        function successCallback(data) {

                            $scope.organizations = UtilsService.organizationOrderTree(data);
                            $scope.itemsLoading = null;

                            $timeout(function () {
                                $scope.kinshipLevels = UtilsService.organizationBuildKinshipLevel($scope.organizations);
                            }, 0);


                        });
                }
            );

        }

        init();

    });

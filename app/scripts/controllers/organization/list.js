'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
        .controller('OrganizationListCtrl', function ($scope, $state, $translate, $q, $uibModal, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

            $scope.permissionService = PermissionService;
            $scope.items = [];

            $scope.tableConfig = {
                itemsPerPage: 5,
                maxPages: 9
            }
            
            $scope.itemsListFilterOptions = [
                {value: "!DELETED", label: "ALL"},
                {value: "DELETED", label: "DELETED"}
            ];

            $scope.view = function(item) {
                $state.go('organization.view', {'organizationId':item.id});
            };


            $scope.enableOrganization = function (org)
            {
                if (org == null)
                    return;

                ModalService.dialogConfirm($translate.instant("dialog.confirm.organization.enable.title"),
                    $translate.instant("dialog.confirm.organization.enable.message"), function (close) {

                        APIService.enableOrganization(org.id).then(
                            function successCallback(data) {
                                org.status = data.status;
                                close();
                            },
                            function errorCallback() {
                                close();
                            }
                        );
                    });
            };

            $scope.disableOrganization = function (org)
            {

                if (org == null)
                    return;

                ModalService.dialogConfirm($translate.instant("organization.disable.confirm.title"),
                    $translate.instant("organizationdisable.confirm.message"), function (success, error) {

                        APIService.disableOrganization(org.id).then(
                            function successCallback(data) {
                                org.status = data.status;
                                success();
                            },
                            function errorCallback() {
                                notify.logError($translate.instant("organizationdisable.disabled.error"));
                            }
                        );
                    });
            };


            function loadData() {

                if (PermissionService.isConsultant()) {
                    APIService.getOrganizations().then(
                        function successCallback(data) {
                            $scope.items = data;
                        });
                } else {
                    APIService.getOrganizationById(currentOrganization.id).then(
                        function successCallback(data) {
                            $scope.items = [data];
                        });
                }
            }

            loadData();
        });

'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
        .controller('UserListCtrl', function ($scope, $state, $translate, $q, $uibModal, currentUser, currentOrganization, selectedOrganizationId, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

            console.log("UserListCtrl: " + selectedOrganizationId );


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


            $scope.enableUser = function (usr)
            {
                if (usr == null)
                    return;

                ModalService.dialogConfirm($translate.instant("user.enable.confirm.title"),
                    $translate.instant("user.enable.confirm.message"), function (close) {

                        APIService.enableUser(usr.id).then(
                            function successCallback(data) {
                                usr.status = data.status;
                                close();
                            },
                            function errorCallback(data) {
                                notify.logError(data.message);
                                close();
                            }
                        );
                    });
            };

            $scope.disableUser = function (usr)
            {
                if (usr == null)
                    return;

                ModalService.dialogConfirm($translate.instant("user.disable.confirm.title"),
                    $translate.instant("user.disable.confirm.message"), function (close) {

                        APIService.disableUser(usr.id).then(
                            function successCallback(data) {
                                usr.status = data.status;
                                close();
                            });
                    });
            };


            function loadData() {

                APIService.getOrganizationById(selectedOrganizationId).then(
                    function successCallback(org){
                        $scope.organization = org;

                        APIService.getUsers(selectedOrganizationId).then(
                            function successCallback(users) {
                                $scope.items = users;
                            });
                    }
                );
            }

            loadData();
        });

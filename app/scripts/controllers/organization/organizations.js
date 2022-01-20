'use strict';

angular.module('APP')
        .controller('OrganizationsManageCtrl', function ($scope, $state, $translate, $q, currentUser, currentOrganization, PermissionService, ModalService, APIService, notify, ENV) {

            $scope.permissionService = PermissionService;

            $scope.orgs = null;
            $scope.users = null;
            $scope.cntx = 'org'; // 'org' | 'usr'
            $scope.mode = 'list'; // 'list' | 'edit'
            $scope.selectedOrganization = null;
            $scope.selectedUser = null;
   
            $scope.userTypeOptions = [
                {value: "SIMPLE", label: "User"},
                {value: "ADMIN", label: "Administrator"}
            ];

            $scope.addOrganization = function () {
                $scope.selectedOrganization = {};
                $scope.mode = 'edit';
            };

            $scope.addUser = function () {
                $scope.selectedUser = {
                    organizationId: $scope.selectedOrganization.id
                };
                $scope.mode = 'edit';
            };

            $scope.editOrganization = function (org)
            {
                // clone organization item
                $scope.selectedOrganization = JSON.parse(JSON.stringify(org));
                $scope.mode = 'edit';
            };

            $scope.editUser = function (usr)
            {
                // clone user item
                $scope.selectedUser = JSON.parse(JSON.stringify(usr));
                $scope.mode = 'edit';
            };

            $scope.isCurrentUser = function (userId)
            {
                return currentUser.id == userId
            };

            $scope.manageUsers = function (org)
            {
                $scope.selectedOrganization = org;

                APIService.getUsers(org.id).then(
                        function successCallback(users) {
                            $scope.users = users;
                            $scope.cntx = 'usr';
                        },
                        function errorCallback() {
                            notify.logError($translate.instant("org-users-load-error"));
                        }
                );
            };

            function init() {

                if (currentOrganization.type == 'CONSULTANT')
                {
                    APIService.getOrganizations().then(
                            function successCallback(data) {
                                $scope.orgs = data;
                            });
                } else
                {
                    APIService.getOrganizationById(currentOrganization.id).then(
                            function successCallback(data) {
                                $scope.orgs = [data];
                            });
                }
            };

            init();

        });

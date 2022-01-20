'use strict';


angular.module('APP')
        .controller('UserDetailCtrl', function ($scope, $state, $translate, $timeout, $log, ModalService, APIService, ResourceService, PermissionService, notify) {

            var mode = 'edit'; //'add' : // 'view', 'edit';

            var originalUser = null;
            $scope.permissionService = PermissionService;

            $scope.languageOptions = ResourceService.getLanguages();

            $scope.userTypeOptions = [
                {value: "TRACER", label: $translate.instant("user.type.tracer"), level: 0},
                {value: "SIMPLE", label: $translate.instant("user.type.simple"), level: 1},
                {value: "ADMIN", label: $translate.instant("user.type.admin"), level: 2},
                {value: "PURCHASER" , label: $translate.instant("user.type.purchaser"), level: 3},
                {value: "SUPERADMIN" , label: $translate.instant("user.type.superadmin"), level: 4}
            ];

            $scope.filteredUserTypeOptions = [];
            setFilteredUserTypeOptions();

            function setFilteredUserTypeOptions(){
                for(var typeIndex = 0; typeIndex < $scope.userTypeOptions.length; typeIndex++){
                    if(ResourceService.getCurrentUser().userType == $scope.userTypeOptions[typeIndex].value){
                        var currentUserType =  $scope.userTypeOptions[typeIndex];
                        break;
                    }
                }
                for(var typeIndex = 0; typeIndex < $scope.userTypeOptions.length; typeIndex++){
                    if(currentUserType.level >= $scope.userTypeOptions[typeIndex].level){
                        $scope.filteredUserTypeOptions.push($scope.userTypeOptions[typeIndex]);
                    }
                }
            }

            $scope.isEditMode = function() {
                return mode == 'edit';
            };

            $scope.isAddMode = function() {
                return mode == 'add';
            };

            $scope.isMe = function(user) {
                return user.id == ResourceService.getCurrentUser().id;
            };


            $scope.backToUserList = function ()
            {
                if ($scope.user == null  || angular.equals(originalUser, $scope.user))
                    return $state.go('organization.users.list', {'organizationId': $scope.organization.id});

                ModalService.dialogConfirm($translate.instant("usr-edit-discard-confirm-title"),
                    $translate.instant("usr-edit-discard-confirm-message"), function (close) {
                        $state.go('organization.users.list', {'organizationId': $scope.organization.id});
                        close();
                    });
            };


            $scope.saveUser = function ()
            {
                // check for changes
                if (!angular.equals(originalUser, $scope.user))
                {
                    if ($scope.user.id != null)
                    {
                        APIService.updateUser($scope.user).then(
                            function successCallback(data) {
                                jQuery.extend(originalUser, data);
                                notify.logSuccess($translate.instant("user.save.success"));
                                $state.go('organization.users.list', {'organizationId' : $scope.organization.id})
                            });
                    } else
                    {
                        APIService.createUser($scope.user).then(
                            function successCallback(data) {
                                notify.logSuccess($translate.instant("user.create.success"));
                                $state.go('organization.users.list', {'organizationId' : $scope.organization.id})
                            });
                    }
                }
            };


            $scope.backToOrganizationList = function ()
            {
                // check for changes
                if (!angular.equals(originalOrganization, $scope.organization))
                {
                    ModalService.dialogConfirm($translate.instant("dialog.confirm.organization.discard.changes.title"),
                        $translate.instant("dialog.confirm.organization.discard.changes.message"), function (close) {
                            $state.go('organization.list');
                            close();
                        });
                } else {
                    $state.go('organization.list');
                }
            };

            $scope.hasChanged = function() {

                if(!$scope.organization || !$scope.organization.id) {
                    return true;
                }

                return !angular.equals($scope.order, $scope.originalOrder);
            };

            function init() {

                $scope.$watch('organization', function(organization) {

                    if(organization) {
                        if ($scope.user == null || $scope.user.id == null) {
                            mode = 'add';

                            $scope.user = {
                                organizationId: organization.id,
                                language: {
                                    code: organization.language.code
                                }
                            };
                        }
                        else {

                        }

                        originalUser = angular.copy($scope.user);
                    }
                });


            }

            init();
        });

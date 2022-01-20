'use strict';


angular.module('APP')
        .controller('OrganizationDetailCtrl', function ($scope, $state, $translate, $timeout, $log, ModalService, APIService, ResourceService, PermissionService, notify) {

            var mode = 'edit'; //'add' : // 'view', 'edit';

            var originalOrganization = null;
            $scope.permissionService = PermissionService;
            $scope.languageOptions = ResourceService.getLanguages();

            $scope.productCategoryOptions = null;
            $scope.placeCategoryOptions = null;

            $scope.isEditMode = function() {
                return mode == 'edit';
            };

            $scope.isAddMode = function() {
                return mode == 'add';
            };

            $scope.isMe = function(user) {
                return user.id == ResourceService.getCurrentUser().id;
            };

            $scope.saveOrganization = function ()
            {
                // check for changes
                if (!angular.equals(originalOrganization, $scope.organization))
                {
                    if ($scope.organization.id != null)
                    {
                        APIService.updateOrganization($scope.organization).then(
                            function successCallback(data) {
                                jQuery.extend(originalOrganization, data);
                                notify.logSuccess($translate.instant("organization.save.success"));

                                $state.go('organization.list');
                            });
                    } else {
                        APIService.createOrganization($scope.organization).then(
                            function successCallback(data) {
                                notify.logSuccess($translate.instant("organization.save.success"));
                                $state.go('organization.list');
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

                $scope.productCategoryOptions = ResourceService.getProductCategories().filter(
                    function(c){ return c.parent == null; });

                $scope.placeCategoryOptions = ResourceService.getPlaceCategories().filter(
                    function(c){ return c.parent == null; });
                
                if ($scope.organization == null || $scope.organization.id == null){
                    mode = 'add';

                    $scope.organization = {
                        language : {
                            code : 'it-IT'
                        }
                    };
                } 

                originalOrganization = angular.copy($scope.organization);
            }

            init();
        });

'use strict';

angular.module('APP')
        .controller('CleaningProductsCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
                                                      PackagingMaterial, MaterialCategory,
                                                      APIService, ResourceService, ValidationService, ModalService) {
    
            $scope.prerequisites = null;
            $scope.audits = null;
            $scope.people = null;
            $scope.userRoles = null;
            $scope.trainings = null;
            $scope.items = [];

            $scope.loading = null;

            $scope.selectedOrganization = ResourceService.getSelectedOrganization();

            $scope.$on('resourceChange', function () {

                var changedSelectedOrganization = ResourceService.getSelectedOrganization();
                if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
                    $scope.selectedOrganization = changedSelectedOrganization;
                    init();
                }

            });

            $scope.delete = function(item){

                ModalService.dialogConfirm($translate.instant("alertMessage.delete"), $translate.instant("entity.material") + ' <strong> ' + item.name + '</strong> ' + $translate.instant("alertMessage.willBeDeleted"),
                    function onConfirmAction() {

                        $log.info("Deleting material: %O", item);
                        return APIService.deleteMaterial(item.id);

                    }
                ).then(init);

            };

            $scope.viewSupplier = function (item) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'views/prerequisite/cleaning/templates/cleaning.material.supplier.detail.tmpl.html',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        item: function () {
                            return item;
                        }
                    },
                    controller: ['$scope', '$uibModalInstance', '$translate', 'item',
                        function ($scope, $uibModalInstance, $translate, item) {

                            $scope.item = item;

                            $scope.close = function () {
                                $uibModalInstance.dismiss();
                            };

                            function init() {

                            }

                            init();

                        }]
                });

            };

            $scope.add = function(item) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'views/prerequisite/cleaning/templates/cleaning.material.detail.tmpl.html',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        item: function () {
                            return item ? item : new PackagingMaterial();
                        },
                        selectedOrganization: function () {
                            return $scope.selectedOrganization;
                        }
                    },
                    controller: ['$scope', '$uibModalInstance', '$translate', 'item', 'selectedOrganization', 'APIService', 'ValidationService',
                        function ($scope, $uibModalInstance, $translate, item, selectedOrganization, APIService, ValidationService) {

                            $scope.item = item;
                            $scope.item.type = $scope.item.type ? $scope.item.type : PackagingMaterial.TYPES.CLEANING;
                            $scope.categories = null;
                            $scope.suppliers = null;

                            $scope.save = function(form) {

                                if(form.$invalid){
                                    ValidationService.dirtyForm(form);
                                    return false;
                                }

                                if($scope.item.id == null){

                                    APIService.createMaterial($scope.item).then(
                                        function success(){

                                            $uibModalInstance.close();

                                        });

                                } else {

                                    APIService.updateMaterial($scope.item).then(
                                        function success(){

                                            $uibModalInstance.close();

                                        });

                                }

                            };

                            $scope.close = function () {
                                $uibModalInstance.dismiss();
                            };

                            function init() {

                                $scope.loading = true;

                                APIService.getSuppliersByOrganizationId(selectedOrganization.id).then(
                                    function success(data){

                                        $scope.suppliers = data;
                                        $log.info("Suppliers: %O", data);

                                        APIService.getMaterialCategoriesByOrganizationId(selectedOrganization.id).then(
                                            function success(data){

                                                $scope.categories = data.filter(function(category){
                                                    return category.type == MaterialCategory.TYPES.CLEANING;
                                                });
                                                $log.info("Categories: %O", $scope.categories);

                                                $scope.loading = false;

                                            });

                                    });

                            }

                            init();

                        }]
                });

                modalInstance.result.then(
                    function confirm(item) {

                        init();

                    }, function dismiss() {
                        $log.info('Modal dismissed at: ' + new Date());
                    });

            };

            function init(){

                if (!$scope.selectedOrganization) {
                    return;
                }

                $scope.loading = true;

                APIService.getMaterialsByOrganizationId($scope.selectedOrganization.id).then(
                    function (data) {

                        $scope.items = data.filter(function(material){
                            return material.type == PackagingMaterial.TYPES.CLEANING;
                        });
                        $log.info("Materials: %O", $scope.items);

                        $scope.loading = false;

                    });

            }

            init();

        });

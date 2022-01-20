'use strict';

angular.module('APP')
    .controller('EquipmentEquipmentsCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
                                                     Attachment, EEquipment, Frequency,
                                                     PrerequisiteType, APIService, ResourceService) {

        $scope.Prerequisite = PrerequisiteType;
        $scope.originalSelectedItem = null;
        $scope.items = null;

        $scope.selectedOrganization = ResourceService.getSelectedOrganization();

        $scope.$on('resourceChange', function () {

            var changedSelectedOrganization = ResourceService.getSelectedOrganization();
            if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
                $scope.selectedOrganization = changedSelectedOrganization;
                init();
            }

        });

        $scope.edit = function(item) {

            $scope.item = angular.copy(item);
            $scope.originalSelectedItem = angular.copy($scope.item);

            var modalInstance = $uibModal.open({
                templateUrl: 'views/prerequisite/equipment/templates/equipment.detail.tmpl.html',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    item: function () {
                        return $scope.item;
                    },
                    selectedOrganization: function () {
                        return $scope.selectedOrganization;
                    },
                    originalSelectedItem: function () {
                        return $scope.originalSelectedItem;
                    },
                    suppliers: function () {
                        return $scope.suppliers;
                    },
                    equipmentTypes: function () {
                        return $scope.equipmentTypes;
                    }
                },
                controller: ['$scope', '$uibModalInstance', '$translate', 'item', 'selectedOrganization', 'originalSelectedItem', 'suppliers', 'equipmentTypes', 'APIService', 'ValidationService',
                    function ($scope, $uibModalInstance, $translate, item, selectedOrganization, originalSelectedItem, suppliers, equipmentTypes, APIService, ValidationService) {

                        $scope.item = item;
                        $scope.suppliers = suppliers;
                        $scope.equipmentTypes = equipmentTypes;
                        $scope.originalSelectedItem = originalSelectedItem;
                        $scope.frequencyPeriods = Frequency.PERIOD;

                        delete $scope.frequencyPeriods.HOUR;

                        function updateEquipment(item) {
                            return $q(function (resolve, reject) {

                                var attachment = item.attachment ? new Attachment(item.attachment.id) : null;
                                item = EEquipment.parse(item);
                                item.frequency.organization = {
                                    id: selectedOrganization.id
                                };

                                var original = $scope.originalSelectedItem.attachment;

                                // remove attachment ( even if it has been changed )
                                if (original &&
                                    (!attachment || attachment.id != original.id)) {
                                    APIService.deleteAttachment(original.id);
                                }

                                APIService.updateFrequency(item.frequency).then(
                                    function () {
                                        APIService.updateEEquipment(item).then(
                                            function success(data) {
                                                if (attachment && data.context) {
                                                    attachment.context = data.context;
                                                    return APIService.updateAttachment(attachment).then(
                                                        function success(){
                                                            resolve(data);
                                                        }, reject);
                                                } else {
                                                    resolve(data);
                                                }
                                            }, reject);
                                    });
                            })
                        }

                        $scope.save = function(form) {

                            if(form.$invalid){
                                ValidationService.dirtyForm(form);
                                return false;
                            }

                            updateEquipment($scope.item).then(
                                function success(){

                                    $uibModalInstance.close();

                                });

                        };

                        $scope.close = function () {
                            $uibModalInstance.dismiss();
                        };

                        function init() {

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
            
            var selectedOrganization = ResourceService.getSelectedOrganization();
            
            APIService.getEEquipmentsByOrganizationId(selectedOrganization.id).then(
                function success(data){

                    $scope.items = data;

                    var contextIds = $scope.items.map(function(equipment){
                        return equipment.context.id;
                    }).filter(function(id){
                        return id != null;
                    });

                    APIService.recursiveCall(contextIds, APIService.getAttachmentsByContextId).then(
                        function success(data){
                            $scope.items.forEach(function (equipment) {
                                equipment.attachment = data.find(function (attachment) {
                                        return equipment.context.id == attachment.context.id;
                                    }) || null;
                            });
                        });

                    APIService.getEquipmentTypesByOrganizationId(selectedOrganization.id).then(
                        function (data) {

                            $scope.equipmentTypes = data;

                            APIService.getSuppliersByOrganizationId(selectedOrganization.id).then(
                                function (data) {

                                    $scope.suppliers = data;

                                });

                        });
                    
                }
            );

        }

        init();
});

'use strict';

angular.module('APP')
    .controller('RiskClasses', function ($scope, $state, $translate, $q, $uibModal, $log, $document, $window,
                                                  currentUser, currentOrganization, Organization, RiskClass,
                                         ModalService, APIService, ResourceService, StorageService, notify,
                                         UtilsService, PermissionService) {

        var _selectedOrganization = null;

        $scope.items = null;
        $scope.selectedItem = null;
        $scope.keywordFilter = null;

        $scope.add = function() {
            $scope.selectedItem = new RiskClass();
        };

        $scope.edit = function(item) {
            $scope.selectedItem = angular.copy(item);
        };

        $scope.cancel = function() {
            $scope.selectedItem = null
        };

        $scope.delete = function(item){
            ModalService.dialogConfirm('Delete',
                'Equipment type <strong>' + item.name + '</strong> will be deleted. I proceed? ',
                function onConfirmAction() {
                    return APIService.deleteRiskClass(item.id);
                }
            ).then( init );
        };


        $scope.save = function (item) {
            if(item.id == null) {
                APIService.createRiskClass(item).then(
                    function success(item){
                        $scope.selectedItem = item;
                        notify.logSuccess('Success', 'Equipment type successfully created');
                        init();
                    },
                    savingError
                );
            } else {
                APIService.updateRiskClass(item).then(
                    function success(item){
                        $scope.selectedItem = item;
                        notify.logSuccess('Success', ' Equipment type successfully updated');
                        init();
                    },
                    savingError
                );
            }
        };

        $scope.cloneFromOrganizationParent = function() {

            $log.info("_selectedOrganization:", _selectedOrganization);
            if(_selectedOrganization && _selectedOrganization.organization) {

                APIService.getRiskClassesByOrganizationId(_selectedOrganization.organization.id).then(
                    function success(data){
                        if(data && data.length > 0) {
                            data.forEach(function (riskClass) {
                                riskClass.organization = new Organization(_selectedOrganization.id);
                            });

                            APIService.recursiveCall(data, APIService.createRiskClass).then(
                                function success(){
                                    notify.logSuccess('Ok!', 'Risk classes successfully created') ;
                                    init();
                                }, savingError );
                        } else {
                            notify.logWarning('Invalid cloning', 'No risk classes found on parent organization') ;
                        }
                    }, savingError)
            }
        };

        $scope.isValid = function(item) {
            return item != null &&
                item.name != null
        };

        $scope.itemsFilter = function(item){

            var result = true;

            if( $scope.keywordFilter && $scope.keywordFilter.length > 0  ) {
                var keyword = $scope.keywordFilter.toLowerCase();
                console.log(keyword);
                result &=  (item.name && item.name.toLowerCase().indexOf(keyword) != -1) ||
                    (item.description && item.description.toLowerCase().indexOf(keyword) != -1);
            }

            return result;
        };

        function savingError() {
            $scope.loader = false;
            $scope.errorMessage = "Saving data error!";
        }


        function init(){

            $scope.selectedItem = null;
            _selectedOrganization = ResourceService.getSelectedOrganization();

            APIService.getRiskClassesByOrganizationId(_selectedOrganization ? _selectedOrganization.id : null).then(
                function successCallback(data) {
                    $log.info("EquipmentTypes: %O", data);
                    $scope.items = data;
                }
            );
        }

        init();
    });

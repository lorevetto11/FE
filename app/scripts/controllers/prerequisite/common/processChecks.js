'use strict';

angular.module('APP')
        .controller('LayoutProcessChecksCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
                                                         Prerequisite, ProcessCheck, APIService) {
            $scope.items = [];
    
            $scope.add = function() {
                showDetailModal(new ProcessCheck(Prerequisite.LAYOUT), true);
            };
    
            $scope.edit = function(item) {
                showDetailModal(item, true);
            };
    
            $scope.view = function(item) {
                showDetailModal(item, false);
            };
    
            $scope.delete = function(item) {
                
                var procedure = $scope.procedures.find(function(p){
                    return p.id == item.procedureId;
                });
        
                ModalService.dialogConfirm('Delete',
                    'Monitoring for procedure <strong>' + procedure.title + '</strong> will be deleted. I proceed? ',
                    function onConfirmAction() {
                        return APIService.deleteMonitoring(item.id);
                    }
                ).then( loadMonitorings );
            }
    
            function showDetailModal(item, editMode) {
        
                var isNew = (item.id == null);
        
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/prerequisite/common/prerequisite.processChecks.tmpl.html',
                    size:'lg',
                    backdrop : 'static',
                    resolve: {
                        item : function(){
                            return item;
                        },
                        procedures : function(){
                            return $scope.procedures;
                        },
                        prerequisites : function() {
                            return $scope.prerequisites;
                        },
                        userRoles : function(){
                            return $scope.userRoles;
                        },
                        editMode : function() {
                            return editMode != null ? editMode : false;
                        }
                    },
                    controller: ['$scope', '$uibModalInstance', 'item', 'procedures', 'prerequisites', 'userRoles', 'editMode', 'Monitoring', 'StaffHygiene', 'notify',
                        function ($scope, $uibModalInstance, item, procedures, prerequisites, userRoles, editMode, Monitoring, StaffHygiene, notify) {
                    
                            $scope.editMode = editMode;
                            $scope.originalItem = item;
                            $scope.item = angular.copy(item);
                            $scope.procedures = procedures;
                            $scope.frequencyScales = Frequency.SCALE;
                            $scope.userRoles = userRoles;
                            $scope.prerequisites = prerequisites;
                    
                            $scope.save = function () {
                                $scope.loader = true;
                        
                                var prerequisiteId = $scope.item.destinationRole;
                        
                                var prerequisite = prerequisites.find(function(p){
                                    return p.userRoleId == $scope.item.destinationRole.id;
                                });
                        
                                $log.info("prerequisite: ",prerequisite);
                        
                                if(prerequisite == null) {
                                    prerequisite = new StaffHygiene($scope.item.destinationRole.id);
                                    APIService.createStaffHygiene(prerequisite).then(
                                        function(data) {
                                            prerequisite = data;
                                            saveMonitoring($scope.item, prerequisite.id);
                                        }
                                    );
                                } else {
                                    saveMonitoring($scope.item, prerequisite.id);
                                }
                            };
                    
                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };
                    
                            function saveMonitoring(item, prerequisiteId) {
                                item.prerequisiteId = prerequisiteId;
                                if(item.id == null) {
                                    APIService.createMonitoring(item).then(
                                        function success(item){
                                            $uibModalInstance.close(item);
                                            notify.logSuccess('Success', 'StaffHygiene monitoring successfully added');
                                        },
                                        savingError
                                    );
                                } else {
                                    APIService.updateMonitoring(item).then(
                                        function success(item){
                                            $uibModalInstance.close(item);
                                            notify.logSuccess('Success', 'StaffHygiene monitoring successfully updated');
                                        },
                                        savingError
                                    );
                                }
                            };
                    
                            function savingError() {
                                $scope.loader = false;
                                $scope.errorMessage = "Saving data error!";
                            }
                        }]
                });
        
                modalInstance.result.then(
                    function confirm(item) {
                        loadMonitorings();
                    }, function dismiss() {
                        $log.info('Modal dismissed at: ' + new Date());
                    });
            }
    
            function loadMonitorings(){
                APIService.getStaffHygienesByOrganizationId().then(
                    function success(data) {
                        $scope.prerequisites = data;
                        $log.info("prerequisites: ", $scope.prerequisites );
                
                        var prerequisiteIds = $scope.prerequisites.map(function(p){
                            return p.id;
                        });
                
                        APIService.getMonitoringsByOrganizationId().then(
                            function success(data) {
                                $scope.monitorings = data.filter(function(m) {
                                    return prerequisiteIds.indexOf(m.prerequisiteId) != -1 &&
                                        m.prerequisiteType == Prerequisite.STAFF_HYGIENE }
                                );
                                $log.info("monitorings: ", $scope.monitorings );
                        
                                var monitoringIds = $scope.monitorings.map(function(p){
                                    return p.id;
                                });
                        
                                APIService.getOutcomesByOrganizationId().then(
                                    function success(data) {
                                        $scope.outcomes = data.filter(function(o) {
                                            return monitoringIds.indexOf(o.monitoringId) != -1}
                                        );
                                
                                        $scope.items = [];
                                
                                        $scope.monitorings.forEach(function(m){
                                            var item =  {
                                                destinationRole : $scope.userRoles.find(function(r){
                                                    var pr = $scope.prerequisites.find(function(p){
                                                        return p.id == m.prerequisiteId;
                                                    });
                                                })
                                            };
                                            $scope.items.push(item);
                                        });
                                    });
                            });
                    });
            };
    
            function init(){
        
        
                APIService.getUserRolesByOrganizationId().then(
                    function success(data) {
                        $scope.userRoles = data;
                
                        APIService.getPeopleByOrganizationId().then(
                            function success(data) {
                                $scope.people = data;
                        
                                APIService.getProceduresByOrganizationId().then(
                                    function success(data) {
                                        $scope.procedures = data.filter(function(p){
                                            return p.prerequisiteType == Prerequisite.STAFF_HYGIENE;
                                        });
                                        $log.info("procedures:",  $scope.procedures );
                                
                                        loadMonitorings();
                                    });
                            });
                    });
            }
    
            init();
        });

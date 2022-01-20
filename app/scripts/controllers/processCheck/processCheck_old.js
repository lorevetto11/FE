'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
        .controller('ProcessCheckCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, Command, Layout, Shape, Color,
                                            Prerequisite, Frequency, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

            $scope.items = null;
            $scope.monitoring = null;
            $scope.outcomes = null;
            $scope.people = null;
            $scope.prerequisites = null;

            $scope.perform = function(audit) {
                showPerformModal(audit);
            };

            $scope.viewOutcome = function(outcome) {
                showPerformModal(null, outcome, false);
            };

            $scope.viewProcedure = function(monitoring) {
                showProcedureModal(monitoring);
            };

            $scope.getDueDate = function(monitoringFrequency, lastMonitoredDate) {
                
                if(monitoringFrequency && ( !monitoringFrequency.asNeeded && !monitoringFrequency.justOnce) ) {

                    if(!lastMonitoredDate) {
                        return new Date();
                    } else {

                        var dueDate = new Date(lastMonitoredDate);
                        dueDate.setHours(0);
                        dueDate.setMinutes(0);
                        dueDate.setSeconds(0);
                        dueDate.setMilliseconds(0);

                        $log.info('lastMonitoredDate:', lastMonitoredDate  + " - " + dueDate);

                        if(monitoringFrequency.scale == Frequency.SCALE.HOUR) {
                            dueDate.setHours(dueDate.getHours() + monitoringFrequency.value);
                        } else if(monitoringFrequency.scale == Frequency.SCALE.DAY) {
                            dueDate.setDate(dueDate.getDate() + monitoringFrequency.value);
                        } else if(monitoringFrequency.scale ==  Frequency.SCALE.MONTH) {
                            dueDate.setMonth(dueDate.getMonth() + monitoringFrequency.value);
                        } else if(monitoringFrequency.scale ==  Frequency.SCALE.WEEK) {
                            dueDate.setDate(dueDate.getDate() + monitoringFrequency.value * 7);
                        } else if(monitoringFrequency.scale ==  Frequency.SCALE.YEAR) {
                            dueDate.setFullYear(dueDate.getFullYear() + monitoringFrequency.value);
                        }

                        return dueDate;
                    }
                }
            };

            $scope.isToday = function(date){

                if(date){
                    var now = new Date();

                    var from = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    var to = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);

                    return now > from && now < to;

                }

                return true;
            };

            function showProcedureModal(procedure) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'views/monitoring/home/monitoring.detail.tmpl.html',
                    size:'lg',
                    backdrop : 'static',
                    resolve: {
                        item : function(){
                            return procedure;
                        },
                        userRoles : function() {
                            return $scope.userRoles;
                        }
                    },
                    controller: ['$scope', '$uibModalInstance', 'item', 'userRoles',
                        function ($scope, $uibModalInstance, item, userRoles) {

                            $scope.item = item;
                            $scope.editMode = false;
                            $scope.userRoles = userRoles;

                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };
                        }]
                });
            }


            function showPerformModal(monitoring, outcome, editMode) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'views/task/home/task.perform.tmpl.html',
                    size:'lg',
                    backdrop : 'static',
                    resolve: {
                        monitoring : function(){
                            return monitoring;
                        },
                        outcome : function(){
                            return outcome;
                        },
                        editMode : function(){
                            return editMode != false;
                        },
                        examiner : function() {
                            return currentUser;
                        }
                    },
                    controller: ['$scope', '$uibModalInstance', 'monitoring', 'outcome', 'examiner', 'editMode', 'Outcome',
                        function ($scope, $uibModalInstance, monitoring, outcome, examiner, editMode, Outcome) {

                            $scope.item = outcome || new Outcome(monitoring.id, examiner.id);
                            $scope.editMode = editMode;

                            $scope.save = function () {
                                $scope.loader = true;
                                $log.info($scope.item);
                                APIService.createOutcome($scope.item).then(
                                    function success(item){
                                        $uibModalInstance.close(item);
                                    },
                                    savingError
                                );
                            };

                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };

                            function savingError() {
                                $scope.loader = false;
                                $scope.errorMessage = "Saving data error!";
                            }


                            $scope.$watch('file', function(newValue){
                                $log.info('$scope.$watch(files)', newValue);
                            });

                            $scope.isValid = function() {
                                return $scope.item.attachment == null || $scope.item.attachment.file.size < 102400;
                            };
                        }]
                });

                modalInstance.result.then(
                    function confirm(item) {

                        if($scope.outcomes == null) {
                            $scope.outcomes = [];
                        }

                        $scope.outcomes.push(item);

                        init();

                }, function dismiss() {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }
            
            function getObjectOfControl(monitoring) {
                if(!monitoring) {
                    return null;
                }
                var pr = $scope.prerequisites.find(function(p){
                    return p.type == monitoring.prerequisiteType &&
                        p.id == monitoring.prerequisiteId;
                })
                if(pr) {
                    if (monitoring.prerequisiteType == Prerequisite.STAFF_HYGIENE) {
                        var userRole = $scope.userRoles.find(function(r){
                            return r.id == pr.userRoleId;
                        });
                        return userRole.name;
                    } else {
                        return pr.name;
                    }
                }
            };

            function loadPrerequisites() {

                return $q(function(resolve, reject) {

                var items = [];

                APIService.getLayoutsByOrganizationId().then(
                    function successCallback(data) {
                        items = items.concat(data);
                        APIService.getWaterSupplyByOrganizationId().then(
                            function successCallback(data) {
                                items = items.concat(data);
                                APIService.getAirConditioningByOrganizationId().then(
                                    function successCallback(data) {
                                        items = items.concat(data);
                                        APIService.getWasteDisposalByOrganizationId().then(
                                            function successCallback(data) {
                                                items = items.concat(data);;
                                                APIService.getEquipmentsByOrganizationId().then(
                                                    function successCallback(data) {
                                                        items = items.concat(data);
                                                        APIService.getCleaningsByOrganizationId().then(
                                                            function successCallback(data) {
                                                                items = items.concat(data);
                                                                APIService.getPestControlsByOrganizationId().then(
                                                                    function successCallback(data) {
                                                                        items = items.concat(data);
                                                                        APIService.getStaffHygienesByOrganizationId().then(
                                                                            function successCallback(data) {
                                                                                items = items.concat(data);

                                                                                resolve(items);
                                                                            });
                                                                    });
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
                });
            };

            function init() {

                $log.info("init: ", currentUser);

                loadPrerequisites().then(
                    function success(data) {
                        $scope.prerequisites = data;

                        APIService.getUserRolesByOrganizationId().then(
                            function successCallback(data) {
                                $scope.userRoles = data;

                                APIService.getPeopleByOrganizationId().then(
                                    function successCallback(data) {
                                        $scope.people = data;

                                        APIService.getProceduresByOrganizationId().then(
                                            function successCallback(data) {

                                                if (data) {
                                                    $scope.procedures = data.filter(function (m) {
                                                        return m.roleInChargeId && currentUser.roleId;
                                                    });

                                                    var proceduresIds = $scope.procedures.map(function (p) {
                                                        return p.id;
                                                    })

                                                    APIService.getMonitoringsByOrganizationId().then(
                                                        function successCallback(data) {

                                                            if (data) {
                                                                $scope.items = data.filter(function (m) {
                                                                    return proceduresIds.indexOf(m.procedureId) != -1;
                                                                });

                                                                var monitoringIds = $scope.items.map(function (m) {
                                                                    return m.id;
                                                                })

                                                                APIService.getOutcomesByOrganizationId().then(
                                                                    function successCallback(data) {
                                                                        if (data) {
                                                                            $scope.outcomes = data.filter(function (o) {
                                                                                return monitoringIds.indexOf(o.monitoringId) != -1;
                                                                            });
                                                                            $scope.items.forEach(function (m) {
                                                                                var outcomes = $scope.outcomes.filter(function (o) {
                                                                                    return o.monitoringId == m.id;
                                                                                }).sort(function (a, b) {
                                                                                    return a.createDate - b.createDate;
                                                                                });
                                                                                m.dueDate = $scope.getDueDate(m.frequency, outcomes[0] ? outcomes[0].createDate : null);
                                                                                m.objectOfControl = getObjectOfControl(m);

                                                                            });
                                                                            $scope.items = $scope.items.sort(function (a, b) {
                                                                                return a.dueDate - b.dueDate;
                                                                            })

                                                                        }
                                                                    }
                                                                );

                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        );
                                    });
                            });
                    });
            }

            init();
    });

'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
    .controller('AuditProcessCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $timeout, ProcessCheckPlanning, Noncompliance,
                                              Prerequisite, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {
        var COMPANY_COLOR = {
            'company 1': '#96BF0D',
            'company 2': '#FFB61C',
            'company 3': '#6A55C2',
            'company 4': '#2EC1CC'
        };

        $scope.items = null;
        $scope.inProgressItems = null;
        $scope.inProgressItem = null;
        $scope.selectedProcessCheck = null;
        $scope.selectedProcessCheckOutcome = null;
        $scope.outcomes = null;
        $scope.noncompliance = null;
        $scope.loading = null;

        $scope.selectedOrganization = ResourceService.getSelectedOrganization();

        $scope.$on('resourceChange', function () {

            var changedSelectedOrganization = ResourceService.getSelectedOrganization();
            if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
                $scope.selectedOrganization = changedSelectedOrganization;
                init();
            }

        });

        $scope.add = function () {
            showDetailModal(null, true);
        };

        $scope.edit = function (item) {
            showDetailModal(item, true);
        };

        $scope.view = function (item) {
            showDetailModal(item);
        };

        $scope.delete = function (item) {

            ModalService.dialogConfirm('Delete',
                'Monitoring <strong>' + item.name + '</strong> will be deleted. I proceed? ',
                function onConfirmAction() {

                    $log.info("Deleting Monitoring: %O", item);
                    return APIService.deleteMonitoring(item.id);

                }
            ).then(init);

        };

        $scope.takeInProgress = function (item) {

            if (item) {
                if (item.status == ProcessCheckPlanning.STATUS.CREATED) {

                    item.status = ProcessCheckPlanning.STATUS.INPROGRESS;
                    item.startDate = new Date();

                    $log.info("Updating process check: %O", item);
                    APIService.updateProcessCheckPlanning(item).then(
                        function success(item) {

                            $scope.inProgressItem = null;
                            $scope.selectedItem = item;

                            init();

                        }, savingError);

                } else {
                    $scope.inProgressItem = item;
                }

            }
        };

        $scope.cancelInProgressItem = function () {
            $scope.inProgressItem = null;
        };

        $scope.isInProgress = function (item) {
            return item && item.status == ProcessCheckPlanning.STATUS.INPROGRESS;
        };


        $scope.completeCheck = function (item) {
            
            item.status = ProcessCheckPlanning.STATUS.CLOSED;
            item.closeDate = new Date();

            $log.info("Updating process check: %O", item);
            APIService.updateProcessCheckPlanning(item).then(
                function success(item) {

                    $scope.inProgressItem = null;
                    $scope.selectedItem = item;

                    init();

                }, savingError);

        };

        $scope.viewProcessCheckDetail = function (item) {

            $scope.selectedProcessCheck = null;
            $scope.selectedProcessCheckOutcome = null;
            $scope.selectedProcessNoncompliance = null;

            $timeout(function () {

                $scope.selectedProcessCheck = item;
                $scope.selectedProcessCheckOutcome = $scope.outcomes.find(function (o) {
                    return o.processcheckPlanning.id == $scope.inProgressItem.id &&
                        o.processCheck.id == item.id;
                });
                $scope.selectedProcessNoncompliance = $scope.noncompliances.find(function (n) {
                    return n.processCheck.id == item.id;
                });

            }, 1);

        };

        $scope.perform = function (item) {

            var editMode = $scope.inProgressItem.status != ProcessCheckPlanning.STATUS.CLOSED;

            var modalInstance = $uibModal.open({
                templateUrl: 'views/audit/templates/processCheck.perform.tmpl.html',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    item: function () {
                        return item;
                    },
                    planning: function () {
                        return $scope.inProgressItem;
                    },
                    outcome : function(){
                        var outcome = $scope.outcomes.find(function(o){
                            return o.processcheckPlanning.id == $scope.inProgressItem.id &&
                                o.processCheck.id == item.id;
                        });

                        if (outcome && outcome.context) {

                            return APIService.getAttachmentsByContextId(outcome.context.id).then(
                                function success(attachments){

                                    attachments[0] ? outcome.attachment = attachments[0] : null;

                                    return outcome;

                                });

                        } else {

                            return outcome;

                        }
                    },
                    editMode: function () {
                        return editMode != null ? editMode : false;
                    }
                },
                controller: ['$scope', '$uibModalInstance', 'item', 'editMode', 'planning', 'outcome', 'ProcessCheckOutcome', 'ValidationService',
                    function ($scope, $uibModalInstance, item, editMode, planning, outcome, ProcessCheckOutcome, ValidationService) {

                        $scope.editMode = editMode;
                        $scope.originalItem = item;
                        $scope.item = angular.copy(item) || new ProcessCheckOutcome();
                        $scope.preRequisiteTypes = Prerequisite.TYPES;
                        $scope.outcome = angular.copy(outcome) ||
                            new ProcessCheckOutcome();

                        $scope.originalAttachment = angular.copy($scope.outcome.attachment);

                        $scope.save = function (item, form) {

                            if (form.$invalid) {
                                ValidationService.dirtyForm(form);
                                return false;
                            }

                            var attachment = item.attachment;
                            delete item.attachment;

                            $scope.loader = true;

                            if (item.id == null) {

                                item.processcheckPlanning = planning;
                                item.processCheck = $scope.item;

                                $log.info("Creating Outcome: %O", item);
                                APIService.createProcessCheckOutcome(item).then(
                                    function success(item) {

                                        if (attachment) {

                                            attachment.context = item.context;

                                            $log.info("Updating Attachment: %O", attachment);
                                            APIService.updateAttachment(attachment).then(
                                                function success() {

                                                    $uibModalInstance.close(item);

                                                });

                                        } else {

                                            $uibModalInstance.close(item);

                                        }

                                    }, savingError);

                            } else {

                                $log.info("Updating Outcome: %O", $scope.outcome);
                                APIService.updateProcessCheckOutcome($scope.outcome).then(
                                    function success(item) {

                                        if(attachment){

                                            attachment.context = item.context;

                                            if($scope.originalAttachment){

                                                if (attachment.id != $scope.originalAttachment.id) {

                                                    $log.info("Deleting Attachment: %O", $scope.originalAttachment);
                                                    APIService.deleteAttachment($scope.originalAttachment.id).then(
                                                        function success(){


                                                            $log.info("Updating Attachment: %O", attachment);
                                                            APIService.updateAttachment(attachment).then(
                                                                function success() {

                                                                    $uibModalInstance.close(item);

                                                                });

                                                        });

                                                } else {

                                                    $log.info("Updating Attachment: %O", attachment);
                                                    APIService.updateAttachment(attachment).then(
                                                        function success() {

                                                            $uibModalInstance.close(item);

                                                        });

                                                }

                                            } else {

                                                $log.info("Updating Attachment: %O", attachment);
                                                APIService.updateAttachment(attachment).then(
                                                    function success() {

                                                        $uibModalInstance.close(item);

                                                    });

                                            }

                                        } else {

                                            if($scope.originalAttachment){

                                                $log.info("Deleting Attachment: %O", $scope.originalAttachment);
                                                APIService.deleteAttachment($scope.originalAttachment.id).then(
                                                    function success(){

                                                        $uibModalInstance.close(item);

                                                    });

                                            } else {

                                                $uibModalInstance.close(item);

                                            }

                                        }

                                    }, savingError);

                            }

                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };

                        $scope.isValid = function () {
                            return true;
                        };

                        function savingError() {
                            $scope.loader = false;
                            $scope.errorMessage = "Saving data error!";
                        }
                    }]
            });

            modalInstance.result.then(
                function confirm(outcome) {

                    console.log(outcome);

                    var outcomeOriginal = $scope.outcomes.find(function (out) {
                        return out.id == outcome.id;
                    });

                    if (outcomeOriginal) {

                        var index = $scope.outcomes.indexOf(outcomeOriginal);

                        $scope.outcomes[index] = outcome;

                    } else {

                        $scope.outcomes.push(outcome);

                    }

                    $log.info($scope.outcomes);
                    $scope.viewProcessCheckDetail(item);

                }, function dismiss() {

                    $log.info('Modal dismissed at: ' + new Date());

                });

        };

        $scope.addNoncompliance = function (item) {

            var modalInstance = $uibModal.open({
                templateUrl: 'views/noncompliance/templates/noncompliance.detail.tmpl.html',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    processCheck: function () {
                        return item;
                    },
                    systemCheckRequirement: function () {
                        return null;
                    },
                    noncompliance: function () {
                        var obj = $scope.noncompliances.find(function (n) {
                            return n.processCheck.id == item.id;
                        });

                        if (obj == null) {
                            obj = new Noncompliance();
                            obj.processCheck = item;
                        }
                        return obj;
                    },
                    editMode: function () {
                        if ($scope.inProgressItem.status == ProcessCheckPlanning.STATUS.CLOSED) {
                            return false;
                        }
                        return null;
                    },
                    prerequisites: function () {
                        return null;
                    }
                },
                controller: 'NoncomplianceDetailCtrl'
            });

            modalInstance.result.then(
                function confirm(noncompliance) {

                    var nonComplianceOriginal = $scope.noncompliances.find(function (non) {
                        return non.id == noncompliance.id;
                    });

                    if (nonComplianceOriginal) {

                        var index = $scope.noncompliances.indexOf(nonComplianceOriginal);

                        $scope.noncompliances[index] = noncompliance;

                    } else {

                        $scope.noncompliances.push(noncompliance);

                    }

                    $scope.viewProcessCheckDetail(item);

                    $scope.$emit('Noncompliance-update');

                }, function dismiss() {
                    $log.info('Modal dismissed at: ' + new Date());
                });
        };


        function savingError() {
            $scope.loader = false;
            $scope.errorMessage = "Saving data error!";
        }


        function showDetailModal(item, editMode) {

            var isNew = (item == null);

            var modalInstance = $uibModal.open({
                templateUrl: 'views/monitoring/home/monitoring.detail.tmpl.html',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    item: function () {
                        return item;
                    },
                    editMode: function () {
                        return editMode != null ? editMode : false;
                    }
                },
                controller: ['$scope', '$uibModalInstance', 'item', 'editMode', 'Prerequisite',
                    function ($scope, $uibModalInstance, item, editMode, Prerequisite) {

                        $scope.editMode = editMode;
                        $scope.originalItem = item;
                        $scope.item = angular.copy(item) || {};
                        $scope.preRequisiteTypes = Prerequisite.TYPES;
                        $scope.people = null;


                        $scope.save = function () {
                            $scope.loader = true;
                            if ($scope.item.id == null) {
                                APIService.createMonitoring($scope.item).then(
                                    function success(item) {
                                        $uibModalInstance.close(item);
                                    },
                                    savingError
                                );
                            } else {
                                APIService.updateMonitoring($scope.item).then(
                                    function success(item) {
                                        $uibModalInstance.close(item);
                                    },
                                    savingError
                                );
                            }
                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };

                        function savingError() {
                            $scope.loader = false;
                            $scope.errorMessage = "Saving data error!";
                        }

                        (function init() {

                            APIService.getPeopleByOrganizationId().then(
                                function success(data) {
                                    $scope.people = data;
                                }
                            );

                        })();
                    }]
            });

            modalInstance.result.then(
                function confirm(item) {

                    if (isNew) {
                        $scope.items.push(item);
                    } // else {
                    //      // init();
                    // }
                }, function dismiss() {
                    $log.info('Modal dismissed at: ' + new Date());
                });
        }

        $scope.uiConfig = {
            calendar: {
                height: 450,
                editable: false,
                header: {
                    left: 'title',
                    center: '',
                    right: 'today prev,next'
                },
                eventClick: function (date, jsEvent, view) {
                    $scope.selectedItem = null;
                    $timeout(function () {
                        $scope.selectedItem = date.data;
                    }, 100);
                }
            }
        };


        function buildEvents() {
            $scope.eventSources = null;
            $timeout(function () {
                if ($scope.items) {
                    $scope.events = [];
                    $scope.eventSources = [];

                    $scope.items.forEach(function (item) {
                        var event = {
                            title: item.company.name,
                            start: new Date(item.date),
                            allDay: true,
                            borderColor: '#5f5',//COMPANY_COLOR[item.company],
                            data: item
                        };

                        if (item.status == ProcessCheckPlanning.STATUS.INPROGRESS) {
                            event.color = '#f55';
                            event.textColor = '#fff';
                        }

                        if (item.status == ProcessCheckPlanning.STATUS.CLOSED) {
                            event.color = '#ddd';
                            event.textColor = '#fff';
                        }

                        $scope.events.push(event);
                    });
                    $scope.eventSources = [$scope.events];
                }
            }, 1);

        }

        function init() {

            if (!$scope.selectedOrganization) {
                return;
            }

            $scope.loading = true;

            APIService.getProcessChecksByOrganizationId($scope.selectedOrganization.id).then(
                function successCallback(data) {

                    $log.info("ProcessChecks: %O", data);
                    $scope.processChecks = data;

                    var processCheckIds = $scope.processChecks.map(function (processCheck) {
                        return processCheck.id;
                    });

                    APIService.recursiveCall(processCheckIds, APIService.getNoncompliancesByProcessCheckId).then(
                        function successCallback(data) {

                            $log.info("Non compliances: %O", data);
                            $scope.noncompliances = data;

                        });

                    APIService.getProcessCheckPlanningsByOrganizationId($scope.selectedOrganization.id).then(
                        function successCallback(data) {

                            $log.info("ProcessCheck Plannings: %O", data);
                            $scope.items = data;

                            $scope.inProgressItems = data.filter(function (p) {
                                return p.status == ProcessCheckPlanning.STATUS.INPROGRESS;
                            });

                            buildEvents();

                            $scope.items.forEach(function(planning){

                                planning.processchecks.forEach(function(processCheck){

                                    $scope.outcomes = [];

                                    APIService.getProcessCheckOutcomesByProcessCheckPlanningAndProcessCheck(planning.id, processCheck.id).then(
                                        function success(data){

                                            $scope.outcomes = $scope.outcomes.concat(data);

                                        });
                                    
                                });

                            });

                            $timeout(function(){

                                $scope.loading = false;

                            },0);

                        });

                });
        }

        init();
    });

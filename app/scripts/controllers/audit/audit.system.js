'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
        .controller('AuditSystemCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $timeout,  SystemCheckPlanning, Noncompliance,
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
            $scope.selectedSystemCheck = null;
            $scope.outcomes = null;
            $scope.noncompliance = null;
            $scope.requirements = null;
            $scope.loading = null;

            $scope.selectedOrganization = ResourceService.getSelectedOrganization();

            $scope.$on('resourceChange', function () {

                var changedSelectedOrganization = ResourceService.getSelectedOrganization();
                if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
                    $scope.selectedOrganization = changedSelectedOrganization;
                    init();
                }
                
            });

            $scope.add = function() {
                showDetailModal(null, true);
            };

            $scope.edit = function(item) {
                showDetailModal(item, true);
            };

            $scope.view = function(item) {
                showDetailModal(item);
            };

            $scope.delete = function(item){
                ModalService.dialogConfirm('Delete',
                    'Monitoring <strong>' + item.name + '</strong> will be deleted. I proceed? ',
                    function onConfirmAction() {
                        return APIService.deleteMonitoring(item.id);
                    }
                ).then( init );
            };

            $scope.takeInProgress = function(item) {

                if(item){

                    if(item.status == SystemCheckPlanning.STATUS.CREATED) {

                        item.status = SystemCheckPlanning.STATUS.INPROGRESS;
                        item.startDate = new Date();

                        $log.info("Updating system check: %O", item);
                        APIService.updateSystemCheckPlanning(item).then(
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

            $scope.cancelInProgressItem = function(){
                $scope.inProgressItem = null;
            };

            $scope.isInProgress = function(item) {
              return item && item.status == SystemCheckPlanning.STATUS.INPROGRESS;
            };


            $scope.completeCheck = function(item){

                item.status = SystemCheckPlanning.STATUS.CLOSED;
                item.closeDate = new Date();

                $log.info("Updating system check: %O", item);
                APIService.updateSystemCheckPlanning(item).then(
                    function success(item) {

                        $scope.inProgressItem = null;
                        $scope.selectedItem = item;

                        init();

                    }, savingError);

            };

            $scope.viewRequirements = function(item) {

                $scope.selectedSystemCheck = null;

                $timeout(function () {

                    $scope.selectedSystemCheck = item;

                }, 1);
            };

            $scope.performRequirement = function(item) {

                var editMode = $scope.inProgressItem.status != SystemCheckPlanning.STATUS.CLOSED;

                var modalInstance = $uibModal.open({
                    templateUrl: 'views/audit/templates/systemCheck.perform.tmpl.html',
                    size:'lg',
                    backdrop : 'static',
                    resolve: {
                        item : function(){
                            return item;
                        },
                        planning : function(){
                            return $scope.inProgressItem;
                        },
                        outcome : function(){
                            var outcome = $scope.outcomes.find(function(o){
                                return o.systemcheckPlanning.id == $scope.inProgressItem.id &&
                                    o.systemcheckRequirement.id == item.id;
                            });

                            if (outcome && outcome.context) {

                                return APIService.getAttachmentsByContextId(outcome.context.id).then(
                                    function success(attachments){

                                        attachments[0] ? outcome.attachment = attachments[0] : outcome.attachment = null;

                                        return outcome;

                                    });

                            } else {

                                return outcome;

                            }
                        },
                        requirements : function() {
                            return $scope.requirements;
                        },
                        editMode : function() {
                            return editMode != null ? editMode : false;
                        }
                    },
                    controller: ['$scope', '$uibModalInstance', 'item', 'planning','editMode', 'outcome', 'SystemCheckOutcome', 'ValidationService', 'requirements',
                        function ($scope, $uibModalInstance, item, planning, editMode, outcome, SystemCheckOutcome, ValidationService, requirements) {

                            $scope.editMode = editMode;
                            $scope.originalItem = item;
                            $scope.item = angular.copy(item) || {};
                            $scope.preRequisiteTypes = Prerequisite.TYPES;
                            $scope.outcome = angular.copy(outcome) ||
                                new SystemCheckOutcome();

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

                                    var systemcheckRequirement = requirements.find(function(requirement){
                                        return requirement.id == $scope.originalItem.id;
                                    });

                                    item.systemcheckRequirement = systemcheckRequirement;
                                    item.systemcheckPlanning = planning;

                                    $log.info("Creating Outcome: %O", item);
                                    APIService.createSystemCheckOutcome(item).then(
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
                                    APIService.updateSystemCheckOutcome($scope.outcome).then(
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
                                console.log('savingError');
                                $scope.loader = false;
                                $scope.errorMessage = "Saving data error!";
                            }

                            // (function init(){
                            //
                            //     APIService.getPeopleByOrganizationId().then(
                            //         function success(data){
                            //             $scope.people = data;
                            //         }
                            //     );
                            //
                            // })();
                        }]
                });

                modalInstance.result.then(
                    function confirm(outcome) {

                        var outcomeOriginal = $scope.outcomes.find(function(out){
                            return out.id == outcome.id;
                        });

                        if (outcomeOriginal) {

                            var index = $scope.outcomes.indexOf(outcomeOriginal);

                            $scope.outcomes[index] = outcome;

                        } else {

                            $scope.outcomes.push(outcome);

                        }

                        $log.info($scope.outcomes, $scope.inProgressItem);
                        
                        $scope.viewRequirements(item.systemCheck);

                    }, function dismiss() {
                        $log.info('Modal dismissed at: ' + new Date());
                    });
            };

            $scope.addNoncompliance = function(item) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'views/noncompliance/templates/noncompliance.detail.tmpl.html',
                    size:'lg',
                    backdrop : 'static',
                    resolve: {
                        processCheck : function(){
                            return null;
                        },
                        systemCheckRequirement : function(){
                            return item;
                        },
                        noncompliance : function() {
                            var obj = $scope.noncompliances.find(function(n){
                                return n.systemCheckRequirement.id == item.id;
                            });

                            if(obj == null) {
                                obj = new Noncompliance();
                                obj.systemCheckRequirement = item;
                            }
                            return obj;
                        },
                        editMode : function(){
                            if($scope.inProgressItem.status == 'closed') {
                                return false;
                            }
                            return null;
                        },
                        prerequisites: function(){
                            return null;
                        }
                    },
                    controller: 'NoncomplianceDetailCtrl'
                });

                modalInstance.result.then(
                    function confirm(noncompliance) {

                        var nonComplianceOriginal = $scope.noncompliances.find(function(non){
                            return non.id == noncompliance.id;
                        });

                        if (nonComplianceOriginal) {

                            var index = $scope.noncompliances.indexOf(nonComplianceOriginal);

                            $scope.noncompliances[index] = noncompliance;

                        } else {

                            $scope.noncompliances.push(noncompliance);

                        }

                        $scope.viewRequirements(item.systemCheck);

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
                    size:'lg',
                    backdrop : 'static',
                    resolve: {
                        item : function(){
                            return item;
                        },
                        editMode : function() {
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
                                if($scope.item.id == null) {
                                    APIService.createMonitoring($scope.item).then(
                                        function success(item){
                                            $uibModalInstance.close(item);
                                        },
                                        savingError
                                    );
                                } else {
                                    APIService.updateMonitoring( $scope.item).then(
                                        function success(item){
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

                            (function init(){

                                APIService.getPeopleByOrganizationId().then(
                                    function success(data){
                                        $scope.people = data;
                                    }
                                );

                            })();
                        }]
                });

                modalInstance.result.then(
                    function confirm(item) {

                        if(isNew){
                            $scope.items.push(item);
                        } // else {
                        //     init();
                        // }
                }, function dismiss() {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }

            $scope.uiConfig = {
                calendar:{
                    height: 450,
                    editable: false,
                    header:{
                        left: 'title',
                        center: '',
                        right: 'today prev,next'
                    },
                    eventClick: function( date, jsEvent, view){
                        $scope.selectedItem = null;
                        $timeout(function(){
                            $scope.selectedItem = date.data;
                        },100);
                    }
                }
            };


            function buildEvents() {
                $scope.eventSources = null;
                $timeout(function(){
                    if ($scope.items) {
                        $scope.events = [];
                        $scope.eventSources = [];

                        $scope.items.forEach(function (item) {
                            var event = {
                                title: item.company.name,
                                start: new Date(item.date),
                                allDay: true,
                                borderColor: '#5f5',//COMPANY_COLOR[item.company],
                                data : item
                            };

                            if(item.status == SystemCheckPlanning.STATUS.INPROGRESS) {
                                event.color = '#f55';//COMPANY_COLOR[item.company];
                                event.textColor = '#fff';
                            }

                            if(item.status == SystemCheckPlanning.STATUS.CLOSED) {
                                event.color = '#ddd';
                                event.textColor = '#fff';
                            }

                            $scope.events.push(event);
                        });
                        $scope.eventSources = [$scope.events];
                    }}, 1);

            }

            function init(){

                if (!$scope.selectedOrganization) {
                    return;
                }

                $scope.loading = true;

                APIService.getSystemChecksByOrganizationId($scope.selectedOrganization.id).then(
                    function successCallback(data) {

                        $log.info("SystemChecks: %O", data);
                        $scope.systemChecks = data;

                        var systemCheckIds = $scope.systemChecks.map(function(systemCheck){
                            return systemCheck.id;
                        });

                        var requirements = false;
                        var noncompliances = false;

                        APIService.recursiveCall(systemCheckIds, APIService.getSystemCheckRequirementsBySystemCheckId).then(
                            function successCallback(data) {

                                $log.info("SystemCheck Requirements: %O", data);
                                $scope.requirements = data;


                                var systemCheckRequirementIds = $scope.requirements.map(function(requirement){
                                    return requirement.id;
                                });

                                var idsCopy = angular.copy(systemCheckRequirementIds);

                                APIService.recursiveCall(idsCopy, APIService.getSystemCheckOutcomesBySystemCheckRequirementId).then(
                                    function successCallback(data) {

                                        $log.info("SystemCheck Outcomes: %O", data);
                                        $scope.outcomes = data;

                                        APIService.recursiveCall(systemCheckRequirementIds, APIService.getNoncompliancesBySystemCheckRequirementId).then(
                                            function successCallback(data) {

                                                $log.info("Non compliances: %O", data);
                                                $scope.noncompliances = data;

                                                APIService.getSystemCheckPlanningsByOrganizationId($scope.selectedOrganization.id).then(
                                                    function successCallback(data) {

                                                        $log.info("SystemCheck Plannings: %O", data);
                                                        $scope.items = data;

                                                        $scope.inProgressItems = data.filter(function(p){
                                                            return p.status == SystemCheckPlanning.STATUS.INPROGRESS;
                                                        });

                                                        buildEvents();

                                                        $scope.loading = false;

                                                    });

                                            });

                                    });

                            });

                    });

            }

            init();

    });

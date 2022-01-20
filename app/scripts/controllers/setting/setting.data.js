'use strict';

angular.module('APP')
        .controller('SettingDataCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $document, $window,
                                                 currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

            $scope.data = {};
            $scope.importedFile = null;
            $scope.exportingCounts = null;
            $scope.importingCounts = null;
            $scope.showSuccessMessage = false;

            var deletableContexts = [
                'context.outcomes',
                'context.processcheckoutcomes',
                'context.systemcheckoutcomes',
                'context.analysisparametervalues',
                'context.noncompliances',
                'context.monitorings',
                'context.attachment'
            ];

            $scope.export = function() {

                var exportData = {
                    date: new Date(),
                    user: currentUser,
                    data: $scope.data
                }

                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";

                (function (data, fileName) {
                        var json = JSON.stringify(exportData),
                            blob = new Blob([json], {type: "octet/stream"}),
                            url = $window.URL.createObjectURL(blob);
                        a.href = url;
                        a.download = "scm_export_" + new Date().toLocaleDateString() + ".json";
                        a.click();
                        $window.URL.revokeObjectURL(url);
                }());
            };


            $scope.import = function(data) {
                ModalService.dialogConfirm('Importing',
                    'All current data will be overwritten by the content of this file. I proceed? ',
                    function onConfirmAction() {
                        return $q(function(resolve, reject){
                            if(data){
                                var storage = $scope.importedFileContent.data;
                                APIService.importLocalStorage(storage);
                                resolve();
                            } else {
                                reject();
                            }
                        });
                    }
                ).then(
                    function() {
                        $scope.importedFile = null;
                        $scope.showSuccessMessage = true;

                        init();
                    }
                );
            }

            $scope.delete = function(context) {
                APIService.deleteAll(context).then(
                    function(){
                        init();
                    }
                );

            };

            $scope.parseContent = function(content) {
                var result = null;
                try{
                    result = JSON.parse(content);
                } catch(e){
                      $log.error('Invalid uploadedFile');
                }
                return result;
            };


            function init(){

                APIService.getUserRolesByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.userroles'] = data;

                APIService.getRelatedFrequenciesByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.relatedfrequencies'] = data;

                APIService.getPeopleByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.people'] = data;

                APIService.getMonitoringsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.monitorings'] = data;

                APIService.getOutcomesByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.outcomes'] = data;

                APIService.getProceduresByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.procedures'] = data;

                APIService.getCoursesByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.courses'] = data;

                APIService.getTrainingsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.trainings'] = data;

                APIService.getLayoutsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.layouts'] = data;

                APIService.getWaterSupplyByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.watersupplies'] = data;

                APIService.getAirConditioningByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.airconditionings'] = data;

                APIService.getWasteDisposalByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.wastedisposals'] = data;

                APIService.getEquipmentsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.equipments'] = data;

                APIService.getCleaningsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.cleanings'] = data;

                APIService.getPestControlsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.pestcontrols'] = data;

                APIService.getStaffHygienesByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.staffhygienes'] = data;

                APIService.getProcessChecksByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.processchecks'] = data;
    
    
                APIService.getProcessCheckPlanningsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.processcheckplannings'] = data;

                APIService.getProcessCheckOutcomesByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.processcheckoutcomes'] = data;

                APIService.getSystemChecksByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.systemchecks'] = data;

                APIService.getSystemCheckRequirementsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.systemcheckrequirements'] = data;

                APIService.getSystemCheckPlanningsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.systemcheckplannings'] = data;

                APIService.getSystemCheckOutcomesByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.systemcheckoutcomes'] = data;

                APIService.getNoncompliancesByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.noncompliances'] = data;

                APIService.getDangersByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.dangers'] = data;

                APIService.getAnalysisParametersByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.analysisparameters'] = data;

                APIService.getAnalysisParameterValuesByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.analysisparametervalues'] = data;

                APIService.getFloorsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.floors'] = data;

                APIService.getChartsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.charts'] = data;

                APIService.getAttachmentsByOrganizationId().then(
                    function successCallback(data) {
                        $scope.data['context.attachment'] = data;


                        $scope.exportingCounts = [];

                        for (var context in $scope.data) {
                            if ($scope.data.hasOwnProperty(context)) {
                                $scope.exportingCounts.push({
                                    context: context,
                                    value : $scope.data[context].length,
                                    deletable : deletableContexts.indexOf(context) != -1
                                });
                            }
                        }
                                                                            });
                                                                    });
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });
                    });



                $scope.$watch('importedFile', function(value){

                    if(value) {

                        $scope.showSuccessMessage = false;

                        $log.info('importedFile watched:', $scope.importedFile);
                        $scope.importedFileContent = $scope.parseContent($scope.importedFile.content);

                        $scope.importingCounts = [];

                        for (var context in $scope.importedFileContent.data) {
                            if ($scope.importedFileContent.data.hasOwnProperty(context)) {
                                $scope.importingCounts.push({
                                    context: context,
                                    value : $scope.importedFileContent.data[context].length
                                });
                            }
                        }

                    }
                });

            }

            init();
    });

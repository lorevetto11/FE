'use strict';

angular.module('APP')
        .controller('WaterSupplyAnalysisCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
                                                         Prerequisite, APIService) {

            $scope.preRequisites = null;
            $scope.audits = null;
            $scope.items =  null;

                function init(){

                    APIService.getWaterSupplyByOrganizationId().then(
                        function(data) {
                            $scope.preRequisites = data;

                            APIService.getMonitoringsByOrganizationId().then(
                                function(data) {
                                    $scope.audits = data;

                                    APIService.getOutcomesByOrganizationId().then(
                                        function(data) {
                                            $scope.items = angular.copy(data.filter(function(o){
                                                return o.attachment != null && o.preRequisiteType == Prerequisite.TYPES.WATER_SUPPLY;
                                            }));

                                            $scope.items.forEach(function(o){

                                                var audit = $scope.audits.find(function(a){
                                                    return o.auditId == a.id;
                                                });

                                                if(audit) {
                                                    o.preRequisite = $scope.preRequisites.find(function (p) {
                                                        return p.id == audit.prerequisiteId;
                                                    });
                                                }
                                            });

                                            $scope.items = $scope.items.sort(function(a,b){ return new Date(b.createDate) - new Date(a.createDate); });
                                        });
                                });
                        });
                };

                init();
        });

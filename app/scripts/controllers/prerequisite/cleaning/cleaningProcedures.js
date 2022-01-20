'use strict';

angular.module('APP')
        .controller('CleaningProceduresCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
                                                         Prerequisite, RiskClass, APIService) {

            $scope.Prerequisite = Prerequisite;
            $scope.items = [];

            function loadData(){
                $scope.items = [
                    {
                        riskClass : RiskClass.ND,
                        phase1:'Lavaggio',
                        phase2: null,
                        phase3: null,
                        phase4: null,
                        phase5: null,
                        frequency: 'Al bisogno'
                    },
                    {
                        riskClass : RiskClass.LOW,
                        phase1:'Lavaggio',
                        phase2: 'Detersione',
                        phase3: null,
                        phase4: null,
                        phase5: null,
                        frequency: 'ogni 2 gg'
                    },
                    {
                        riskClass : RiskClass.MEDIUM,
                        phase1:'Lavaggio',
                        phase2: 'Detersione',
                        phase3: 'Disinfezione',
                        phase4: null,
                        phase5: null,
                        frequency: 'ogni fine lavorazione'
                    },
                    {
                        riskClass : RiskClass.HIGH,
                        phase1:'Lavaggio',
                        phase2: 'Detersione',
                        phase3: 'Disinfezione',
                        phase4: 'CIP (clean in place)',
                        phase5: null,
                        frequency: 'ogni fine ciclio'
                    },
                    {
                        riskClass : RiskClass.VERY_HIGH,
                        phase1:'Lavaggio',
                        phase2: 'Detersione',
                        phase3: 'Disinfezione',
                        phase4: 'CIP (clean in place)',
                        phase5: 'Disinfezione con vapore',
                        frequency: 'ogni fine ciclio'
                    }
                ];

                $scope.details = [
                    {
                        code : 1,
                        title: 'Scopatura a umido - sistema preimpregnato',
                        revision: 'rev 0.1 del 10/02/2017',
                        personInCharge : 'Luca Rossi',
                        attachment: 'manuale.pdf'
                    },
                    {
                        code : 2,
                        title: 'Disinfezione pavimenti',
                        revision: 'rev 0.1 del 10/02/2017',
                        personInCharge : 'Luca Rossi',
                        attachment: 'manuale.pdf'
                    },
                    {
                        code : 3,
                        title: 'Pulizia e disinfeszione con il vapore',
                        revision: 'rev 0.1 del 10/02/2017',
                        personInCharge : 'Luca Rossi',
                        attachment: 'manuale.pdf'
                    },
                    {
                        code : 4,
                        title: 'Pulizia ascensori e montacarichi',
                        revision: 'rev 0.1 del 10/02/2017',
                        personInCharge : 'Luca Rossi',
                        attachment: 'manuale.pdf'
                    },
                    {
                        code : 5,
                        title: 'Spolveratura ad umido',
                        revision: 'rev 0.1 del 10/02/2017',
                        personInCharge : 'Luca Rossi',
                        attachment: 'manuale.pdf'
                    }
                ]

            }

                function init(){
                    loadData();
                }

                init();
        });

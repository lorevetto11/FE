angular.module('APP')

    .directive('wasteDisposalElementDetail', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                element : "=",
            },
            controller: function($scope, PrerequisiteType) {
                $scope.PrerequisiteType = PrerequisiteType;

            },
            templateUrl: 'views/prerequisite/wasteDisposal/wasteDisposal.detail.tmpl.html'
        };
    })

    .directive('wasteDisposalAnalysis', function () {
        return {
            restrict: "AE",
            replace: true,
            controller: 'WasteDisposalAnalysisCtrl',
            templateUrl: 'views/prerequisite/wasteDisposal/wasteDisposal.sampling.tmpl.html'
        };
    })

    .directive('wasteDisposalDetailAnalysis', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                element : "="
            },
            controller: 'WasteDisposalAnalysisCtrl',
            templateUrl: 'views/prerequisite/wasteDisposal/wasteDisposal.detail.sampling.tmpl.html'
        };
    })

    .directive('equipmentEquipments', function () {
        return {
            restrict: "AE",
            replace: true,
            scope : {
                elements : "="
            },
            controller: 'EquipmentEquipmentsCtrl',
            templateUrl: 'views/prerequisite/equipment/equipment.equipments.tmpl.html'
        };
    })

    .directive('equipmentElementDetail', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                element : "=",
            },
            controller: function($scope, $log, Frequency, PrerequisiteType, APIService, ResourceService) {

                $scope.PrerequisiteType = PrerequisiteType;
                $scope.period = Frequency.PERIOD;
                $scope.selectedOrganization = ResourceService.getSelectedOrganization();
                $scope.suppliers = null;

                $scope.$on('resourceChange', function () {

                    var changedSelectedOrganization = ResourceService.getSelectedOrganization();
                    if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
                        $scope.selectedOrganization = changedSelectedOrganization;
                        init();
                    }

                });

                function init() {
                    if(!$scope.element.id && PrerequisiteType.isEquipment($scope.element)){
                        $scope.element.equipment.frequency.type = "CUSTOM";
                        $scope.element.equipment.frequency.value = 0;
                        $scope.element.equipment.frequency.organization = $scope.selectedOrganization;
                    }

                    APIService.getSuppliersByOrganizationId($scope.selectedOrganization.id).then(
                        function (data) {
                            $scope.suppliers = data;
                        });

                }

                init();

            },
            templateUrl: 'views/prerequisite/equipment/equipment.detail.tmpl.html'
        };
    })

;





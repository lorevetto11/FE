angular.module('APP')

    .directive('layoutElementDetail', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                element : "=",
            },
            controller: function($scope, Color, RiskClass, PrerequisiteType, APIService, ResourceService, $log) {
                $scope.PrerequisiteType = PrerequisiteType;

                $scope.riskOptions = null;
                var _selectedOrganization = ResourceService.getSelectedOrganization();

                function init() {
                    if(PrerequisiteType.isLayout($scope.element)){
                        APIService.getRiskClassesByOrganizationId(_selectedOrganization.id).then(
                            function successCallback(data) {
                                $scope.riskOptions = data.sort(function(a,b){return a.order - b.order;});
                                $log.info("Risk classes: %O", $scope.riskOptions);

                                $log.info($scope.element);

                                if($scope.element.riskClass.id == -1) {
                                    $scope.element.riskClass = $scope.riskOptions[0];
                                }
                            }
                        );
                    }
                }

                init();

            },
            templateUrl: 'views/prerequisite/layout/layout.detail.tmpl.html'
        };
    })
    
    .directive('layoutProcessChecks', function () {
        return {
            restrict: "AE",
            replace: true,
            controller: 'LayoutProcessChecksCtrl',
            templateUrl: 'views/prerequisite/layout/layout.processChecks.tmpl.html'
        };
    })
;





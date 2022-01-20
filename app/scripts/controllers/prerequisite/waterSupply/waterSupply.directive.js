angular.module('APP')

    .directive('waterSupplyElementDetail', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                element : "=",
            },
            controller: function($scope, PrerequisiteType) {
                $scope.PrerequisiteType = PrerequisiteType;

            },
            templateUrl: 'views/prerequisite/waterSupply/waterSupply.detail.tmpl.html'
        };
    })

    .directive('waterSupplyAnalysis', function () {
        return {
            restrict: "AE",
            replace: true,
            controller: 'WaterSupplyAnalysisCtrl',
            templateUrl: 'views/prerequisite/waterSupply/waterSupply.sampling.tmpl.html'
        };
    })
/*
    .directive('waterSupplyDetailAnalysis', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                element : "="
            },
            controller: 'WaterSupplyAnalysisCtrl',
            templateUrl: 'views/prerequisite/waterSupply/waterSupply.detail.sampling.tmpl.html'
        };
    })
    */
;





angular.module('APP')
    .directive('packagingMaterials', function () {
        return {
            restrict: "AE",
            replace: true,
            controller: 'PackagingMaterialsCtrl',
            templateUrl: 'views/prerequisite/packaging/packaging.materials.tmpl.html'
        };
    })

    .directive('packagingMonitorings', function () {
        return {
            restrict: "AE",
            replace: true,
            controller: 'PackagingMonitoringsCtrl',
            templateUrl: 'views/prerequisite/packaging/packaging.monitorings.tmpl.html'
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
            templateUrl: 'views/prerequisite/waterSupply/waterSupply.detail.analysis.tmpl.html'
        };
    })
    */
;





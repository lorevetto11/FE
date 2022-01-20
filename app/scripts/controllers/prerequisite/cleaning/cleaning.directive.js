angular.module('APP')

    .directive('cleaningElementDetail', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                element : "=",
            },
            controller: function($scope, PrerequisiteType) {
                $scope.PrerequisiteType = PrerequisiteType;

            },
            templateUrl: 'views/prerequisite/cleaning/cleaning.detail.tmpl.html'
        };
    })

    .directive('cleaningAnalysis', function () {
        return {
            restrict: "AE",
            replace: true,
            controller: 'CleaningAnalysisCtrl',
            templateUrl: 'views/prerequisite/cleaning/cleaning.analysis.tmpl.html'
        };
    })

    .directive('cleaningProcedures', function () {
        return {
            restrict: "AE",
            replace: true,
            controller: 'CleaningProceduresCtrl',
            templateUrl: 'views/prerequisite/cleaning/cleaning.procedures.tmpl.html'
        };
    })
    .directive('cleaningProducts', function () {
        return {
            restrict: "AE",
            replace: true,
            controller: 'CleaningProductsCtrl',
            templateUrl: 'views/prerequisite/cleaning/cleaning.products.tmpl.html'
        };
    })



    .directive('cleaningDetailAnalysis', function () {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                element : "="
            },
            controller: 'CleaningAnalysisCtrl',
            templateUrl: 'views/prerequisite/cleaning/cleaning.detail.sampling.tmpl.html'
        };
    })
;





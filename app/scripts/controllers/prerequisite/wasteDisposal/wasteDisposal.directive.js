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
;





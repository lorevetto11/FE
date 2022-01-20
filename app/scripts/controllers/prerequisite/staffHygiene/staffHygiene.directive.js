angular.module('APP')
    .directive('staffHygieneUsers', function () {
        return {
            restrict: "AE",
            replace: true,
            controller: 'StaffHygieneUsersCtrl',
            templateUrl: 'views/prerequisite/staffHygiene/staffHygiene.users.tmpl.html'
        };
    })

    .directive('staffHygieneMonitorings', function () {
        return {
            restrict: "AE",
            replace: true,
            controller: 'StaffHygieneMonitoringsCtrl',
            templateUrl: 'views/prerequisite/staffHygiene/staffHygiene.monitorings.tmpl.html'
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





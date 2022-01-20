angular.module('APP')

.directive('dashboardNonCompliances', function dashboardNonCompliances() {
    return {
        replace: true,
        scope: {
            organization: '='
        },
        restrict: 'AE',
        templateUrl: 'views/dashboard/templates/dashboardNonCompliances.tmpl.html',
        controller: 'DashboardNonCompliancesCtrl'
    };
})

;
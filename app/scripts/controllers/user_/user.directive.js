angular.module('APP')
    .directive('userEdit', function organizationEdit() {
        return {
            replace: true,
            scope: {
                organization: "=",
                user: '='
            },
            restrict: 'EA',
            templateUrl: 'views/user/templates/userDetail.tmpl.html',
            controller: 'UserDetailCtrl',
        };
    })
;
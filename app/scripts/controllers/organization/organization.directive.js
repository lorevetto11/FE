angular.module('APP')
    .directive('organizationEdit', function organizationEdit() {
        return {
            replace: true,
            scope: {
                organization: '='
            },
            restrict: 'EA',
            templateUrl: 'views/organization/templates/organizationDetail.tmpl.html',
            controller: 'OrganizationDetailCtrl',
        };
    })


.directive('organizationSelector', function organizationSelector() {
    return {
        replace: true,
        scope: {
            page: '='
        },
        restrict: 'E',
        templateUrl: 'views/organization/templates/organizationSelector.tmpl.html',
        controller: 'OrganizationSelectorCtrl',
    };
})
/*
.directive('selectOrganization', function selectOrganization() {
    return {
        replace: true,
        scope: {
            items: '=',
            selectedItem: '=ngModel',
            onItemSelected: '&',
            required : '='
        },
        restrict: 'E',
        templateUrl: 'views/organization/templates/organizationInputSelect.tmpl.html',
        controller: 'OrganizationInputSelectCtrl',
    };
})
*/

.directive('organizationPlace', function organizationPlace() {
    return {
        replace: true,
        scope: {
            place: '=ngModel'
        },
        restrict: 'AE',
        require: ['^form','ngModel'],
        templateUrl: 'views/organization/templates/organizationPlace.tmpl.html',
        link: function ($scope, element, attrs) {
            $scope.readonly = attrs.readonly != null;
        },
    };
})

.directive('organizationCertification', function organizationCertification() {
    return {
        replace: true,
        scope: {
            certification: '=ngModel'
        },
        restrict: 'AE',
        require: ['^form','ngModel'],
        templateUrl: 'views/organization/templates/organizationCertification.tmpl.html',
        link: function ($scope, element, attrs) {
            $scope.readonly = attrs.readonly != null;
        },
    };
})

;
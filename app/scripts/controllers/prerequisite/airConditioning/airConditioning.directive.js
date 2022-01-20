angular.module('APP')

    .directive('airConditioningElementDetail', function ($rootScope) {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                element : "=",
            },
            controller: function($scope, Shape, PrerequisiteType) {
                $scope.Shape = Shape;
                $scope.PrerequisiteType = PrerequisiteType;
            },
            templateUrl: 'views/prerequisite/airConditioning/airConditioning.detail.tmpl.html'
        };
    })

    .directive('airConditioningEquipments', function () {
        return {
            restrict: "AE",
            replace: true,
            scope : {
                elements : "="
            },
            controller: 'AirConditioningEquipmentsCtrl',
            templateUrl: 'views/prerequisite/airConditioning/airConditioning.equipments.tmpl.html'
        };
    })
;





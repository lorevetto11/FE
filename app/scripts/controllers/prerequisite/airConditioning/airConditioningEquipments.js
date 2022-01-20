'use strict';

angular.module('APP')
    .controller('AirConditioningEquipmentsCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
                                                           PrerequisiteType, APIService) {

        $scope.Prerequisite = PrerequisiteType;
        //$scope.items = null;


        function init(){
            $scope.items = $scope.elements.filter(PrerequisiteType.isAirConditioning);
        }

        init();
});

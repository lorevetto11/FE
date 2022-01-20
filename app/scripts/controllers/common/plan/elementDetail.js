angular.module('APP')
    .controller('ElementDetailCtrl', function($rootScope, $scope, $translate, $state, $uibModal, $timeout, $window, $log, amMoment, notify,
                                              Layout, APIService, Prerequisite, Shape, ResourceService, UtilsService, ENV) {
        $scope.Prerequisite = Prerequisite;
        $scope.Shape = Shape;

        $scope.save = function() {
            if($scope.element) {
                $scope.onSave({item : $scope.element});
            }
        };
        
        $scope.toBackground = function(){
            if($scope.elements) {
                console.log($scope.elements)
                var values =  $scope.elements
                    .filter(function(elem) {return elem.shape.order != null && elem.id != $scope.element.id;})
                    .map(function(elem){ return elem.shape.order; });
                $scope.element.shape.order = (-1) + Math.min.apply(null,values);
            }
        };

        $scope.toForeground = function(){
            if($scope.elements) {
                var values =  $scope.elements
                    .filter(function(elem) {return elem.shape.order != null && elem.id != $scope.element.id;})
                    .map(function(elem){ return elem.shape.order; });
                $scope.element.shape.order = 1 + Math.min.apply(null,values);
            }
        };

    });
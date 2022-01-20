'use strict';

angular.module('APP')
	.controller('FlowsCtrl', function ($rootScope, $scope, $state, $translate, $q, $uibModal, $log,
										DiagramShape, Entity, Command) {


		$scope.items = null;
		$scope.command = null;

		$scope.shapeTypes = Entity.TYPES;
		$scope.shapeTypes.ARROW = DiagramShape.TYPES.ARROW;

		$scope.MODE = {
			SHOW_CHART: 'show_chart',
			SHOW_DIAGRAMS: 'show_diagrams'
		};

		$scope.mode = $scope.MODE.SHOW_CHART;

		$scope.showDiagrams = function() {
			if($scope.mode == $scope.MODE.SHOW_DIAGRAMS) {
				$scope.mode = $scope.MODE.SHOW_CHART;
			} else {
				$scope.mode = $scope.MODE.SHOW_DIAGRAMS;
				$scope.command.type = null;
			}
		};

		$scope.add = function (type) {

			$scope.command.type = type;

			$rootScope.$broadcast('changedShapeType', $scope.command.type);

		};

		$rootScope.$on('changeShapeType', function(event, args){


			$scope.command.type = args ? args.constructor.name : null;
			setTimeout(function(){
				$scope.$apply();
			}, 1);
		});


		function init() {

			$scope.command = {
				type: null
			};
			$rootScope.$broadcast('changeShapeType', null);

		}

		init();

	});

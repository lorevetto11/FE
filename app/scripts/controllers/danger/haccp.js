	'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
	.controller('HaccpCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $window, $filter,
	                                   Danger, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify) {

		$scope.items = null;
		$scope.riskMaps = null;
		$scope.shapes = null;
		$scope.types = [Danger.TYPE.BIOLOGICAL, Danger.TYPE.CHEMICAL, Danger.TYPE.PHYSICAL, Danger.TYPE.ALLERGENS];

		$scope.panelClass = {};
		$scope.panelClass[Danger.TYPE.BIOLOGICAL] = 'panel-info';
		$scope.panelClass[Danger.TYPE.CHEMICAL] = 'panel-warning';
		$scope.panelClass[Danger.TYPE.PHYSICAL] = 'panel-success';
		$scope.panelClass[Danger.TYPE.ALLERGENS] = 'panel-default';

		$scope.riskMap = [
			Danger.RISK.LOW,
			Danger.RISK.LOW,
			Danger.RISK.MEDIUM,
			Danger.RISK.MEDIUM,
			Danger.RISK.LOW,
			Danger.RISK.MEDIUM,
			Danger.RISK.MEDIUM,
			Danger.RISK.HIGH,
			Danger.RISK.MEDIUM,
			Danger.RISK.MEDIUM,
			Danger.RISK.HIGH,
			Danger.RISK.HIGH,
			Danger.RISK.MEDIUM,
			Danger.RISK.HIGH,
			Danger.RISK.HIGH,
			Danger.RISK.HIGH
		];

		$scope.highRisk = [7,10,11,13,14,15];
		$scope.riskMapColor = {};
		$scope.riskMapColor[Danger.RISK.LOW] = 'success';
		$scope.riskMapColor[Danger.RISK.MEDIUM] = 'info';
		$scope.riskMapColor[Danger.RISK.HIGH] = 'warning';
		$scope.riskMapColor[Danger.RISK.VERY_HIGH] = 'danger';

		$scope.loading = null;
		$scope.diagramsLoaded = null;
		$scope.loadingDiagrams = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		var changedSelectedOrganization = ResourceService.getSelectedOrganization();
		if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
			$scope.selectedOrganization = changedSelectedOrganization;
			init();
		}

		$scope.view = function (item) {
			$scope.selectedItem = angular.copy(item);
			loadDiagrams(item);
		};

		$scope.cancel = function () {
			$scope.selectedItem = null
		};

		$scope.riskDangerFilter = function (item) {
			return item && $scope.riskMap[item.risk] == Danger.RISK.HIGH;
		};

		$scope.riskWarningFilter = function (item) {
			return item && $scope.riskMap[item.risk] == Danger.RISK.MEDIUM;
		};


		$scope.getDiagramsByDanger = function(){
			var danger = $scope.selectedItem;
			$log.info('getDiagramsByDanger:', danger);
			if(danger) {
				var diagrams = $scope.shapes.filter(function(shape){
					return shape.riskMaps.find(function(riskMap){
						return riskMap.danger.id == danger.id && highRisk(riskMap);
					});
				}).map(function(shape) {
					return shape.diagram;
				});


				$log.info('diagrams:', diagrams);

				return $filter('unique')(diagrams, 'id');
			}
		};


		$scope.diagramFilter = function (diagram) {
			return diagram && dangerInDiagram($scope.selectedItem, diagram);
		};
		
		$scope.showDiagram = function (href, diagram) {
			ResourceService.setSelectedDiagram(diagram);

			$window.location.href = href;
		};

		$scope.getEntitiesInDiagram = function(diagram){

			var danger = $scope.selectedItem;

			if(danger) {
				var elements = $scope.shapes.filter(function(shape){
					return shape.diagram.id == diagram.id && shape.riskMaps.find(function(riskMap){
						return riskMap.danger.id == danger.id && highRisk(riskMap);
					});
				}).map(function(shape) {
					return shape.element;
				});

				$log.info('elements:', elements);

				return elements;
			}

			return null;


			var riskMaps = $scope.riskMaps.filter(function (riskMap) {
				return danger.id === riskMap.danger.id;
			});
			var diagramShapes = $scope.shapes.filter(function (shape) {
				return shape.diagram.id === diagram.id
					&& shape.element.danger.id === danger.id;
			});

			var result = [];
			if (riskMaps && diagramShapes) {
				diagramShapes.forEach(function (shape) {
					var riskMap = riskMaps.find(function (riskMap) {
						return shape.element.id === riskMap.element.id
							&& shape.element.danger.id === riskMap.danger.id;
					});
					if ( riskMap && highRisk(riskMap) ) {
						result.push(riskMap.element);
					}
				});
			}
			return result;
		};

		function loadDiagrams(danger) {

			if ( $scope.diagramsLoaded !== true ) {

				$scope.loadingDiagrams = true;

				APIService.getDiagramsByOrganizationId($scope.selectedOrganization.id).then(
					function success(data){

						$scope.diagrams = data;

						var diagramIds = $scope.diagrams.map(function (diagram) {
							return diagram.id;
						});

						APIService.recursiveCall(diagramIds, APIService.getDiagramShapesByDiagramId).then(
							function success(data){


								var shapes = data.filter(function(shape){
									return shape.element != null && shape.element.type == 'PHASE' &&
											shape.element.typeCCP == 'CCP'
								});

								shapes = shapes.map(function(shape){
									shape.riskMaps = $scope.riskMaps.filter(function(riskmap){
										return riskmap.element.id == shape.element.id
									});

									return shape;
								});

								shapes = shapes.filter(function(shape){
									return shape.riskMaps.length > 0;
								});

								$scope.shapes = shapes;

								/*

								$scope.shapes = $scope.shapes.map(function (shape) {
									if ( shape.element != null ) {
										var riskMapRelated = $scope.riskMaps.find(function (riskMap) {
											return riskMap.element.id === shape.element.id;
										});
										if ( riskMapRelated != null ) {
											shape.element.danger = riskMapRelated.danger;
										}
									}
									return shape;
								});
								$scope.shapes = $scope.shapes.filter(function (shape) {
									return shape.element && shape.element.danger;
								});
								*/

								$scope.diagramsLoaded = true;
								$scope.loadingDiagrams = false;

							});

					});

			}

		}

		function dangerInDiagram(danger, diagram) {


			var riskMaps = $scope.riskMaps.filter(function (riskMap) {
				return danger.id === riskMap.danger.id;
			});
			var diagramShapes = $scope.shapes.filter(function (shape) {
				return shape.diagram.id === diagram.id
					&& shape.element.danger.id === danger.id;
			});

			var result = false;
			if (riskMaps && diagramShapes) {
				diagramShapes.forEach(function (shape) {
					var riskMap = riskMaps.find(function (riskMap) {
						return shape.element.id === riskMap.element.id
							&& shape.element.danger.id === riskMap.danger.id;
					});
					if ( riskMap && highRisk(riskMap) ) {
						result = true;
					}
				});
			}

			return result;

		}

		function highRisk(riskMap) {
			return $scope.highRisk.find(function(risk){
				return risk === riskMap.value;
			}) != null;
		}

		function dangerDuplicate(danger, array) {
			var result = false;
			array.forEach(function (d) {
				if ( danger.id === d.id ) {
					result = true;
				}
			});
			return result;
		}

		function init() {

			if (!$scope.selectedOrganization) {
				return;
			}

			$scope.loading = true;

			APIService.getRiskMapsByOrganizationId($scope.selectedOrganization.id).then(
				function success(data) {

					$scope.items = [];
					var filteredDangers = data.filter(function (riskMap) {
						return highRisk(riskMap);
					});

/*
					filteredDangers.forEach(function (riskMap) {
						if (!dangerDuplicate(riskMap.danger, $scope.items)) {
							$scope.items.push(riskMap.danger);
						}
					}, this);
*/

					$scope.items = $filter('unique')(
						filteredDangers.map(function(d) { return d.danger}), 'id');


					$scope.entities = filteredDangers.map(function (riskMap) {
						return riskMap.element;
					});

					$scope.riskMaps = data;

					$scope.loading = false;

				})

		}

		init();

	});

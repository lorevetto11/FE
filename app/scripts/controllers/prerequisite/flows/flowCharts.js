
// VARIABILI GLOBALI CONDIVISE CON LA DIRETTIVA FLOW_CANVAS CHE SI OCCUPA DI DISEGNARLI
var _shapeType = undefined;

var _shapes = [];
var _anchorPoints = [];
var _entities = [];

//var _shapesDrawn = [];
var _selectedShape = undefined;
var _anchorPointsHighlight = undefined;
var _arrowDrawn = undefined;
var _movingShape = undefined;

'use strict';
angular.module('APP')
	.controller('FlowsChartCtrl', function ($rootScope, $scope, $state, $translate, $q, $uibModal, $log, notify, $timeout,
											DiagramShape, Entity, Arrow,
	                                        APIService, ResourceService) {
		_shapeType = null;
		_anchorPointsHighlight = null;

		$scope.diagrams = null;
		$scope.selectedDiagram = null;

		$scope.selectedShape = null;
		$scope.shapes = null;
		$scope.entities = null;

		$scope.loading = null;
		$scope.loadingShapesAndEntities = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		$scope.selectDiagram = function(diagram) {

			var preselectedDiagram = ResourceService.getSelectedDiagram();

			if ( preselectedDiagram != null ) {
				$scope.selectedDiagram = preselectedDiagram;
			} else {
				$scope.selectedDiagram = diagram;
			}
			
			$scope.loadingShapesAndEntities = true;
			loadShapes($scope.selectedDiagram.id);

			ResourceService.setSelectedDiagram(null);

		};


		// Selecting a shape
		$rootScope.$on('selectedShape', function(events, args){
			
			$scope.selectedShape = null;
			
			$scope.selectedShape = args;
				$scope.$apply();

		});

		$scope.zoomIn = function(){

			if (_scalingFactor < 4) {
				_scalingFactor = _scalingFactor * 2;
				_context.scale(2,2);
				_context.translate(-(DEFAULT_CANVAS_WIDTH/2)/2, -(DEFAULT_CANVAS_HEIGHT/2)/2);

				_translatePoint = {
					x: _translatePoint.x - (DEFAULT_CANVAS_WIDTH / _scalingFactor) / 2,
					y: _translatePoint.y - (DEFAULT_CANVAS_HEIGHT / _scalingFactor) / 2
				};

				$rootScope.$broadcast("scalingFactorChanged");
			}

		};

		$scope.zoomOut = function(){

			if (_scalingFactor > 2) {
				_translatePoint = {
					x: _translatePoint.x + (DEFAULT_CANVAS_WIDTH / _scalingFactor) / 2,
					y: _translatePoint.y + (DEFAULT_CANVAS_HEIGHT / _scalingFactor) / 2
				};
				_scalingFactor = _scalingFactor / 2;
				_context.scale(0.5,0.5);

				_context.translate((DEFAULT_CANVAS_WIDTH/2), (DEFAULT_CANVAS_HEIGHT/2));

				$rootScope.$broadcast("scalingFactorChanged");
			} else {
				_context.setTransform(1, 0, 0, 1, 0, 0);
				_scalingFactor = _scalingFactor / 2;
				_translatePoint = {
					x: 0,
					y: 0
				};
				$rootScope.$broadcast("scalingFactorChanged");
			}


		};

		jQuery(document).ready(function() {

			jQuery("#wrapper").mouseover(function(){

				if (_movingCanvas) {
					_movingCanvas = null;
				}

			});

		});


		// Creating a shape
		$rootScope.$on('newShape', function(events, args){

			//$scope.loadingShapesAndEntities = true;
			$scope.createShape(args);

		});

		$rootScope.$on("saveShape", function(events, args){
			$scope.onSave(args);
			console.log(args)
		});

		$scope.onSave = function(item){
			 console.log(item);
			var shape = item.item;

			$scope.loadingShapesAndEntities = true;
			var shapeToSave = shape.toJSON();

			APIService.updateDiagramShape(shapeToSave).then(
				function success(shape){

					//$scope.shapes = shapes;
					//$scope.loadingShapesAndEntities = false;

					$scope.selectedShape = null;

					loadShapes($scope.selectedDiagram.id);

					/*
					var entities = _entities.map(function(entity){
						entity.shape = {id: entity.shape.id};
						return entity;
					});

					APIService.recursiveCall(entities, APIService.updateEntity).then(
						function success(){

							loadShapes($scope.selectedDiagram.id);

						}, savingError);
*/
				}, savingError);
			
		};

		$scope.createShape = function(item) {


				//$scope.loadingShapesAndEntities = true;

			if(item instanceof Arrow) {
				$log.info("Relation", item.toJSON());
				APIService.createRelation(item.toJSON()).then(
					function success() {
						loadShapes($scope.selectedDiagram.id);
					}, savingError);
			} else {

				$log.info("Shape: %O", item);

				item.diagram = $scope.selectedDiagram;

				APIService.createDiagramShape(item.toJSON()).then(
					function success(shape){

						if(shape) {
							$scope.shapes.push(shape);
						}

						_shapeType = undefined;

						loadShapes($scope.selectedDiagram.id);
						notify.logSuccess("OK", "Elemento aggiunto");

					}, savingError);
			}

			/*
				if (item.centerPoint != null){  // is a shape

					item.centerX = item.centerPoint.x;
					item.centerY = item.centerPoint.y;
					item.diagram = $scope.selectedDiagram;
					
					
					delete item.centerPoint;
					delete item.id;
					delete item.lineWidth;
					delete item.strokeColor;
					delete item.strokeColorSelected;
					delete item.selected;

					//var anchorPoints = item.anchorPoints;

					$log.info("Shape: %O", item);
					APIService.createDiagramShape(item.toJSON()).then(
						function success(shape){

							if(shape) {
								$scope.shapes.push(shape);
							}

							_shapeType = undefined;

							loadShapes($scope.selectedDiagram.id);
							notify.logSuccess("OK", "Elemento aggiunto");

						}, savingError);

				} else {  // is a relation
*/
			/*
					delete item.zOrder;
					delete item.toPoint;
					delete item.fromPoint;
					delete item.lineWidth;
					delete item.selected;
					delete item.centerPoint;
					//item.endAnchorPoint = {id: item.endAnchorPoint.id};
					//item.startAnchorPoint = {id: item.startAnchorPoint.id};
					item.name = "";
					item.description = "";



				}
			 */
		};

		$scope.onDelete = function(item) {

			$log.info("onDelete:", item.item);

			var toBeDeleted = item.item;

			$scope.loadingShapesAndEntities = true;
			//if(item.centerPoint != null){

			if(toBeDeleted instanceof Arrow) {



				APIService.deleteRelation(toBeDeleted.id).then(
					function success(){

						$scope.selectedShape = null;
						loadShapes($scope.selectedDiagram.id);

					}, savingError);
			} else {

				APIService.deleteDiagramShape(toBeDeleted.id).then(
					function success(){

						$scope.selectedShape = null;
						loadShapes($scope.selectedDiagram.id);
					}
					, savingError);

				/*

				var anchorPointIds = _anchorPoints.filter(function(anchorPoint){
					return anchorPoint.shape.id == item.id;
				}).map(function(anchorPoint){
					return anchorPoint.id;
				});

				var entity = _entities.find(function(entity){
					return entity.shape.id == item.id;
				});

				var relationIds = _shapes.filter(function(relation){
					return relation.startAnchorPoint && relation.endAnchorPoint;
				}).filter(function(relation){
					return anchorPointIds.includes(relation.startAnchorPoint.id) || anchorPointIds.includes(relation.endAnchorPoint.id);
				}).map(function(relation){
					return relation.id;
				});

				APIService.deleteDiagramShape(item.id).then(
					function success(){

						APIService.recursiveCall(anchorPointIds, APIService.deleteAnchorPoint).then(
							function success(){

								APIService.deleteEntity(entity.id).then(
									function success(){

										APIService.recursiveCall(relationIds, APIService.deleteRelation).then(
											function success(){

												$scope.selectedShape = null;
												loadShapes($scope.selectedDiagram.id);

											}, savingError);

									}, savingError);

							}, savingError);

					}, savingError);
*/
			}

		};

		$scope.downloadChart = function(){

			document.getElementById("downloader").download = $scope.selectedDiagram.name + ".png";

			document.getElementById("downloader").href = document.getElementById("drawingField").toDataURL("image/png");

		};
		
		function loadShapes(diagramId) {
			if (diagramId != null) {

				//$scope.loadingShapesAndEntities = true;
				APIService.getDiagramShapesByDiagramId(diagramId).then(
					function success(data) {

						$scope.shapes = data.filter(function (shape) {
							return shape != undefined;
						});

						$log.info("Shapes: %O", $scope.shapes);

						$scope.loadingShapesAndEntities = false;


						var anchorPoints = [];

						$scope.shapes.forEach(function(shape){
							anchorPoints = anchorPoints.concat(shape.anchorPoints);
						});

						APIService.getRelationsByDiagramId(diagramId).then(
							function success(data) {

								// sostituisci con le reference agli anchorPoint solidali alle shapes
								(data || []).forEach(function(relation){
									relation.startAnchorPoint = anchorPoints.find(function(anchorPoint){
										return anchorPoint.id == relation.startAnchorPoint.id;
									})

									relation.endAnchorPoint = anchorPoints.find(function(anchorPoint){
										return anchorPoint.id == relation.endAnchorPoint.id;
									})
								});

								$log.info("Relations: %O", data);

								// relation is just a shape
								$scope.shapes = $scope.shapes.concat(data);

								/*
								data.forEach(function (relation) {
									_shapes.push(relation);
								});

								_anchorPoints = [];
								_entities = [];

								_shapes.forEach(function (shape) {
									(shape.anchorPoints || []).forEach(function (ap) {
										ap.shape = shape;
										_anchorPoints.push(ap)
									})
									if (shape.element) {
										shape.element.shape = shape;
										_entities.push(shape.element);
									}
								});

								$scope.loadingShapesAndEntities = false;
							});
					})
			}
		};
		*/
						
			/*
						$log.info("Shapes: %O", _shapes);

						var shapeIds = _shapes.map(function(shape){
							return shape.id;
						});
						APIService.getAnchorPointsByDiagramId(diagramId).then(
							function success(data){

								$log.info("AnchorPoints: %O", data);
								_anchorPoints = data;

								APIService.getRelationsByDiagramId(diagramId).then(
									function success(data){

										$log.info("Relations: %O", data);
										data.forEach(function(relation){
											_shapes.push(relation);  // relation is just a shape
										});
										APIService.getEntitiesByDiagramId(diagramId).then(
											function success(data){

												_entities = data;
												$log.info("Entities: %O", _entities);

												$scope.loadingShapesAndEntities = false;

											}, savingError);
									}, savingError);*/
							}, savingError);
					}, savingError);
			}
		}

		function savingError() {

			$scope.loading = false;
			$scope.errorMessage = $translate.instant('notify.savingDataError');

		}
		
		function init() {

			if (!$scope.selectedOrganization) {
				return;
			}

			$scope.loading = true;

			APIService.getDiagramsByOrganizationId($scope.selectedOrganization.id).then(
				function success(data){
					
					$scope.diagrams = data.sort(function (a, b) {
						return a.name > b.name;
					});
					$log.info("Diagrams: %O", $scope.diagrams);

					$scope.loading = false;

				}, savingError);

		}

		init();

	});

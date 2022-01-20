// GLOBAL VARIABLES (???)
var DEFAULT_CANVAS_WIDTH = null;
var DEFAULT_CANVAS_HEIGHT = null;

var _canvas;
var _context;
var _scalingFactor;
var _translatePoint;
var _movingCanvas;
var _previousMousePosition;

'use strict';
angular.module('APP')
	.controller('FlowsCanvasCtrl', function ($rootScope, $scope, $state, $translate, $q, $uibModal, $log, notify,
	                                         DiagramShape, Rectangle, Ellipse, Rhombus, Parallelogram, Arrow, AnchorPoint, Entity,
	                                         APIService, ResourceService) {
		
		$scope.loading = null;
		$scope.selectedOrganization = ResourceService.getSelectedOrganization();
		
		_canvas = document.getElementById("drawingField");
		_context = _canvas.getContext('2d');
		_scalingFactor = 1;
		_translatePoint = {
			x: 0,
			y: 0
		};

		// local variable
		var _shapes = [];
		var _shapesDrawn = null;

		$rootScope.$on("scalingFactorChanged", function () {

			initDrawingField();

		});

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		// Selecting a shape
		$rootScope.$on('changedShapeType', function (events, args) {
			
			var type = args;

			changeShapeType(type);

			if (type === DiagramShape.TYPES.ARROW) {
				_anchorPointsHighlight = true;
			} else {
				_anchorPointsHighlight = false;
			}

			initDrawingField();

		});

		$rootScope.$on('dataChange', function (events, args) {

			initDrawingField();

		});

		$rootScope.$on("downloadCanvas", function (events, args) {
			
			document.getElementById("downloader").href = document.getElementById("canvas").toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
			
		});


		// Clicking on the drawing field
		$scope.onMouseDown = function (event) {

			event.preventDefault();

			var mousePosition = getMousePos(event);
			var newShape;

			if (_shapeType) { // Trying to create a shape

				if (_shapeType != Arrow) {

					newShape = new _shapeType(mousePosition);
					newShape.selected = true;
					_shapes.push(newShape);

					//_selectedShape = newShape;

					$rootScope.$broadcast("newShape", newShape);
					// _movingShape = _selectedShape;
					//
					// initDrawingField();
					//
					// changeShapeType(undefined);

				} else {

					var anchorPoint;

					if (_arrowDrawn) { // freccia già inizializzata sullo startPoint, in attesa di chiusura sull'endPoint

						anchorPoint = findAnchorPoint(mousePosition);

						if (anchorPoint) {

							newShape = new _shapeType(_arrowDrawn.startAnchorPoint, anchorPoint);
							newShape.selected = true;

							_shapes.push(newShape);

							//electedShape = newShape;
							_arrowDrawn = undefined;
							_anchorPointsHighlight = undefined;
							changeShapeType();

							$rootScope.$broadcast("newShape", newShape);


							// _shapes.push(newShape);
							//
							// _arrowDrawn = undefined;
							// _anchorPointsHighlight = undefined;
							// _selectedShape = newShape;
							//
							// initDrawingField();
							//
							// changeShapeType();

						}

					} else {
						anchorPoint = findAnchorPoint(mousePosition);
						
						
						if (anchorPoint) {

							_arrowDrawn = new _shapeType(anchorPoint, mousePosition);

						}

					}

				}

			} else {

				var rect = _canvas.getBoundingClientRect();

				var x = (event.clientX - rect.left) / DEFAULT_CANVAS_WIDTH,
					y = (event.clientY - rect.top) / DEFAULT_CANVAS_WIDTH;

				mousePosition = {
					x: Math.round((x) * 1000) / 1000,
					y: Math.round((y) * 1000) / 1000
				};

				var selectedShape = findShapeSelected(mousePosition);

				if (selectedShape != null) { // Trying to select a shape

					_shapes.forEach(function (shape) {
						shape.selected = false;
					});

					if (selectedShape != null) {
						selectedShape.selected = true;
					}

					_movingShape = selectedShape;
					initDrawingField(mousePosition);

					if (selectedShape) { // Show details relative to selected shape
						$rootScope.$broadcast("selectedShape", selectedShape);
					} else { // Hide details
						$rootScope.$broadcast("selectedShape", null);
					}

				} else { // Trying to move the canvas

					_shapes.forEach(function (shape) {
						shape.selected = false;
					});

					_movingCanvas = true;

					initDrawingField();

					if (selectedShape) { // Show details relative to selected shape
						$rootScope.$broadcast("selectedShape", selectedShape);
					} else { // Hide details
						$rootScope.$broadcast("selectedShape", null);
					}

				}
				

			}


			// if (type != undefined) {
			//
			//   if (type == 'rect') {
			//     shapes.push(new Rect(mousePosition));
			//   } else if (type == 'circle'){
			//     shapes.push(new Circle(mousePosition));
			//   } else if (type == 'triangle'){
			//     shapes.push(new Triangle(mousePosition));
			//   } else if (type == 'arrow'){
			//
			//   }
			//
			//   reInitCanvas(mousePosition, anchorPointsHighlight);
			//
			//   type = undefined;
			//
			// } else {
			//
			//   reInitCanvas(mousePosition);
			//
			// }

		};

		$scope.onMouseMove = function (event) {

			event.preventDefault();

			var mousePosition = getMousePos(event);

			if (_arrowDrawn) {

				_arrowDrawn.endAnchorPoint = mousePosition;

				initDrawingField();

			}

			// if(((mousePosition.x * 1000) % (0.010 * 1000) / 1000) == 0 ||
			// 	((mousePosition.y * 1000) % (0.010 * 1000) / 1000) == 0){

			if (_movingShape) { //&& _movingShape.centerPoint != null) {

				_movingShape.centerX = mousePosition.x;
				_movingShape.centerY = mousePosition.y;

				initDrawingField();

			}

			// }

			if (_movingCanvas) {

				var rect = _canvas.getBoundingClientRect();

				var x = (event.clientX - rect.left) / DEFAULT_CANVAS_WIDTH,
					y = (event.clientY - rect.top) / DEFAULT_CANVAS_WIDTH;

				mousePosition = {
					x: Math.round((x) * 1000) / 1000,
					y: Math.round((y) * 1000) / 1000
				};

				if (_scalingFactor != 1) {

					if (_previousMousePosition) {

						var translation = {
							x: mousePosition.x * DEFAULT_CANVAS_WIDTH - _previousMousePosition.x * DEFAULT_CANVAS_WIDTH,
							y: mousePosition.y * DEFAULT_CANVAS_HEIGHT - _previousMousePosition.y * DEFAULT_CANVAS_HEIGHT
						};

						if ((_translatePoint.x + translation.x < 0) &&
							(_translatePoint.y + translation.y < 0) &&
							(-(_translatePoint.x + translation.x) < DEFAULT_CANVAS_WIDTH / 2) &&
							(-(_translatePoint.y + translation.y) < DEFAULT_CANVAS_HEIGHT / 2)) {

							console.log(-(_translatePoint.x + translation.x) < DEFAULT_CANVAS_WIDTH / 2);

							_translatePoint = {
								x: _translatePoint.x + translation.x,
								y: _translatePoint.y + translation.y
							};
							_context.translate(translation.x, translation.y);
						} else if ((_translatePoint.x + translation.x < 0) && (-(_translatePoint.x + translation.x) < DEFAULT_CANVAS_WIDTH / 2)) {
							_translatePoint.x = _translatePoint.x + translation.x;

							_context.translate(translation.x, 0);
						} else if ((_translatePoint.y + translation.y < 0) && (-(_translatePoint.y + translation.y) < DEFAULT_CANVAS_HEIGHT / 2)) {
							_translatePoint.y = _translatePoint.y + translation.y;

							_context.translate(0, translation.y);
						}

						_previousMousePosition = mousePosition;
						initDrawingField();

					} else {

						_previousMousePosition = mousePosition;

					}

				}

			}
		};

		$scope.onMouseUp = function (event) {

			event.preventDefault();

			if (_movingShape && !(_movingShape instanceof Arrow)) {

				var originalShape = _shapes.find(function (shape) {
					return _movingShape.id == shape.id;
				});

				var toSave = _movingShape.toJSON();

				APIService.updateDiagramShape(toSave).then(
					function (shape) {

						_selectedShape = shape;

					});

			}

			_movingShape = null;
			_movingCanvas = null;
			_previousMousePosition = null;

		};


		// On windows resize
		window.addEventListener('resize', function () {

			initCanvas();

		});

		// Function to initialize the canvas properties
		function initCanvas() {

			$(_canvas).css({ // The canvas is square, width and height are the same
				height: $(_canvas).width() + "px"
			});

			DEFAULT_CANVAS_WIDTH = $(_canvas).width();
			DEFAULT_CANVAS_HEIGHT = $(_canvas).height();

			_canvas.width = DEFAULT_CANVAS_WIDTH;
			_canvas.height = DEFAULT_CANVAS_HEIGHT;

			initDrawingField();

		}

		// Function to initialize the drawing field
		function initDrawingField(mousePosition) {

			// Clearing the field
			_context.fillStyle = "#ffffff";
			_context.fillRect(0, 0, _canvas.width, _canvas.height);

			drawAllShapes(mousePosition);

		}

		// Function to draw all shapes on the canvas
		function drawAllShapes(mousePosition, arrowDrawn) {

			_shapesDrawn = (_shapes || []);
			;
			/*
			 if (_anchorPointsHighlight) {
			 _shapesDrawn = (_shapes || []).concat(_anchorPoints);
			 } else {

			 _shapesDrawn = (_shapes || []);

			 }
			 */
			if (_arrowDrawn) {

				_shapesDrawn.push(_arrowDrawn);

			}

			// Order shapes based on zOrder value
			// We do this so the shapes are drawn one over each other in the order we want them to being drawn
			_shapesDrawn = _shapesDrawn.sort(function (shape, anotherShape) {
				return shape.zOrder - anotherShape.zOrder;
			});

			_shapesDrawn.forEach(function (shape) {
				shape.draw(_context, mousePosition);
			});

			// if (anchorPointsHighlight) {
			//
			//     _shapes.forEach(function(shape){
			//
			//         shape.anchorPoints.forEach(function(anchorPoint){
			//
			//             anchorPoint.draw(_context);
			//
			//         });
			//
			//     });
			//
			// }

		}

		// Function to get the mouse position in the canvas
		function getMousePos(event) {

			var rect = _canvas.getBoundingClientRect();

			var x = (event.clientX - rect.left) / DEFAULT_CANVAS_WIDTH,
				y = (event.clientY - rect.top) / DEFAULT_CANVAS_WIDTH,
				translateX = -(_translatePoint.x / DEFAULT_CANVAS_WIDTH),
				translateY = -(_translatePoint.y / DEFAULT_CANVAS_HEIGHT);

			return {
				x: Math.round(((x / _scalingFactor) + translateX) * 1000) / 1000,
				y: Math.round(((y / _scalingFactor) + translateY) * 1000) / 1000
			};

		}

		// Function to change the shape type that will be draw
		function changeShapeType(type) {

			if (type === Entity.TYPES.PHASE) {

				_shapeType = Rectangle;

			} else if (type === Entity.TYPES.BEGIN_END) {

				_shapeType = Ellipse;

			} else if (type === Entity.TYPES.DECISION) {

				_shapeType = Rhombus;

			} else if (type === Entity.TYPES.MATERIAL) {

				_shapeType = Parallelogram;

			} else if (type === DiagramShape.TYPES.ARROW) {

				_shapeType = Arrow;

			} else if (type === undefined) {

				_shapeType = null;

			}

			$rootScope.$broadcast('changeShapeType', _shapeType);

		}

		// Function find an anchor point given a mouse position,
		// it uses the isPointInPath() function of ContextInterface
		// instead of manually calculating the points because it is
		// faster since there won't be huge data in the process
		function findAnchorPoint(mousePosition) {

			var anchorPoint;

			_context.save();

			_shapes.forEach(function (shape) {
				if (shape.anchorPoints) {
					shape.anchorPoints.forEach(function (point) {
						point.createPath(_context, shape);
						_context.stroke();
						_context.fill();

						if (_context.isPointInPath(mousePosition.x * DEFAULT_CANVAS_WIDTH, mousePosition.y * DEFAULT_CANVAS_HEIGHT)) {
							anchorPoint = point;
						}
					});
				}
			})

			/*
			 _anchorPoints.forEach(function(shape){
			 shape.createPath(_context);

			 _context.stroke();
			 _context.fill();
			 if(_context.isPointInPath(mousePosition.x * DEFAULT_CANVAS_WIDTH, mousePosition.y * DEFAULT_CANVAS_HEIGHT)){
			 anchorPoint = shape;
			 }

			 });
			 */
//			_context.restore();

			return anchorPoint;

		}

		// Function find a shape given a mouse position,
		// it uses the isPointInPath() function of ContextInterface
		// instead of manually calculating the points because it is
		// faster since there won't be huge data in the process
		function findShapeSelected(mousePosition) {

			var shapeSelected;

			_context.save();

			_shapes.sort(function (shape, anotherShape) {
				return shape.zOrder > anotherShape.zOrder;
			}).forEach(function (shape) {


				shape.createPath(_context);

				_context.stroke();
				_context.fill();

				if (_context.isPointInPath(mousePosition.x * DEFAULT_CANVAS_WIDTH, mousePosition.y * DEFAULT_CANVAS_HEIGHT) || _context.isPointInStroke(mousePosition.x * DEFAULT_CANVAS_WIDTH, mousePosition.y * DEFAULT_CANVAS_HEIGHT)) {
					shapeSelected = shape;
				}

			});

			_context.restore();

			return shapeSelected;

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
			$scope.loading = false;


			$scope.$watch('shapes', function (value) {

				if (value) {
					
					_shapes = value;

					initCanvas();
				}

			});

		}

		init();

		//initCanvas();


	});

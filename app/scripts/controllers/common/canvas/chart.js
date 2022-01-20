angular.module('APP')
	.controller('ChartCtrl', function ($rootScope, $scope, $log, $translate, $state, $interval, $uibModal,
	                                    $timeout, $window, amMoment, notify, Command,
	                                    PrerequisiteType, Layout, WaterSupply, Shape, Cleaning,
	                                    APIService, ResourceService, EEquipment, UtilsService, Frequency, ENV) {

		var DEFAULT_CANVAS_WIDTH = null;
		var DEFAULT_CANVAS_HEIGHT = null;

		var _canvas = document.getElementById("drawingField");
		var _context = _canvas.getContext('2d');

		// Function to initialize the canvas properties
		function initCanvas() {

			var rect = _canvas.getBoundingClientRect();

			DEFAULT_CANVAS_WIDTH = rect.width;
			DEFAULT_CANVAS_HEIGHT = rect.bottom - rect.top;

			_canvas.width = DEFAULT_CANVAS_WIDTH;
			_canvas.height = DEFAULT_CANVAS_HEIGHT;

			initDrawingField();

		}

		// Function to initialize the drawing field
		function initDrawingField(mousePosition) {

			// Clearing the field
			_context.clearRect(0, 0, _canvas.width, _canvas.height);

			drawAllShapes(mousePosition);

		}

		// Function to draw all shapes on the canvas
		function drawAllShapes(mousePosition) {

			if (_anchorPointsHighlight) {

				_shapesDrawn = _shapes.concat(_anchorPoints);

			} else {

				_shapesDrawn = _shapes;

			}

			if (_arrowDrawn) {

				_shapesDrawn.push(_arrowDrawn);

			}

			// Order shapes based on zOrder value
			// We do this so the shapes are drawn one over each other in the order we want them to being drawn
			_shapesDrawn.sort(function (shape, anotherShape) {
				return shape.zOrder - anotherShape.zOrder;
			});

			_shapesDrawn.forEach(function (shape) {

				shape.draw(_context, mousePosition);

			});

			_context.save();

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

			var x = (event.clientX - rect.left) / DEFAULT_CANVAS_WIDTH;
			var y = (event.clientY - rect.top) / DEFAULT_CANVAS_HEIGHT;

			return {
				x: Math.round(x * 1000) / 1000,
				y: Math.round(y * 1000) / 1000
			};

		}

		// Function to change the shape type that will be draw
		function changeShapeType(type) {

			if (type == "Rect") {

				_shapeType = Rect;

			} else if (type == "Circle") {

				_shapeType = Circle;

			} else if (type == "Triangle") {

				_shapeType = Triangle;

			} else if (type == "Arrow") {

				_shapeType = Arrow;

			} else if (type == undefined) {

				_shapeType = undefined;

			}

		}

		// Function to find an anchor point given a mouse position,
		// it uses the isPointInPath() function of ContextInterface
		// instead of manually calculating the points because it is
		// faster since there won't be huge data in the process
		function findAnchorPoint(mousePosition) {

			var anchorPoint;

			_context.save();

			_anchorPoints.forEach(function (shape) {
				shape.createPath(_context);

				if (_context.isPointInPath(mousePosition.x * DEFAULT_CANVAS_WIDTH, mousePosition.y * DEFAULT_CANVAS_HEIGHT)) {
					anchorPoint = shape;
				}

			});

			_context.restore();

			return anchorPoint;

		}

	});
angular.module('APP')
	.factory('Rectangle', function (DiagramShape, AnchorPoint, Diagram, $log, ResourceService) {
		
		// Rectangle constant
		var DEFAULT_RECTANGLE_WIDTH = 0.1;
		var DEFAULT_RECTANGLE_HEIGHT = 0.05;
		
		// Rectangle class constructor
		function Rectangle(centerPoint) {
			
			DiagramShape.call(this, centerPoint);

			if (centerPoint != null) {

				this.type = DiagramShape.TYPES.RECTANGLE;

				this.width = DEFAULT_RECTANGLE_WIDTH;
				this.height = DEFAULT_RECTANGLE_HEIGHT;

				this.init();

			}
			
		}

		// Parse method
		Rectangle.parse = function(obj) {

			if (obj != null) {

				var rectangle = new Rectangle();
				
				rectangle.diagram = Diagram.parse(obj.diagram);
				rectangle.width = obj.width;
				rectangle.height = obj.height;
				rectangle.type = obj.type;
				
				rectangle = DiagramShape.parse(rectangle, obj);
				return rectangle;

			} else {

				return null;

			}

		};
		
		// Inherit from the DiagramShape class
		Rectangle.prototype = Object.create(DiagramShape.prototype);
		Rectangle.prototype.constructor = Rectangle;

		// Rectangle class methods
		Rectangle.prototype.method = function method() {
			
			DiagramShape.prototype.method.call(this);
			
		};
		
		// Method to draw a path sequence of a rectangle on a canvas
		Rectangle.prototype.createPath = function createPath(context) {
			try {
			// Defining rectangle vertexes
			var topLeftVertex = {
				x: (this.centerX - (this.width / 2)) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerY - (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};
			var topRightVertex = {
				x: (this.centerX + (this.width / 2)) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerY - (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};
			var bottomRightVertex = {
				x: (this.centerX + (this.width / 2)) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerY + (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};
			var bottomLeftVertex = {
				x: (this.centerX - (this.width / 2)) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerY + (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};
			
			// Defining path sequence
			context.beginPath();
				context.moveTo(topLeftVertex.x, topLeftVertex.y);
				context.lineTo(topRightVertex.x, topRightVertex.y);
				context.lineTo(bottomRightVertex.x, bottomRightVertex.y);
				context.lineTo(bottomLeftVertex.x, bottomLeftVertex.y);
			context.closePath();
			}catch(err) {
				$log.error(err);
			}
		};
		
		// Initialize the entity associated with the DiagramShape
		Rectangle.prototype.initEntity = function initEntity() {
			
			_entities.push(new Entity(this));
			
		};
		
		// Initialize the anchorPoints of the rectangle DiagramShape
		Rectangle.prototype.initAnchorPoints = function initAnchorPoints() {
			
			var anchorPoints = [];
			
			anchorPoints.push(new AnchorPoint(this, {
				x: 0,
				y: -0.5
			}));
			anchorPoints.push(new AnchorPoint(this, {
				x: +0.5,
				y: 0
			}));
			anchorPoints.push(new AnchorPoint(this, {
				x: 0,
				y: +0.5
			}));
			anchorPoints.push(new AnchorPoint(this, {
				x: -0.5,
				y: 0
			}));
			
			this.anchorPoints = anchorPoints;
		};
		
		// init() method
		Rectangle.prototype.init = function init() {

			// this.initEntity();
			this.initAnchorPoints();

			this.initElement();
		};
		
		return Rectangle;
		
	});
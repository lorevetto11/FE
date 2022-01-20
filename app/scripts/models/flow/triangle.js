angular.module('APP')
	.factory('Triangle', function (DiagramShape, ResourceService) {
		
		// Triangle constant
		var DEFAULT_TRIANGLE_BASE = 0.1;
		var DEFAULT_TRIANGLE_HEIGHT = 0.1;
		
		// Triangle class constructor
		function Triangle(centerPoint) {
			
			Shape.call(this, centerPoint);
			
			this.type = "Triangle";
			
			this.base = DEFAULT_TRIANGLE_BASE;
			this.height = DEFAULT_TRIANGLE_HEIGHT;
			
			this.init();
			
		}
		
		// Inherit from the Shape class
		Triangle.prototype = Object.create(Shape.prototype);
		Triangle.prototype.constructor = Triangle;
		
		// Triangle class method
		Triangle.prototype.method = function method() {
			
			Shape.prototype.method.call(this);
			
		};
		
		// Method to draw a path sequence of a triangle on a canvas
		Triangle.prototype.createPath = function createPath(context) {
			
			// Defining triangle vertexes
			var topVertex = {
				x: (this.centerPoint.x) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerPoint.y - (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};
			var leftVertex = {
				x: (this.centerPoint.x - (this.height / 2)) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerPoint.y + (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};
			var rightVertex = {
				x: (this.centerPoint.x + (this.height / 2)) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerPoint.y + (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};
			
			// Defining path sequence
			context.beginPath();
			context.moveTo(topVertex.x, topVertex.y);
			context.lineTo(leftVertex.x, leftVertex.y);
			context.lineTo(rightVertex.x, rightVertex.y);
			context.closePath();
			
		};
		
		// Initialize the entity associated with the shape
		Triangle.prototype.initEntity = function initEntity() {
			
			_entities.push(new Entity(this));
			
		};
		
		// Initialize the anchorPoints of the triangle shape
		Triangle.prototype.initAnchorPoints = function initAnchorPoints() {
			
			var anchorPoints = [];
			
			anchorPoints.push(new AnchorPoint(this, {
				x: -0.5,
				y: 0
			}));
			anchorPoints.push(new AnchorPoint(this, {
				x: +0.5,
				y: 0
			}));
			anchorPoints.push(new AnchorPoint(this, {
				x: 0,
				y: +0.5
			}));
			
			_anchorPoints = _anchorPoints.concat(anchorPoints);
			
		};
		
		// init() method
		Triangle.prototype.init = function init() {
			
			this.initEntity();
			this.initAnchorPoints();
			
		};
		
		return Triangle;
		
	});
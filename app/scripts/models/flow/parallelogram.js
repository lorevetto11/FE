angular.module('APP')
	.factory('Parallelogram', function (DiagramShape, AnchorPoint, Diagram, ResourceService) {
		
		// Parallelogram constant
		var DEFAULT_PARALLELOGRAM_WIDTH = 0.1;
		var DEFAULT_PARALLELOGRAM_HEIGHT = 0.05;
		
		// Parallelogram class constructor
		function Parallelogram(centerPoint) {
			
			DiagramShape.call(this, centerPoint);
			
			if (centerPoint != null) {

				this.type = DiagramShape.TYPES.PARALLELOGRAM;

				this.width = DEFAULT_PARALLELOGRAM_WIDTH;
				this.height = DEFAULT_PARALLELOGRAM_HEIGHT;

				this.init();

			}
			
		}

		// Parse method
		Parallelogram.parse = function(obj) {

			if (obj != null) {

				var parallelogram = new Parallelogram();

				parallelogram.diagram = Diagram.parse(obj.diagram);
				parallelogram.width = obj.width;
				parallelogram.height = obj.height;
				parallelogram.type = obj.type;
				parallelogram = DiagramShape.parse(parallelogram, obj);

				return parallelogram;

			} else {

				return null;

			}

		};

		// Inherit from the Shape class
		Parallelogram.prototype = Object.create(DiagramShape.prototype);
		Parallelogram.prototype.constructor = Parallelogram;
		
		// Parallelogram class method
		Parallelogram.prototype.method = function method() {
			
			Shape.prototype.method.call(this);
			
		};
		
		// Method to draw a path sequence of a parallelogram on a canvas
		Parallelogram.prototype.createPath = function createPath(context) {

			// Defining parallelogram vertexes
			var topLeftVertex = {
				x: ((this.centerX - (this.width / 2)) + (this.width/6)) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerY - (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};
			var topRightVertex = {
				x: ((this.centerX + (this.width / 2)) + (this.width/6)) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerY - (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};
			var bottomRightVertex = {
				x: ((this.centerX + (this.width / 2)) - (this.width/6)) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerY + (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};
			var bottomLeftVertex = {
				x: ((this.centerX - (this.width / 2)) - (this.width/6)) * DEFAULT_CANVAS_WIDTH,
				y: (this.centerY + (this.height / 2)) * DEFAULT_CANVAS_HEIGHT
			};

			// Defining path sequence
			context.beginPath();
				context.moveTo(topLeftVertex.x, topLeftVertex.y);
				context.lineTo(topRightVertex.x, topRightVertex.y);
				context.lineTo(bottomRightVertex.x, bottomRightVertex.y);
				context.lineTo(bottomLeftVertex.x, bottomLeftVertex.y);
			context.closePath();
			
		};
		
		// Initialize the entity associated with the shape
		Parallelogram.prototype.initEntity = function initEntity() {
			
			_entities.push(new Entity(this));
			
		};
		
		// Initialize the anchorPoints of the parallelogram shape
		Parallelogram.prototype.initAnchorPoints = function initAnchorPoints() {
			
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
		Parallelogram.prototype.init = function init() {
			
			// this.initEntity();
			this.initAnchorPoints();

			this.initElement();
			
		};
		
		return Parallelogram;
		
	});
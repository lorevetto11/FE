angular.module('APP')
	.factory('Rhombus', function (DiagramShape, Diagram, AnchorPoint, ResourceService) {
		
		// Rhombus constant
		var DEFAULT_RHOMBUS_WIDTH = 0.1;
		var DEFAULT_RHOMBUS_HEIGHT = 0.05;
		
		// Rhombus class constructor
		function Rhombus(centerPoint) {
			
			DiagramShape.call(this, centerPoint);
			
			if (centerPoint != null) {

				this.type = DiagramShape.TYPES.RHOMBUS;

				this.width = DEFAULT_RHOMBUS_WIDTH;
				this.height = DEFAULT_RHOMBUS_HEIGHT;

				this.init();

			}
			
		}

		// Parse method
		Rhombus.parse = function(obj) {

			if (obj != null) {

				var rhombus = new Rhombus();

				rhombus.diagram = Diagram.parse(obj.diagram);
				rhombus.width = obj.width;
				rhombus.height = obj.height;
				rhombus.type = obj.type;

				rhombus = DiagramShape.parse(rhombus, obj);
				return rhombus;

			} else {

				return null;

			}

		};

		// Inherit from the Shape class
		Rhombus.prototype = Object.create(DiagramShape.prototype);
		Rhombus.prototype.constructor = Rhombus;
		
		// Rhombus class method
		Rhombus.prototype.method = function method() {
			
			DiagramShape.prototype.method.call(this);
			
		};
		
		// Method to draw a path sequence of a rhombus on a canvas
		Rhombus.prototype.createPath = function createPath(context) {
			
			var w = this.width * DEFAULT_CANVAS_WIDTH,
				h = this.height * DEFAULT_CANVAS_HEIGHT,
				x = this.centerX * DEFAULT_CANVAS_WIDTH,
				y = this.centerY * DEFAULT_CANVAS_HEIGHT - (h/2);

			
			// Defining path sequence
			context.beginPath();
				context.moveTo(x, y);
				context.lineTo(x - w / 2, y + h / 2);
				context.lineTo(x, y + h);
				context.lineTo(x + w / 2, y + h / 2);
			context.closePath();
			
		};
		
		// Initialize the entity associated with the shape
		Rhombus.prototype.initEntity = function initEntity() {
			
			_entities.push(new Entity(this));
			
		};
		
		// Initialize the anchorPoints of the rhombus shape
		Rhombus.prototype.initAnchorPoints = function initAnchorPoints() {

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
		Rhombus.prototype.init = function init() {
			
			// this.initEntity();
			this.initAnchorPoints();
			this.initElement();
		};
		
		return Rhombus;
		
	});
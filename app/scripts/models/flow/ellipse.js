angular.module('APP')
	.factory('Ellipse', function (DiagramShape, AnchorPoint, Diagram, $log, ResourceService) {
		
		// Ellipse constant
		var DEFAULT_ELLIPSE_WIDTH = 0.1;
		var DEFAULT_ELLIPSE_HEIGHT = 0.05;
		
		// Ellipse class constructor
		function Ellipse(centerPoint) {
			
			DiagramShape.call(this, centerPoint);

			if (centerPoint != null) {

				this.type = DiagramShape.TYPES.ELLIPSE;

				this.width = DEFAULT_ELLIPSE_WIDTH;
				this.height = DEFAULT_ELLIPSE_HEIGHT;

				this.init();

			}
			
		}

		// Parse method
		Ellipse.parse = function(obj) {
			
			if (obj != null) {

				var ellipse = new Ellipse();
				
				ellipse.diagram = Diagram.parse(obj.diagram);
				ellipse.width = obj.width;
				ellipse.height = obj.height;
				ellipse.type = obj.type;

				ellipse = DiagramShape.parse(ellipse, obj);

				return ellipse;

			} else {

				return null;

			}

		};
		
		// Inherit from the Shape class
		Ellipse.prototype = Object.create(DiagramShape.prototype);
		Ellipse.prototype.constructor = Ellipse;
		
		// Ellipse class method
		Ellipse.prototype.method = function method() {
			
			DiagramShape.prototype.method.call(this);
			
		};
		
		// Method to draw a path sequence of an ellipse on a canvas
		Ellipse.prototype.createPath = function createPath(context) {

			try {
				// Defining ellipse shape
				var kappa = .5522848,
					w = this.width * DEFAULT_CANVAS_WIDTH,
					h = this.height * DEFAULT_CANVAS_HEIGHT,
					x = this.centerX * DEFAULT_CANVAS_WIDTH - (w / 2),
					y = this.centerY * DEFAULT_CANVAS_HEIGHT - (h / 2),
					ox = (w / 2) * kappa, // control point offset horizontal
					oy = (h / 2) * kappa, // control point offset vertical
					xe = x + w,           // x-end
					ye = y + h,           // y-end
					xm = x + w / 2,       // x-middle
					ym = y + h / 2;       // y-middle

				// Defining path sequence
				context.beginPath();
				context.moveTo(x, ym);
				context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
				context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
				context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
				context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
				context.closePath();
			}catch(err) {
				$log.error(err);
			}
			
		};
		
		// Initialize the entity associated with the shape
		Ellipse.prototype.initEntity = function initEntity() {
			
			_entities.push(new Entity(this));
			
		};
		
		// Initialize the anchorPoints of the ellipse shape
		Ellipse.prototype.initAnchorPoints = function initAnchorPoints() {
			
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
			//_anchorPoints = _anchorPoints.concat(anchorPoints);
			
		};
		
		// init() method
		Ellipse.prototype.init = function init() {
			
			// this.initEntity();
			this.initAnchorPoints();
			
			this.initElement();
		};
		
		return Ellipse;
		
	});
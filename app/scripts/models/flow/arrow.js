angular.module('APP')
	.factory('Arrow', function (DiagramShape, AnchorPoint, $log, ResourceService) {

		// Arrow constants
		var DEFAULT_ARROW_LINE_WIDTH = 1;

		// Arrow class constructor
		function Arrow(startAnchorPoint, endAnchorPoint) {

			DiagramShape.call(this);

			if (startAnchorPoint != null) {

				this.zOrder = 0;

				this.fromPoint = null;
				this.toPoint = null;

				this.startAnchorPoint = startAnchorPoint;
				this.endAnchorPoint = endAnchorPoint;

				this.lineWidth = DEFAULT_ARROW_LINE_WIDTH;

				this.init();
			}
		}

		// Parse method
		Arrow.parse = function(obj) {

			if (obj != null) {

				var arrow = new Arrow();
				arrow = DiagramShape.parse(arrow, obj);

				arrow.zOrder = 0;

				arrow.startAnchorPoint = AnchorPoint.parse(obj.startAnchorPoint);
				arrow.endAnchorPoint = AnchorPoint.parse(obj.endAnchorPoint);

				arrow.lineWidth = DEFAULT_ARROW_LINE_WIDTH;
				arrow.type = obj.type;
				
				return arrow;

			} else {

				return null;

			}

		};

		// Inherit from the Shape class
		Arrow.prototype = Object.create(DiagramShape.prototype);
		Arrow.prototype.constructor = Arrow;
		
		// Arrow class method
		Arrow.prototype.method = function method() {
			
			DiagramShape.prototype.method.call(this);
			
		};
		
		// Method to draw a path sequence of an arrow on a canvas
		Arrow.prototype.createPath = function createPath(context) {

			this.setFromPoint();
			this.setToPoint();

			if(this.fromPoint && this.toPoint) {

				var dx = this.toPoint.x - this.fromPoint.x,
					dy = this.toPoint.y - this.fromPoint.y;

				// normalize
				var length = Math.sqrt(dx * dx + dy * dy),
					unitDx = dx / length,
					unitDy = dy / length;

				// increase this to get a larger arrow head
				var arrowHeadSize = 0.01;

				var arrowPoint1 = {
						x: this.toPoint.x - unitDx * arrowHeadSize - unitDy * arrowHeadSize,
						y: this.toPoint.y - unitDy * arrowHeadSize + unitDx * arrowHeadSize
					},
					arrowPoint2 = {
						x: this.toPoint.x - unitDx * arrowHeadSize + unitDy * arrowHeadSize,
						y: this.toPoint.y - unitDy * arrowHeadSize - unitDx * arrowHeadSize
					};

				// Defining path sequence
				context.beginPath();
				context.moveTo(this.fromPoint.x * DEFAULT_CANVAS_WIDTH, this.fromPoint.y * DEFAULT_CANVAS_HEIGHT);
				context.lineTo(this.toPoint.x * DEFAULT_CANVAS_WIDTH, this.toPoint.y * DEFAULT_CANVAS_HEIGHT);

				context.moveTo(this.toPoint.x * DEFAULT_CANVAS_WIDTH, this.toPoint.y * DEFAULT_CANVAS_HEIGHT);
				context.lineTo(arrowPoint1.x * DEFAULT_CANVAS_WIDTH, arrowPoint1.y * DEFAULT_CANVAS_HEIGHT);
				context.lineTo(arrowPoint2.x * DEFAULT_CANVAS_WIDTH, arrowPoint2.y * DEFAULT_CANVAS_HEIGHT);
				context.lineTo(this.toPoint.x * DEFAULT_CANVAS_WIDTH, this.toPoint.y * DEFAULT_CANVAS_HEIGHT);
				context.closePath();
			}
		};
		
		// Method to set the fromPoint
		Arrow.prototype.setFromPoint = function setFromPoint() {


/*
			var anchorPoint = _anchorPoints.find(function (anchorPoint) {
				return anchorPoint.id == this.startAnchorPoint.id;
			}, this);

*/
			var anchorPoint = this.startAnchorPoint;


			if (anchorPoint) {
				this.fromPoint = anchorPoint.getCenterPoint();
			}

		};
		
		// Method to set the toPoint
		Arrow.prototype.setToPoint = function setToPoint() {
			/*
			var anchorPoint = _anchorPoints.find(function (anchorPoint) {
				if (this.endAnchorPoint.id != null) {
					return anchorPoint.id == this.endAnchorPoint.id;
				} else {
					return null
				}
			}, this);
*/
			var anchorPoint = this.endAnchorPoint;

			if (anchorPoint instanceof AnchorPoint ) {
				this.toPoint = anchorPoint.getCenterPoint();
			} else {
				this.toPoint = this.endAnchorPoint; // here the toAnchorPoint is the mousePosition
			}
			
		};

		Arrow.prototype.toJSON = function() {

			/*
			 private String name;
			 private String description;
			 private Long order;
			 private String type;
			 private FlowAnchorPointDto startPoint;
			 private FlowAnchorPointDto endPoint;
			*/
			var json = {
				id: this.id,
				name: this.name,
				description: this.description,
				type: this.type,
				order: this.order,
			};

			if(this.startAnchorPoint) {
				json.startAnchorPoint = this.startAnchorPoint.toJSON();
			}

			if(this.endAnchorPoint) {
				json.endAnchorPoint = this.endAnchorPoint.toJSON();
			}

			return json;

		};


			// init() method
		Arrow.prototype.init = function init() {
			
			this.setFromPoint();
			this.setToPoint();
			
		};
		
		return Arrow;
		
	});
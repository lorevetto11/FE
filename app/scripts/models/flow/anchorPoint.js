angular.module('APP')
.factory('AnchorPoint', function ($log,  ResourceService) {

	// AnchorPoint constant
	var DEFAULT_ANCHOR_POINT_WIDTH = 0.015;
	var DEFAULT_ANCHOR_POINT_HEIGHT = 0.015;


	// AnchorPoint class constructor
	function AnchorPoint(shape, translationsFromParentCenterPoint) {

		//	DiagramShape.call(this);

		//if (shape != null)
		{

			this.order = 1000;

			this.shape = shape;

				//this.centerPoint = null;

			if(translationsFromParentCenterPoint) {
				this.translationX = translationsFromParentCenterPoint.x;
				this.translationY = translationsFromParentCenterPoint.y;
			}

			this.width = DEFAULT_ANCHOR_POINT_WIDTH;
			this.height = DEFAULT_ANCHOR_POINT_HEIGHT;

			this.init();

		}

	}

	// Parse method
	AnchorPoint.parse = function(obj, shape) {

		if (obj != null) {

			var anchorPoint = new AnchorPoint(shape);
			anchorPoint.id = obj.id;

			//anchorPoint = DiagramShape.parse(anchorPoint, obj);



			anchorPoint.order = 1000;

			anchorPoint.translationX = obj.translationX;
			anchorPoint.translationY = obj.translationY;

			anchorPoint.width = obj.width;
			anchorPoint.height = obj.height;

			return anchorPoint;

		} else {

			return null;

		}

	};

	AnchorPoint.prototype.toJSON = function() {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			translationX: this.translationX,
			translationY: this.translationY,
			width: this.width,
			height: this.height,
			order: this.order,
			shape: {id: this.shape.id},
		}
	};

	AnchorPoint.prototype.method = function method() {

		//		DiagramShape.prototype.method.call(this);

	};

	AnchorPoint.prototype.draw = function draw(context, shape) {

		this.createPath(context, shape);

		context.stroke();
		context.fill();
	};


	// Method to draw a path sequence of an anchorPoint on a canvas
	AnchorPoint.prototype.createPath = function createPath(context, shape) {

		var centerPoint = this.getCenterPoint(shape);

		if(centerPoint) {
			// Defining anchorPoint shape (we arbitrarily have chosen an anchorPoint has a shape of a circle)
			var x = centerPoint.x * DEFAULT_CANVAS_WIDTH,
				y = centerPoint.y * DEFAULT_CANVAS_HEIGHT,
				radius = this.width / 2 * DEFAULT_CANVAS_WIDTH;

			// Defining path sequence

			context.beginPath();
			context.arc(x, y, radius, 0, 2 * Math.PI);
			context.closePath();
		}
	};

	// Method to set the centerPoint relative to its parent shape position and dimension
	AnchorPoint.prototype.getCenterPoint = function getCenterPoint() {
		/*
		 var shape = _shapes.find(function(shape){
		 return shape.id == this.shape.id;
		 }, this),
		 centerPoint;
		 */
		if (this.shape) {
			return {
				x: this.shape.centerX + (this.translationX * this.shape.width),
				y: this.shape.centerY + (this.translationY * this.shape.height)
			}
		}
		return null;

		//this.centerPoint = centerPoint;

	};

	// init() method
	AnchorPoint.prototype.init = function init() {

		//this.setCenterPoint();

	};

	return AnchorPoint;

});
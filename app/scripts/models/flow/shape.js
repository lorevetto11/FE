angular.module('APP')
	.factory('DiagramShape', function ($log, Entity, AnchorPoint, ResourceService) {

		// Shape constant
		var DEFAULT_SHAPE_LINE_WIDTH = 1;
		
		var DEFAULT_SHAPE_STROKE_COLOR = "#000000";
		var DEFAULT_SHAPE_STROKE_COLOR_SELECTED = "#007bff";
		
		var DEFAULT_SHAPE_FILL_COLOR = "#f5f5f5";

		// Shape variables
		var shapeNextId = 0;
		var shapeNextOrder = 0;

		DiagramShape.TYPES = {
			RECTANGLE : "RECTANGLE",
			ELLIPSE : "ELLIPSE",
			RHOMBUS : "RHOMBUS",
			PARALLELOGRAM : "PARALLELOGRAM",
			ANCHORPOINT : "ANCHORPOINT",
			ARROW : "ARROW"
		};

		function DiagramShape(centerPoint) {

			if (centerPoint != null) {

				this.id = shapeNextId++;
				this.zOrder = shapeNextOrder++;

				this.centerPoint = centerPoint;
				
				this.centerX = centerPoint.x;
				this.centerY = centerPoint.y;

				/*
				 The center point of a shape will be a dict of 'x' and 'y' values between 0 and 1
				 It's like this because doing it so will permit us to draw on a canvas that is
				 changing size over time
				 */

				this.lineWidth = DEFAULT_SHAPE_LINE_WIDTH;

				this.strokeColor = DEFAULT_SHAPE_STROKE_COLOR;
				this.strokeColorSelected = DEFAULT_SHAPE_STROKE_COLOR_SELECTED;

				this.fillColor = DEFAULT_SHAPE_FILL_COLOR;

				this.element = null;

			}
			
		}

		DiagramShape.parse = function(shape, obj){

			if (obj != null) {

				shape.id = obj.id;
				shape.zOrder = obj.zOrder;

				shape.name = obj.name;
				shape.description = obj.description;

				shape.lineWidth = DEFAULT_SHAPE_LINE_WIDTH;
				shape.strokeColor = DEFAULT_SHAPE_STROKE_COLOR;
				shape.strokeColorSelected = DEFAULT_SHAPE_STROKE_COLOR_SELECTED;
				shape.fillColor = obj.fillColor ? obj.fillColor : DEFAULT_SHAPE_FILL_COLOR;

				shape.centerX = obj.centerX;
				shape.centerY = obj.centerY;

				if(obj.element) {
					shape.element = Entity.parse(obj.element);
				}

				if(obj.anchorPoints) {
					shape.anchorPoints = [];
					obj.anchorPoints.forEach(function(objPoint){
						shape.anchorPoints.push(AnchorPoint.parse(objPoint, shape));
					}, this);
				}

				return shape;

			} else {

				return null;

			}

		};

		// Method to draw a shape on a canvas
		DiagramShape.prototype.draw = function draw(context, mousePosition) {

			this.createPath(context);
			this.setProperties(context, mousePosition); // TODO select a shape
			
			context.stroke();
			context.fill();


			if(_anchorPointsHighlight || this.selected) {
				(this.anchorPoints || []).forEach(function(aPoint){
					aPoint.draw(context, this);
				}, this);
			}

			if(this.element) {
				this.element.drawContent(context, this)
			}


			/*

			var entity = _entities.find(function (entity) {
				return entity.shape.id == this.id;
			}, this);

			if (entity) {
				entity.drawContent(context, this.centerPoint)
			}
*/
		};

		DiagramShape.prototype.toJSON = function() {

			$log.info("DiagramShape.toJSON");

			var json = {
				id: this.id,
				name: this.name,
				description: this.description,
				centerX : this.centerX,
				centerY : this.centerY,
				fillColor: this.fillColor,
				width: this.width,
				height: this.height,
				type: this.type,
				order: this.order,
			};

			if(this.diagram) {
				// TODO: define a proper toJSON method
				json.diagram = this.diagram;
			}

			if(this.element) {
				// TODO: define a proper toJSON method
				json.element = this.element;
			}

			if(this.anchorPoints) {
				json.anchorPoints = [];
				this.anchorPoints.forEach(function(aPoint){
					json.anchorPoints.push(aPoint.toJSON())
				});
			}

			return json;
		}


		// Method to set context properties such as color and width of the stroke being drawn
		DiagramShape.prototype.setProperties = function setProperties(context, mousePosition) {
			
			if (this.selected) {

				context.lineWidth = this.lineWidth;
				context.strokeStyle = this.strokeColorSelected;
				context.fillStyle = this.fillColor;

			} else { 

				context.lineWidth = this.lineWidth;
				context.strokeStyle = this.strokeColor;
				context.fillStyle = this.fillColor;

			}

			var element = this.element;
			if (element) {
				var typeCCP = element.typeCCP;
				if (typeCCP != null) {
					switch (typeCCP) {
						case Entity.CCPTYPES.NONE:
							context.fillStyle = Entity.COLOR.NONE;
							break;
						case Entity.CCPTYPES.CCP:
							context.fillStyle = Entity.COLOR.CCP;
							break;
						case Entity.CCPTYPES.OPRP:
							context.fillStyle = Entity.COLOR.ORPRP;
							break;
					}
				}
			}
			
		};

		DiagramShape.prototype.initElement = function initElement() {

			this.element = new Entity(this);
		}


		return DiagramShape;
		
	});
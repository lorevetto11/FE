angular.module('APP')
	.factory('Entity', function (
		//Rectangle, Ellipse, Rhombus, Parallelogram,
		Context, PackagingMaterial, $translate) {

		// Entity constant
		var DEFAULT_ENTITY_NAME = "new.entity";
		
		// Entity variables
		var entityNextId = 0;

		Entity.TYPES = {
			BEGIN_END : "BEGIN_END",
			PHASE : "PHASE",
			MATERIAL : "MATERIAL",
			DECISION : "DECISION"
		};

		Entity.CCPTYPES = {
			CCP : "CCP",
			OPRP : "OPRP",
			NONE : "NONE"
		};

		Entity.COLOR = {
			CCP: "#d6eafc",
			OPRP: "#f9f89a",
			NONE: "#f5f5f5"
		};

		// redefinition of Types in order to avoid a circular dependency with DiagramShape
		SHAPE_TYPES = {
			RECTANGLE : "RECTANGLE",
			ELLIPSE : "ELLIPSE",
			RHOMBUS : "RHOMBUS",
			PARALLELOGRAM : "PARALLELOGRAM",
			ANCHORPOINT : "ANCHORPOINT",
			ARROW : "ARROW"
		};

		// Entity class constructor
		function Entity(shape) {

			if (shape != null) {

				this.id = entityNextId++;

				//this.shape = { id : shape.id };

				this.name = $translate.instant(DEFAULT_ENTITY_NAME);
				this.description = null;
				this.typeCCP = null;
				this.risk = null;

				if (shape.type === SHAPE_TYPES.RECTANGLE) {
					this.type = Entity.TYPES.PHASE;
				} else if (shape.type === SHAPE_TYPES.ELLIPSE) {
					this.type = Entity.TYPES.BEGIN_END;
				} else if (shape.type === SHAPE_TYPES.RHOMBUS) {
					this.type = Entity.TYPES.DECISION;
				} else if (shape.type === SHAPE_TYPES.PARALLELOGRAM) {
					this.type = Entity.TYPES.MATERIAL;
				}

			}
			
		}

		Entity.parse = function(obj) {

			if (obj != null) {

				var entity = new Entity();

				entity.id = obj.id;
/*
				if (obj.type === Entity.TYPES.PHASE) {
					entity.shape = Rectangle.parse(obj.shape);
				} else if (obj.type === Entity.TYPES.BEGIN_END) {
					entity.shape = Ellipse.parse(obj.shape);
				} else if (obj.type === Entity.TYPES.DECISION) {
					entity.shape = Rhombus.parse(obj.shape);
				} else if (obj.type === Entity.TYPES.MATERIAL) {
					entity.shape = Parallelogram.parse(obj.shape);
				}
*/
				entity.material = PackagingMaterial.parse(obj.material);
				entity.context = Context.parse(obj.context);

				entity.name = obj.name;
				entity.description = obj.description;
				entity.type = obj.type;
				entity.typeCCP = obj.typeCCP;
				entity.risk = obj.risk;

				return entity;

			} else {

				return null;

			}


		};
		
		// Entity class method
		Entity.prototype.method = function method() {
		};
		
		Entity.prototype.drawContent = function createPath(context, shape) {
			
			context.textAlign = "center";
			context.fillStyle = "black";
			context.textBaseline = "middle";
			context.fillText(this.name, shape.centerX * DEFAULT_CANVAS_WIDTH, shape.centerY * DEFAULT_CANVAS_HEIGHT, shape.width * DEFAULT_CANVAS_WIDTH - 10);
			
		};
		
		return Entity;
		
	});
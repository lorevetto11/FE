angular.module('APP')
	.factory('Danger', function (Organization, PrerequisiteType, Context, PackagingMaterial, ResourceService) {

		function Danger(obj) {

			PrerequisiteType.call(obj, PrerequisiteType.DANGER);

			if (obj) {

				obj.id ? this.id = obj.id : null;

				obj.prerequisiteType ? this.prerequisiteType = new PrerequisiteType(obj.prerequisiteType) : null;
				obj.context ? this.context = new Context(obj.context) : null;
				
			} else {

				this.prerequisiteType = new PrerequisiteType(14, "Danger");
				this.context = null;

			}

			var selectedOrganization = ResourceService.getSelectedOrganization();
			this.organization = Organization.parse(selectedOrganization);

			this.name = null;
			this.description = null;
			this.type = null;
			this.risk = null;
			this.ccp = false;
			this.controlMeasure = null;
			this.criticalLimit = null;
			this.acceptanceLimit = null;
			this.procedures = null;
			this.materials = [];

		}

		Danger.parse = function (obj) {

			if (obj != null) {

				var danger = new Danger();

				danger.id = obj.id;

				danger.organization = Organization.parse(obj.organization);
				danger.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);
				danger.context = Context.parse(obj.context);
				danger.materials = setMaterials(obj.materials);

				danger.name = obj.name;
				danger.description = obj.description;
				danger.type = obj.type;
				danger.risk = obj.risk;
				danger.ccp = obj.ccp;
				danger.controlMeasure = obj.controlMeasure;
				danger.criticalLimit = obj.criticalLimit;
				danger.acceptanceLimit = obj.acceptanceLimit;
				danger.procedures = obj.procedures;

				danger.deleted = obj.deleted;

				return danger;

			} else {

				return null;

			}

			function setMaterials(array) {
				var materials = (array || []).map(function (item) {
					return PackagingMaterial.parse(item);
				});

				return materials;
			}

		};

		Danger.TYPE = {
			BIOLOGICAL: 'Biological',
			CHEMICAL: 'Chemical',
			PHYSICAL: 'Physical',
			ALLERGENS: 'Allergens'
		};

		Danger.RISK = {
			LOW: 'low', MEDIUM: 'medium', HIGH: 'high', VERY_HIGH: 'very high'
		};
		
		Danger.prototype = Object.create(PrerequisiteType.prototype);

		return Danger;

	});
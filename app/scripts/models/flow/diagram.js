angular.module('APP')
	.factory('Diagram', function ($translate, Organization, ResourceService) {

		function Diagram(obj) {

			if (obj) {

				obj.id ? this.id = obj.id : null;

			}

			var selectedOrganization = ResourceService.getSelectedOrganization();
			this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;

			this.name = $translate.instant('new.diagram');
			this.description = null;

		}

		Diagram.parse = function (obj) {

			if (obj != null) {

				var diagram = new Diagram();

				diagram.id = obj.id;

				diagram.organization = Organization.parse(obj.organization);

				diagram.name = obj.name;
				diagram.description = obj.description;

				return diagram;

			} else {

				return null;

			}

		};

		return Diagram;

	});
angular.module('APP')
	.factory('StaffHygiene', function (PrerequisiteType, Context, UserRole, Organization, ResourceService) {

		// function StaffHygiene(userRoleId) {
		//     Prerequisite.call(this, Prerequisite.STAFF_HYGIENE);
		//     this.userRoleId = userRoleId;
		// };
		//
		// StaffHygiene.parse = function(obj){
		//     var s = angular.extend(new StaffHygiene(obj.userRoleId), obj);
		//
		//     return s;
		// }

		// StaffHygiene.prototype = Object.create(Prerequisite.prototype);

		function StaffHygiene(obj) {

			if (obj) {

				obj.id ? this.id = obj.id : null;

				obj.prerequisiteType ? this.prerequisiteType = new PrerequisiteType(obj.prerequisiteType) : null;
				obj.context ? this.context = new Context(obj.context) : null;
				obj.role ? this.userRole = new UserRole(obj.role) : null;

			} else {

				this.prerequisiteType = {
					id: 10
				};
				this.context = null;
				this.role = null;

			}

			var selectedOrganization = ResourceService.getSelectedOrganization();
			this.organization = Organization.parse(selectedOrganization);

		}

		StaffHygiene.parse = function (obj) {

			if (obj != null) {

				var staffHygiene = new StaffHygiene();

				staffHygiene.id = obj.id;

				staffHygiene.organization = Organization.parse(obj.organization);
				staffHygiene.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);
				staffHygiene.context = Context.parse(obj.context);
				staffHygiene.role = UserRole.parse(obj.role);

				staffHygiene.deleted = obj.deleted;

				return staffHygiene;

			} else {

				return null;

			}

		};

		StaffHygiene.prototype = Object.create(PrerequisiteType.prototype);

		return StaffHygiene;
	});
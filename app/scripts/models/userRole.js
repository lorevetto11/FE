angular.module('APP')
    .factory('UserRole', function (Organization, Profile, ResourceService) {

        function UserRole() {

            if (ResourceService.getSelectedOrganization()) {
                this.organization = ResourceService.getSelectedOrganization(); //new Organization(ResourceService.getSelectedOrganization().id);
            }
            this.profiles = [];
        }

        UserRole.parse = function (obj) {

            if (obj != null) {

                var role = new UserRole();

                role.id = obj.id;

                role.organization = Organization.parse(obj.organization);
                role.profiles = setProfiles(obj.profiles);

                role.name = obj.name;
                role.description = obj.description;

                return role;

            } else {

                return null;

            }

            function setProfiles(array) {
                var profiles = (array || []).map(function (item) {
                    return Profile.parse(item);
                });
                
                return profiles;
            }

        };

        // Return the constructor function
        return UserRole;

    });
angular.module('APP')
    .factory('Profile', function (Organization, Grant, ResourceService) {

        function Profile() {

            if(ResourceService.getSelectedOrganization()){
                this.organization = new Organization(ResourceService.getSelectedOrganization().id);
            }
            this.grants = [];

        }

        Profile.parse = function (obj) {

            if (obj != null) {

                var profile = new Profile();

                profile.id = obj.id;

                profile.organization = Organization.parse(obj.organization);
                profile.grants = setGrants(obj.grants);

                profile.name = obj.name;

                return profile;

            } else {

                return null;

            }

            function setGrants(array){
                var grants = [];
                if (array != null) {
                    array.forEach(function(item){
                        grants.push(Grant.parse(item));
                    });
                }
                return grants;
            }

        };

        Profile.prototype = {};

        // Return the constructor function
        return Profile;

    });
angular.module('APP')
    .factory('OrganizationPlace', function (Organization) {


        function OrganizationPlace(id) {
            this.id = id ? id : null;
        }

        OrganizationPlace.parse = function (obj) {

            if (obj != null) {

                var organizationPlace = new OrganizationPlace();

                organizationPlace.id = obj.id;

                organizationPlace.organization = Organization.parse(obj.organization);

                organizationPlace.name = obj.name;
                organizationPlace.description = obj.description;
                organizationPlace.address = obj.address;

                return organizationPlace;
            } else {
                return null;
            }
        };


        // Return the constructor function
        return OrganizationPlace;
        
    });
angular.module('APP')
    .factory('Organization', function () {


        function Organization(id) {

            this.id = id ? id : null;

        }

        Organization.parse = function (obj) {

            if (obj != null) {

                var organization = new Organization();

                organization.id = obj.id;
                
                organization.organization = Organization.parse(obj.organization);

                organization.name = obj.name;
                organization.vatNumber = obj.vatNumber;
                organization.legalResidence = obj.legalResidence;
                organization.email = obj.email;
                organization.phone = obj.phone;
                organization.description = obj.description;

                organization.deleted = obj.deleted;

                return organization;

            } else {

                return null;

            }


        };

        Organization.prototype = {

            getName: function () {

                return this.name;

            }

        };

        // Return the constructor function
        return Organization;
        
    });
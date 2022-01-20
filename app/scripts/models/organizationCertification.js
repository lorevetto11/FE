angular.module('APP')
    .factory('OrganizationCertification', function (Organization, Context) {


        function OrganizationCertification(id) {
            this.id = id ? id : null;
        }

        OrganizationCertification.parse = function (obj) {

            if (obj != null) {

                var certification = new OrganizationCertification();

                certification.id = obj.id;
                certification.organization = Organization.parse(obj.organization);

                certification.name = obj.name;
                certification.description = obj.description;
                certification.authority = obj.authority;
                certification.date = obj.date;
                certification.expiryDate = obj.expiryDate;
                certification.context = Context.parse(obj.context);

                return certification;
            } else {
                return null;
            }
        };

        // Return the constructor function
        return OrganizationCertification;
    });
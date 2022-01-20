angular.module('APP')
    .factory('Person', function (Organization, UserRole, $log) {


        function Person() {

        }

        Person.parse = function (obj) {

            if (obj != null) {

                var user = new Person();

                user.id = obj.id;

                user.organization = Organization.parse(obj.organization);
                user.role = UserRole.parse(obj.role);

                user.firstname = obj.firstname;
                user.lastname = obj.lastname;
                user.email = obj.email;
                user.phone = obj.phone;
                user.language = obj.language;

                user.deleted = obj.deleted;

                // TODO Add attachment functionality | backend
                //f.cvAttachmentId = obj.cvAttachmentId;

                return user;

            } else {

                return null;

            }

        };

        Person.prototype = {
            getFullName: function () {
                return this.firstname + ' ' + this.lastname;
            }
        };

        // Return the constructor function
        return Person;

    });
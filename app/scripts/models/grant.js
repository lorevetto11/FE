angular.module('APP')
    .factory('Grant', function () {

        function Grant() {

        }

        Grant.parse = function (obj) {

            if (obj != null) {

                var grant = new Grant();

                grant.id = obj.id;

                grant.name = obj.name;

                return grant;

            } else {

                return null;

            }

        };

        Grant.prototype = {};

        // Return the constructor function
        return Grant;

    });
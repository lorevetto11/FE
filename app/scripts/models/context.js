angular.module('APP')
    .factory('Context', function () {

        function Context(obj) {

            if (obj) {

                obj.id ? this.id = obj.id : null;

            }

            this.className = null;

        }

        Context.parse = function (obj) {

            if (obj != null) {

                var context = new Context();

                context.id = obj.id;

                context.className = obj.className;

                context.deleted = obj.deleted;

                return context;

            } else {

                return null;

            }

        };

        return Context;

    });
angular.module('APP')
    .factory('Floor', function (Organization, Context, PrerequisiteType, ResourceService) {

        function Floor(id) {
            this.id = id;
            if(ResourceService.getSelectedOrganization()){
                this.organization = Organization.parse(ResourceService.getSelectedOrganization());
            }
            this.order = 0;
        }

        Floor.parse = function (obj) {

            if (obj != null) {

                var floor = new Floor();

                floor.id = obj.id;

                floor.organization = Organization.parse(obj.organization);
                floor.context = Context.parse(obj.context);

                floor.name = obj.name;
                floor.description = obj.description;
                floor.order = obj.order;
                floor.width = obj.width;
                floor.height = obj.height;

                floor.deleted = obj.deleted;

                return floor;

            } else {

                return null;

            }

        };

        // Floor.objectName = 'floor';

        return Floor;

    });
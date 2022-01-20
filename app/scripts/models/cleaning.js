angular.module('APP')
    .factory('Cleaning', function (PrerequisiteType, Shape, Color, Layout, Floor, Organization, ResourceService, Context) {

        function Cleaning(type) {

            var selectedOrganization = ResourceService.getSelectedOrganization();
            var selectedFloor = ResourceService.getSelectedFloor();

            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;
            this.floor = selectedFloor ? new Floor(selectedFloor.id) : null;

            if(type){

                this.shape = new Shape(type.shape.type);
                this.prerequisiteType = new PrerequisiteType(6, "Cleaning");

                this.name = type.name;
                this.description = type.description;

                this.constrainedToType = new PrerequisiteType(1, "Layout");

            } else {

                this.shape = new Shape("1");
                this.prerequisiteType = new PrerequisiteType(6, "Cleaning");

                this.name = "C";
                this.description = "Cleaning description";

                this.constrainedToType = new PrerequisiteType(1, "Layout");

            }


            
        }

        Cleaning.parse = function (obj) {

            if (obj != null) {

                var cleaning = new Cleaning();

                cleaning.id = obj.id;

                cleaning.organization = Organization.parse(obj.organization);
                cleaning.floor = Floor.parse(obj.floor);
                cleaning.shape = Shape.parse(obj.shape);
                cleaning.context = Context.parse(obj.context);
                cleaning.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);
                cleaning.layout = Layout.parse(obj.layout);

                cleaning.name = obj.name;
                cleaning.description = obj.description;

                cleaning.deleted = obj.deleted;

                return cleaning;

            } else {

                return null;

            }

        };

        Cleaning.prototype = Object.create(PrerequisiteType.prototype);

        return Cleaning;
    });
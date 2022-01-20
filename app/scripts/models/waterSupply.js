angular.module('APP')
    .factory('WaterSupply', function (PrerequisiteType, Layout, Shape, Color, Context, Floor, Organization, ResourceService) {

        function WaterSupply(type) {

            var selectedOrganization = ResourceService.getSelectedOrganization();
            var selectedFloor = ResourceService.getSelectedFloor();

            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;
            this.floor = selectedFloor ? new Floor(selectedFloor.id) : null;

            if(type){

                this.shape = new Shape(type.shape.type);
                this.shape.radius = type.shape.radius;
                this.shape.color = type.shape.color;
                this.prerequisiteType = new PrerequisiteType(2, "WaterSupply");

                this.name = type.name;
                this.description = type.description;

                this.constrainedToType = new PrerequisiteType(1, "Layout");

            } else {

                this.shape = new Shape("2");
                this.shape.radius = 0.02;
                this.shape.color = "#FFFF00";
                this.prerequisiteType = new PrerequisiteType(2, "WaterSupply");

                this.name = "W";
                this.description = "Water Supply description";

                this.constrainedToType = new PrerequisiteType(1, "Layout");
                
            }

        }

        WaterSupply.parse = function (obj) {
            if (obj != null) {

                var waterSupply = new WaterSupply();

                waterSupply.id = obj.id;

                waterSupply.organization = Organization.parse(obj.organization);
                waterSupply.floor = Floor.parse(obj.floor);
                waterSupply.shape = Shape.parse(obj.shape);
                waterSupply.context = Context.parse(obj.context);
                waterSupply.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);
                waterSupply.layout = Layout.parse(obj.layout);

                waterSupply.name = obj.name;
                waterSupply.description = obj.description;

                waterSupply.deleted = obj.deleted;
                
                waterSupply.constrainedTo = obj.layout;

                return waterSupply;

            } else {

                return null;

            }

        };

        WaterSupply.prototype = Object.create(PrerequisiteType.prototype);

        return WaterSupply;

    });

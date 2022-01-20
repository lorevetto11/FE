angular.module('APP')
    .factory('PestControl', function (PrerequisiteType, Layout, Shape, Color, Organization, Floor, ResourceService, Context) {

        function PestControl(type) {

            var selectedOrganization = ResourceService.getSelectedOrganization();
            var selectedFloor = ResourceService.getSelectedFloor();

            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;
            this.floor = selectedFloor ? new Floor(selectedFloor.id) : null;

            if(type){

                this.shape = new Shape(type.shape.type);
                this.shape.radius = type.shape.radius;
                this.shape.color = type.shape.color;
                this.prerequisiteType = new PrerequisiteType(9, "PestControl");

                this.name = type.name;
                this.description = type.description;

                this.constrainedToType = new PrerequisiteType(1, "Layout");

            } else {
                
                this.shape = new Shape("2");
                this.shape.radius = 0.02;
                this.shape.color = "#FFFF00";
                this.prerequisiteType = new PrerequisiteType(9, "PestControl");

                this.name = "PC";
                this.description = "Pest Control description";

                this.constrainedToType = new PrerequisiteType(1, "Layout");

            }

        }

        PestControl.parse = function(obj){

            if (obj != null) {

                var pestControl = new PestControl();

                pestControl.id = obj.id;

                pestControl.organization = Organization.parse(obj.organization);
                pestControl.floor = Floor.parse(obj.floor);
                pestControl.shape = Shape.parse(obj.shape);
                pestControl.context = Context.parse(obj.context);
                pestControl.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);
                pestControl.layout = Layout.parse(obj.layout);


                pestControl.name = obj.name;
                pestControl.description = obj.description;

                pestControl.deleted = obj.deleted;

                pestControl.constrainedTo = obj.layout;

                return pestControl;

            } else {

                return null;

            }

        };

        PestControl.prototype = Object.create(PrerequisiteType.prototype);

        return PestControl;
    });
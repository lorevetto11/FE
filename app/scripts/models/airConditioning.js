angular.module('APP')
    .factory('AirConditioning', function (PrerequisiteType, Layout, Shape, Color, Organization, Floor, Context, ResourceService) {

        function AirConditioning(equipment) {

            var selectedOrganization = ResourceService.getSelectedOrganization();
            var selectedFloor = ResourceService.getSelectedFloor();

            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;
            this.floor = selectedFloor ? new Floor(selectedFloor.id) : null;

            this.prerequisiteType = new PrerequisiteType(3, "AirConditioning");

            this.shape = equipment ? equipment.shape : new Shape("1");
            this.shape.color = equipment ? equipment.shape.color : "#be7";

            this.name = equipment ? equipment.name : "PPZ";
            this.description = equipment ? equipment.description : "Positive Pressuze Zone";
            this.equipment = {
                name : equipment ? equipment.name : null,
                description: equipment ? equipment.description : null
            };

            this.constrainedToType = new PrerequisiteType(1, "Layout");

        }

        AirConditioning.parse = function(obj){

            if (obj != null) {

                var airConditioning = new AirConditioning();

                airConditioning.id = obj.id;

                airConditioning.organization = Organization.parse(obj.organization);
                airConditioning.floor = Floor.parse(obj.floor);
                airConditioning.shape = Shape.parse(obj.shape);
                airConditioning.context = Context.parse(obj.context);
                airConditioning.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);
                airConditioning.layout = Layout.parse(obj.layout);


                airConditioning.name = obj.name;
                airConditioning.description = obj.description;

                airConditioning.deleted = obj.deleted;

                airConditioning.constrainedTo = obj.layout;

                return airConditioning;

            } else {

                return null;

            }

        };

        AirConditioning.prototype = Object.create(PrerequisiteType.prototype);

        return AirConditioning;

    });
angular.module('APP')
    .factory('WasteDisposal', function (PrerequisiteType, Layout, Shape, Color, ResourceService, Organization, Floor, Context) {

        function WasteDisposal(type) {

            var selectedOrganization = ResourceService.getSelectedOrganization();
            var selectedFloor = ResourceService.getSelectedFloor();

            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;
            this.floor = selectedFloor ? new Floor(selectedFloor.id) : null;

            this.shape = type ? type.shape : new Shape(Shape.RECTANGLE);
            this.prerequisiteType = new PrerequisiteType(5, "WasteDisposal");

            this.name = type ? type.name : "WD";
            this.description = type ? type.description : "Waste Disposal";

            this.constrainedToType = new PrerequisiteType(1, "Layout");

        }

        WasteDisposal.parse = function (obj) {

            if (obj != null) {

                var wasteDisposal = new WasteDisposal();

                wasteDisposal.id = obj.id;

                wasteDisposal.organization = Organization.parse(obj.organization);
                wasteDisposal.floor = Floor.parse(obj.floor);
                wasteDisposal.shape = Shape.parse(obj.shape);
                wasteDisposal.context = Context.parse(obj.context);
                wasteDisposal.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);
                wasteDisposal.layout = Layout.parse(obj.layout);

                wasteDisposal.name = obj.name;
                wasteDisposal.description = obj.description;

                wasteDisposal.deleted = obj.deleted;

                wasteDisposal.constrainedTo = obj.layout;

                return wasteDisposal;

            } else {

                return null;

            }

        };

        WasteDisposal.prototype = Object.create(PrerequisiteType.prototype);

        return WasteDisposal;

    });
angular.module('APP')
    .factory('Equipment', function (PrerequisiteType, Layout, Shape, Color, Floor, EEquipment, EquipmentType, Organization, ResourceService, Context) {

        function Equipment(type) {

            var selectedOrganization = ResourceService.getSelectedOrganization();
            var selectedFloor = ResourceService.getSelectedFloor();

            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;
            this.floor = selectedFloor ? new Floor(selectedFloor.id) : null;

            this.shape = type ? type.shape : new Shape(Shape.RECTANGLE_FIX);
            this.prerequisiteType = new PrerequisiteType(8, "Equipment");

            this.name = type ? type.name : "E";
            this.description = type ? type.description : "Equipment";

            this.constrainedToType = new PrerequisiteType(1, "Layout");

        }

        Equipment.parse = function(obj){

            if (obj != null) {

                var equipment = new Equipment();

                equipment.id = obj.id;

                equipment.organization = Organization.parse(obj.organization);
                equipment.floor = Floor.parse(obj.floor);
                equipment.shape = Shape.parse(obj.shape);
                equipment.context = Context.parse(obj.context);
                equipment.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);
                equipment.layout = Layout.parse(obj.layout);
                equipment.equipment = EEquipment.parse(obj.equipment);
                equipment.equipmentType = EquipmentType.parse(obj.equipmentType);

                equipment.name = obj.name;
                equipment.description = obj.description;

                equipment.deleted = obj.deleted;
                
                equipment.constrainedTo = obj.layout;

                return equipment;

            } else {

                return null;

            }
            
        };

        Equipment.prototype = Object.create(PrerequisiteType.prototype);

        return Equipment;
        
    });
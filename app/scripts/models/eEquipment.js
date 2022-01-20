angular.module('APP')
    .factory('EEquipment', function (Context, Frequency, EquipmentType, Organization, ResourceService, Supplier) {

        function EEquipment(frequency, equipmentType) {

            var selectedOrganization = ResourceService.getSelectedOrganization();
            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;

            this.frequency = frequency ? Frequency.parse(frequency) : new Frequency();
            this.equipmentType = equipmentType ? EquipmentType.parse(equipmentType) : new EquipmentType();
            this.supplier = null;

        }

        EEquipment.parse = function(obj){

            if (obj != null) {

                var equipment = new EEquipment();

                equipment.id = obj.id;

                equipment.organization = Organization.parse(obj.organization);
                equipment.context = Context.parse(obj.context);
                equipment.frequency = Frequency.parse(obj.frequency);
                equipment.equipmentType = EquipmentType.parse(obj.equipmentType);
                equipment.supplier = Supplier.parse(obj.supplier);

                equipment.name = obj.name;
                equipment.description = obj.description;
                equipment.maintainer = obj.maintainer;
                equipment.startupDate = obj.startupDate;

                equipment.deleted = obj.deleted;

                return equipment;

            } else {

                return null;

            }
            
        };

        return EEquipment;
        
    });
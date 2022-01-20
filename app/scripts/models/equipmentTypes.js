angular.module('APP')
    .factory('EquipmentType', function ($translate, Organization, Shape, ResourceService) {

        function EquipmentType(obj) {

            if (obj) {

                obj.id ? this.id = obj.id : null;

                obj.shape ? this.shape = Shape.parse(obj.shape) : null;

            } else {

                this.shape = null;

            }

            var selectedOrganization = ResourceService.getSelectedOrganization();
            this.organization = Organization.parse(selectedOrganization);

            this.name = $translate.instant("new.equipmentType");
            this.description = null;

        }

        EquipmentType.parse = function(obj){

            if (obj != null) {

                var type = new EquipmentType();

                type.id = obj.id;

                type.organization = Organization.parse(obj.organization);
                type.shape = Shape.parse(obj.shape);

                type.name = obj.name;
                type.description = obj.description;

                type.deleted = obj.deleted;

                return type;

            } else {

                return null;

            }
            
        };

        return EquipmentType;
        
    });
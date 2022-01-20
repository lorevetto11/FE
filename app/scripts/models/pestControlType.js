angular.module('APP')
    .factory('PestControlType', function ($translate, Organization, Shape, ResourceService) {

        function PestControlType(obj) {

            if (obj) {

                obj.id ? this.id = obj.id : null;

                obj.shape ? this.shape = Shape.parse(obj.shape) : null;

            } else {

                this.shape = null;

            }

            var selectedOrganization = ResourceService.getSelectedOrganization();
            this.organization = Organization.parse(selectedOrganization);

            this.name = $translate.instant("new.pestControlType");
            this.description = null;

        }

        PestControlType.parse = function(obj){

            if (obj != null) {

                var type = new PestControlType();

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

        return PestControlType;
        
    });
angular.module('APP')
    .factory('RiskClass', function (Color, PrerequisiteType, Organization, ResourceService) {

        function RiskClass(id, name, color) {

            var selectedOrganization = ResourceService.getSelectedOrganization();

            this.id = id ? id : null;

            this.organization = {
                id: selectedOrganization.id
            };

            this.name = name ? name : null;
            this.color = color ? color : null;

            // this.name = name;
            // this.description = description;
            //this.value = value;

        }

        // var _parse = function(obj) {
        //     var r = new RiskClass();
        //     return angular.extend(r, obj);
        // };

        RiskClass.parse = function (obj) {

            if (obj != null) {

                var riskClass = new RiskClass();

                riskClass.id = obj.id;

                riskClass.organization = Organization.parse(obj.organization);

                riskClass.name = obj.name;
                riskClass.description = obj.description;
                riskClass.color = obj.color;
                riskClass.order = obj.order;

                riskClass.deleted = obj.deleted;

                return riskClass;

            } else {

                return null;

            }

        };

        return RiskClass;
        
    });
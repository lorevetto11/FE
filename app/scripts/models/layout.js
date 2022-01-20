angular.module('APP')
    .factory('Layout', function (PrerequisiteType, Shape, RiskClass, Organization, Floor, ResourceService){


        function Layout(startX, startY) {

            var selectedOrganization = ResourceService.getSelectedOrganization();
            var selectedFloor = ResourceService.getSelectedFloor();

            this.organization =  selectedOrganization ? new Organization(selectedOrganization.id): null;
            this.floor = selectedFloor ? new Floor(selectedFloor.id) : null;
            this.riskClass = new RiskClass(-1, "scegli classe di rischio", "#808080");
            this.shape = new Shape("1");
            this.prerequisiteType = new PrerequisiteType(1, "Layout");

            this.name = "New layout";
            this.description = "Layout description";

        }

        Layout.parse = function(obj){

            if (obj != null) {

                var layout = new Layout();

                layout.id = obj.id;

                layout.organization = Organization.parse(obj.organization);
                layout.floor = Floor.parse(obj.floor);
                layout.riskClass = RiskClass.parse(obj.riskClass);
                layout.shape = Shape.parse(obj.shape);
                layout.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);

                layout.name = obj.name;
                layout.description = obj.description;

                layout.deleted = obj.deleted;

                return layout;

            } else {

                return null;

            }
            
        };

        Layout.prototype = Object.create(PrerequisiteType.prototype);

        return Layout;
        
    });
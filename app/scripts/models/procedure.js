angular.module('APP')
    .factory('Procedure', function (RiskClass, Organization, UserRole, ResourceService, PrerequisiteType) {

        function Procedure() {

            var selectedOrganization = ResourceService.getSelectedOrganization();
            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;
        }
    
        Procedure.parse = function(obj){

            if (obj != null) {

                var procedure = new Procedure();

                procedure.id = obj.id;

                procedure.organization = Organization.parse(obj.organization);
                procedure.riskClass = RiskClass.parse(obj.riskClass);
                procedure.userRole = UserRole.parse(obj.userRole);
                procedure.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);

                procedure.title = obj.title;
                procedure.description = obj.description;
                procedure.purpose = obj.purpose;
                procedure.equipments = obj.equipments;
                procedure.activities = obj.activities;
                procedure.process_check = obj.process_check;
                procedure.results_check = obj.results_check;
                procedure.revision = obj.revision;

                procedure.privacy = obj.privacy;
                procedure.deleted = obj.deleted;

                return procedure;

            } else {

                return null;

            }

        };

        return Procedure;

    });
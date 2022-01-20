angular.module('APP')
    .factory('MonitoringOutcome', function (Frequency, Organization, Context, Procedure, ResourceService) {

        function MonitoringOutcome(prerequisiteType, context) {

            this.organization = Organization.parse(ResourceService.getSelectedOrganization());
            this.prerequisiteType = prerequisiteType ? prerequisiteType : null;
            this.context = context ? context : null;
            this.frequency = new Frequency();
            this.procedure = new Procedure();
            this.frequencyRelatedToRiskClass = true;

        }

        MonitoringOutcome.parse = function (obj) {

            if (obj != null) {

                var monitoring = new MonitoringOutcome();

                monitoring.id = obj.id;

                monitoring.organization = Organization.parse(obj.organization);
                monitoring.frequency = Frequency.parse(obj.frequency);
                monitoring.context = Context.parse(obj.context);
                monitoring.procedure = Procedure.parse(obj.procedure);

                monitoring.insertTime = obj.insertTime;
                monitoring.updateTime = obj.updateTime;
                monitoring.deleted = obj.deleted;

                return monitoring;

            } else {

                return null;

            }

        };

        return MonitoringOutcome;
    });
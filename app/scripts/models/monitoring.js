angular.module('APP')
    .factory('Monitoring', function (Frequency, Organization, Context, Procedure, Outcome, ResourceService) {

        function Monitoring(prerequisiteType, context) {

            this.organization = Organization.parse(ResourceService.getSelectedOrganization());
            this.prerequisiteType = prerequisiteType ? prerequisiteType : null;
            this.context = context ? context : null;
            this.frequency = new Frequency();
            this.procedure = new Procedure();
            this.frequencyRelatedToRiskClass = true;

        }

        Monitoring.parse = function (obj) {

            if (obj != null) {

                var monitoring = new Monitoring();

                monitoring.id = obj.id;

                monitoring.organization = Organization.parse(obj.organization);
                monitoring.frequency = Frequency.parse(obj.frequency);
                monitoring.context = Context.parse(obj.context);
                monitoring.procedure = Procedure.parse(obj.procedure);
                monitoring.outcomes = setOutcomes(obj.outcomes);

                monitoring.insertTime = obj.insertTime;
                monitoring.updateTime = obj.updateTime;
                monitoring.deleted = obj.deleted;

                return monitoring;

            } else {

                return null;

            }

            function setOutcomes(array) {

                if(array) {
                    var outcomes = array.map(function (item) {
                        return Outcome.parse(item);
                    });
                    return outcomes;
                }
            }

        };

        return Monitoring;
    });
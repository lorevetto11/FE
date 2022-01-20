angular.module('APP')
.factory('Frequency', function (Organization, RiskClass, PrerequisiteType, ResourceService) {

    Frequency.PERIOD = {
        HOUR: 'hour',
        DAY : 'day',
        WEEK : 'week',
        MONTH: 'month',
        YEAR : 'year'
    };

    function Frequency(riskClass, prerequisiteType) {

        this.organization = Organization.parse(ResourceService.getSelectedOrganization());
        this.riskClass = riskClass ? RiskClass.parse(riskClass) : null;
        this.prerequisiteType = prerequisiteType ? PrerequisiteType.parse(prerequisiteType) : null;

        this.type = "DEFAULT";
        this.period = Frequency.PERIOD.HOUR;
        this.value = null;
        this.asNeeded = false;
        this.justOnce = false;

    }

    Frequency.parse = function(obj){

        if (obj != null) {

            var frequency = new Frequency();

            frequency.id = obj.id;

            frequency.organization = Organization.parse(obj.organization);
            frequency.riskClass = RiskClass.parse(obj.riskClass);
            frequency.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);

            frequency.type = obj.type;
            frequency.asNeeded = obj.asNeeded;
            frequency.justOnce = obj.justOnce;
            frequency.period = obj.period;
            frequency.value = obj.value;

            frequency.deleted = obj.deleted;

            return frequency;

        } else {

            return null;

        }

    };

    return Frequency;

});
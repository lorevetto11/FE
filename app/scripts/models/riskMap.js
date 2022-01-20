angular.module('APP')
.factory('RiskMap', function (Organization, Danger, Entity, ResourceService) {

    function RiskMap(obj) {

        if (obj) {

            obj.id ? this.id = obj.id : null;

            obj.danger ? this.danger = obj.danger : null;
            obj.element ? this.element = obj.element : null;

        } else {

            this.danger = null;
            this.element = null;

        }

        var selectedOrganization = ResourceService.getSelectedOrganization();
        this.organization = { id: selectedOrganization.id };

        this.value = null;

    }

    RiskMap.parse = function (obj) {

        if (obj != null) {

            var riskMap = new RiskMap();

            riskMap.id = obj.id;

            riskMap.organization = Organization.parse(obj.organization);
            riskMap.danger = Danger.parse(obj.danger);
            riskMap.element = Entity.parse(obj.element);

            riskMap.value = obj.value;

            riskMap.deleted = obj.deleted;

            return riskMap;

        } else {

            return null;

        }

    };

    return RiskMap;
});
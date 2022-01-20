angular.module('APP')
.factory('Noncompliance', function (Organization, SystemCheckRequirement, Context, ProcessCheck, ResourceService) {
    
    // Noncompliance.parse = function(obj){
    //     var a = new Noncompliance();
    //
    //     a.id = obj.id;
    //     a.createDate = obj.createDate;
    //     a.description = obj.description;
    //     a.treatment = obj.treatment;
    //     a.retrieval = obj.retrieval;
    //     a.causes = obj.causes;
    //     a.corrections = obj.corrections;
    //     a.checks = obj.checks;
    //     a.closeDate = obj.closeDate;
    //
    //     a.systemCheckRequirementId = obj.systemCheckRequirementId;
    //     a.processCheckId = obj.processCheckId;
    //
    //     a.prerequisiteType = obj.prerequisiteType;
    //     a.prerequisiteId = obj.prerequisiteId;
    //
    //     //a.outcomeId = obj.outcomeId;
    //
    //     return a;
    // }

    function Noncompliance(obj) {

        if (obj) {

            obj.id ? this.id = obj.id : null;
            
            obj.systemCheckRequirement ? this.systemCheckRequirement = new SystemCheckRequirement(obj.systemCheckRequirement) : null;
            obj.context ? this.context = new Context(obj.context) : null;
            obj.processCheck ? this.processCheck = new ProcessCheck(obj.processCheck) : null;

        } else {

            this.systemCheckRequirement = null;
            this.context = null;
            this.processCheck = null;

        }

        var selectedOrganization = ResourceService.getSelectedOrganization();
        this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;

        this.closeDate = null;
        this.description = null;
        this.treatment = null;
        this.retrieval = null;
        this.causes = null;
        this.corrections = null;
        this.checks = null;
        this.startDate = null;
        this.closeDate = null;
        this.insertUser = null;
        this.closeUser = null;

    }

    Noncompliance.parse = function (obj) {

        if (obj != null) {

            var noncompliance = new Noncompliance();

            noncompliance.id = obj.id;

            noncompliance.organization = Organization.parse(obj.organization);
            noncompliance.systemCheckRequirement = SystemCheckRequirement.parse(obj.systemCheckRequirement);
            noncompliance.context = Context.parse(obj.context);
            noncompliance.processCheck = ProcessCheck.parse(obj.processCheck);

            noncompliance.closeDate = obj.closeDate;
            noncompliance.description = obj.description;
            noncompliance.treatment = obj.treatment;
            noncompliance.retrieval = obj.retrieval;
            noncompliance.causes = obj.causes;
            noncompliance.corrections = obj.corrections;
            noncompliance.checks = obj.checks;
            noncompliance.startDate = obj.startDate;
            noncompliance.closeDate = obj.closeDate;
            noncompliance.insertUser = obj.insertUser;
            noncompliance.closeUser = obj.closeUser;

            noncompliance.deleted = obj.deleted;

            return noncompliance;

        } else {

            return null;

        }

    };

    return Noncompliance;
});
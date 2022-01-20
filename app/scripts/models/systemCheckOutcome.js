angular.module('APP')
.factory('SystemCheckOutcome', function (Noncompliance, Context, SystemCheckRequirement, SystemCheckPlanning) {

    // function SystemCheckOutcome(systemCheckRequirementId, systemCheckPlanningId) {
    //     this.systemCheckRequirementId = systemCheckRequirementId;
    //     this.systemCheckPlanningId = systemCheckPlanningId;
    // };
    //
    // SystemCheckOutcome.parse = function(obj){
    //     var a = new SystemCheckOutcome(obj.systemCheckRequirementId, obj.systemCheckPlanningId);
    //     a.id = obj.id;
    //     a.createDate = obj.createDate;
    //     a.evidence = obj.evidence;
    //     a.attachment = obj.attachment;
    //     a.userExaminerId = obj.userExaminerId;
    //     a.noncomplianceId = obj.noncomplianceId;
    //
    //     return a;
    // }

    function SystemCheckOutcome(obj) {

        if (obj) {

            obj.id ? this.id = obj.id : null;

            obj.context ? this.context = new Context(obj.context) : null;
            obj.nonCompliance ? this.nonCompliance = new Noncompliance(obj.nonCompliance) : null;
            obj.systemcheckRequirement ? this.systemcheckRequirement = new SystemCheckRequirement(obj.systemcheckRequirement) : null;
            obj.systemcheckPlanning ? this.systemcheckPlanning = new SystemCheckPlanning(obj.systemcheckPlanning) : null;
            
        } else {

            this.context = null;
            this.nonCompliance = null;
            this.systemcheckRequirement = null;
            this.systemcheckPlanning = null;

        }

        this.evidence = null;

    }

    SystemCheckOutcome.parse = function (obj) {

        if (obj != null) {

            var systemCheckOutcome = new SystemCheckOutcome();

            systemCheckOutcome.id = obj.id;

            systemCheckOutcome.context = Context.parse(obj.context);
            systemCheckOutcome.nonCompliance = Noncompliance.parse(obj.nonCompliance);
            systemCheckOutcome.systemcheckRequirement = SystemCheckRequirement.parse(obj.systemcheckRequirement);
            systemCheckOutcome.systemcheckPlanning = SystemCheckPlanning.parse(obj.systemcheckPlanning);

            systemCheckOutcome.evidence = obj.evidence;

            systemCheckOutcome.deleted = obj.deleted;

            return systemCheckOutcome;

        } else {

            return null;

        }

    };

    return SystemCheckOutcome;
});
angular.module('APP')
.factory('ProcessCheckOutcome', function (Noncompliance,ProcessCheck, Context, ProcessCheckPlanning) {

    // function ProcessCheckOutcome(processCheckId, processCheckPlanningId) {
    //     this.processCheckId = processCheckId;
    //     this.processCheckPlanningId = processCheckPlanningId;
    // };
    //
    // ProcessCheckOutcome.parse = function(obj){
    //     var a = new ProcessCheckOutcome(obj.processCheckId, obj.processCheckPlanningId);
    //     a.id = obj.id;
    //     a.createDate = obj.createDate;
    //     a.evidence = obj.evidence;
    //     a.attachment = obj.attachment;
    //     a.userExaminerId = obj.userExaminerId;
    //     a.noncomplianceId = obj.noncomplianceId;
    //
    //     return a;
    // }

    function ProcessCheckOutcome(obj) {

        if (obj) {

            obj.id ? this.id = obj.id : null;

            obj.nonCompliance ? this.nonCompliance = new Noncompliance(obj.nonCompliance) : null;
            obj.context ? this.context = new Context(obj.context) : null;
            obj.processcheckPlanning ? this.processcheckPlanning = new ProcessCheckPlanning(obj.processcheckPlanning) : null;
            obj.processCheck ? this.processCheck = new ProcessCheck(obj.processCheck) : null;



        } else {

            this.nonCompliance = null;
            this.context = null;
            this.processcheckPlanning = null;
            this.processCheck = null;

        }

        this.evidence = null;

    }

    ProcessCheckOutcome.parse = function (obj) {

        if (obj != null) {

            var processCheckOutcome = new ProcessCheckOutcome();

            processCheckOutcome.id = obj.id;

            processCheckOutcome.nonCompliance = Noncompliance.parse(obj.nonCompliance);
            processCheckOutcome.context = Context.parse(obj.context);
            processCheckOutcome.processcheckPlanning = ProcessCheckPlanning.parse(obj.processcheckPlanning);
            processCheckOutcome.processCheck = ProcessCheck.parse(obj.processCheck);

            processCheckOutcome.evidence = obj.evidence;

            processCheckOutcome.deleted = obj.deleted;

            return processCheckOutcome;

        } else {

            return null;

        }

    };

    return ProcessCheckOutcome;
});
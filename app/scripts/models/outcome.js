angular.module('APP')
.factory('Outcome', function (Attachment, Context, Person, MonitoringOutcome) {

    function Outcome(monitoring, user) {
        // Rest service doesn't accept null values, workaround
        this.monitoring = monitoring ? { id:monitoring.id } : null;
        this.user = user ? { id : user.id } : null;
    }

    Outcome.parse = function(obj){

        // var o = new Outcome(obj.monitoringId, obj.userExaminerId);
        //
        // o.id = obj.id;
        // o.createDate = obj.createDate;
        // o.successfull = obj.successfull;
        // o.attachmentId = obj.attachmentId;
        // o.note = obj.note;
        //
        // return o;

        if (obj != null) {

            var outcome = new Outcome();

            outcome.id = obj.id;

            outcome.context = Context.parse(obj.context);
            outcome.user = Person.parse(obj.user);
            outcome.monitoring = MonitoringOutcome.parse(obj.monitoring);

            outcome.result = obj.result;
            outcome.note = obj.note;

            outcome.insertTime = obj.insertTime;
            outcome.updateTime = obj.updateTime;
            outcome.deleted = obj.deleted;

            return outcome;

        } else {

            return null;

        }

    };

    return Outcome;

});
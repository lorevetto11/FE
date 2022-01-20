angular.module('APP')
    .factory('Participant', function (Context, Person) {

        function Participant(userId) {
            this.user = {
                id : userId
            }
        }

        Participant.parse = function (obj) {

            if (obj != null) {

                var participant = new Participant();

                participant.id = obj.id;

                participant.context = Context.parse(obj.context);
                participant.user = Person.parse(obj.user);

                participant.passed = obj.passed;
                participant.note = obj.note;

                participant.deleted = obj.deleted;

                return participant;

            } else {

                return null;

            }

        };

        // Participant.parse = function(obj){
        //     var p = new Participant(obj.userId);
        //     p.passed = obj.passed;
        //     p.note = obj.note;
        //     return p;
        // }

        return Participant;
    });
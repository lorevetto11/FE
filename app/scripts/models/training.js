angular.module('APP')
    .factory('Training', function ($translate, Course, Organization, UserRole, Participant, ResourceService) {

        function Training() {

            var selectedOrganization = ResourceService.getSelectedOrganization();
            this.organization = Organization.parse(selectedOrganization);
            this.participants = [];

            this.name = $translate.instant("new.lesson");
            this.date = new Date();
            this.archived = false;

        }

        Training.parse = function (obj) {

            if (obj != null) {

                var training = new Training();

                training.id = obj.id;

                training.organization = Organization.parse(obj.organization);
                training.userRole = UserRole.parse(obj.userRole);
                training.course = Course.parse(obj.course);
                training.participants = setParticipants(obj.participants);

                training.name = obj.name;
                training.date = obj.date;
                training.archived = obj.archived;

                training.insertTime = obj.insertTime;
                training.updateTime = obj.updateTime;
                training.deleted = obj.deleted;

                return training;

            } else {

                return null;

            }

            function setParticipants(array) {
                var participants = array.map(function (item) {
                    return Participant.parse(item);
                });

                return participants;
            }

        };

        // Training.parse = function(obj){
        //     var t = new Training();
        //
        //     t.id = obj.id;
        //     t.date = obj.date;
        //     t.userRoleId = obj.userRoleId;
        //     t.courseId = obj.courseId;
        //     t.createDate = obj.createDate;
        //     t.updateDate = obj.updateDate;
        //
        //     if(obj.participants) {
        //         t.participants = [];
        //         obj.participants.forEach(function(p){
        //             t.participants.push(Participant.parse(p));
        //         })
        //     }
        //
        //     return t;
        // };
        
        return Training;

    });
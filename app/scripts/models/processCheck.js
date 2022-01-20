angular.module('APP')
    .factory('ProcessCheck', function (ResourceService, Frequency, Organization, PrerequisiteType) {

        // function ProcessCheck(prerequisiteType) {
        //     this.prerequisiteType = prerequisiteType;
        //     this.frequency = new Frequency();
        //     this.type = null;
        //     this.name = null;
        //     this.description = null;
        // };
        //
        // ProcessCheck.parse = function(obj){
        //     var a = new ProcessCheck(obj.prerequisiteType);
        //     a.id = obj.id;
        //     a.frequency = Frequency.parse(obj.frequency);
        //     a.type = obj.type;
        //     a.name = obj.name;
        //     a.description = obj.description;
        //     a.createDate = obj.createDate;
        //     return a;
        // }
        //
        // return ProcessCheck;

        function ProcessCheck(obj) {

            if (obj) {

                obj.id ? this.id = obj.id : null;

                obj.frequency ? this.frequency = Frequency(obj.frequency) : null;
                obj.prerequisiteType ? this.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType) : null;

            } else {

                this.frequency = null;
                this.prerequisiteType = null;

            }


            var selectedOrganization = ResourceService.getSelectedOrganization();
            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;

            this.name = null;
            this.description = null;
            this.type = null;
            this.privacy = null;


        }

        ProcessCheck.parse = function (obj) {

            if (obj != null) {

                var processCheck = new ProcessCheck();

                processCheck.id = obj.id;

                processCheck.organization = Organization.parse(obj.organization);
                processCheck.frequency = Frequency.parse(obj.frequency);
                processCheck.prerequisiteType = PrerequisiteType.parse(obj.prerequisiteType);

                processCheck.name = obj.name;
                processCheck.description = obj.description;
                processCheck.type = obj.type;
                processCheck.privacy = obj.privacy;

                processCheck.insertTime = obj.insertTime;
                processCheck.deleted = obj.deleted;

                return processCheck;

            } else {

                return null;

            }

        };

        ProcessCheck.TYPE = {
            CHECKLIST: 'checklist',
            DOCUMENTARY_ANALYSIS: 'documentaryAnalysis',
            LABORATORY_ANALYSIS: 'laboratoryAnalysis'
        };

        return ProcessCheck;

    });
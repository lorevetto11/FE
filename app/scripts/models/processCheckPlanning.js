angular.module('APP')
    .factory('ProcessCheckPlanning', function (Organization, ProcessCheck, ResourceService) {



        // function ProcessCheckPlanning() {
        //     this.company = null;
        //     this.date = new Date();
        //     this.startDate = null;
        //     this.processCheckIds = [];
        //     this.status = ProcessCheckPlanning.STATUS.CREATED;
        // };
        //
        // ProcessCheckPlanning.parse = function(obj){
        //     var a = new ProcessCheckPlanning();
        //     a.id = obj.id;
        //     a.company = obj.company;
        //     a.date = new Date(obj.date);
        //     a.processCheckIds = obj.processCheckIds;
        //     a.status = obj.status;
        //
        //     if(obj.startDate != null) {
        //         a.startDate = new Date(obj.startDate);
        //     }
        //
        //     if(obj.closeDate != null) {
        //         a.closeDate = new Date(obj.closeDate);
        //     }
        //
        //     return a;
        // }
        //
        // return ProcessCheckPlanning;

        function ProcessCheckPlanning(obj) {

            if (obj) {

                obj.id ? this.id = obj.id : null;

                obj.company ? this.company = new Organization(obj.company.id) : null;
                obj.processchecks ? this.processchecks = setProcessCheks(obj.processchecks) : null;

            } else {

                this.company = null;
                this.processchecks = [];

            }

            var selectedOrganization = ResourceService.getSelectedOrganization();
            this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;

            this.status = ProcessCheckPlanning.STATUS.CREATED;
            this.date = new Date();
            this.startDate = null;
            this.closeDate = null;

        }

        ProcessCheckPlanning.parse = function (obj) {

            if (obj != null) {

                var processCheckPlanning = new ProcessCheckPlanning();

                processCheckPlanning.id = obj.id;

                processCheckPlanning.organization = Organization.parse(obj.organization);
                processCheckPlanning.company = Organization.parse(obj.company);
                processCheckPlanning.processchecks = setProcessCheks(obj.processchecks);

                processCheckPlanning.status = obj.status;
                processCheckPlanning.date = new Date(obj.date);
                processCheckPlanning.startDate = obj.date;
                processCheckPlanning.closeDate = obj.date;

                processCheckPlanning.deleted = obj.deleted;

                return processCheckPlanning;

            } else {

                return null;

            }

        };

        ProcessCheckPlanning.STATUS = {
            CREATED: 'created',
            INPROGRESS: 'inprogress',
            CLOSED: 'closed'
        };

        function setProcessCheks(array) {
            var processchecks = [];
            if (array != null) {
                processchecks = array.map(function (item) {
                    return ProcessCheck.parse(item);
                });
            }
            return processchecks;
        }
        
        return ProcessCheckPlanning;

    });
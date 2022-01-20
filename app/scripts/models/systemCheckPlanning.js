angular.module('APP')
.factory('SystemCheckPlanning', function (ResourceService, Organization, SystemCheck) {

    // function SystemCheckPlanning() {
    //     this.company = null;
    //     this.date = new Date();
    //     this.startDate = null;
    //     this.systemCheckIds = [];
    //     this.status = SystemCheckPlanning.STATUS.CREATED;
    // };
    //
    // SystemCheckPlanning.parse = function(obj){
    //     var a = new SystemCheckPlanning();
    //     a.id = obj.id;
    //     a.company = obj.company;
    //     a.date = new Date(obj.date);
    //     a.systemCheckIds = obj.systemCheckIds;
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

    function SystemCheckPlanning(obj) {

        if (obj) {

            obj.id ? this.id = obj.id : null;

            obj.company ? this.company = new Organization(obj.company.id) : null;
            obj.systemchecks ? this.systemchecks = setSystemCheks(obj.systemchecks) : null;

        } else {

            this.company = null;
            this.systemchecks = [];

        }

        var selectedOrganization = ResourceService.getSelectedOrganization();
        this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;

        this.status = SystemCheckPlanning.STATUS.CREATED;
        this.date = new Date();
        this.startDate = null;
        this.closeDate = null;

    }

    SystemCheckPlanning.parse = function (obj) {

        if (obj != null) {

            var systemCheckPlanning = new SystemCheckPlanning();

            systemCheckPlanning.id = obj.id;

            systemCheckPlanning.organization = Organization.parse(obj.organization);
            systemCheckPlanning.company = Organization.parse(obj.company);
            systemCheckPlanning.systemchecks = setSystemCheks(obj.systemchecks);

            systemCheckPlanning.status = obj.status;
            systemCheckPlanning.date = obj.date;
            systemCheckPlanning.startDate = obj.startDate;
            systemCheckPlanning.closeDate = obj.closeDate;

            systemCheckPlanning.deleted = obj.deleted;

            return systemCheckPlanning;

        } else {

            return null;

        }

    };

    SystemCheckPlanning.STATUS = {
        CREATED : 'created',
        INPROGRESS: 'inprogress',
        CLOSED: 'closed'
    };

    function setSystemCheks(array) {
        array = array || [];
        var systemCheks = array.map(function (item) {
            return SystemCheck.parse(item);
        });

        return systemCheks;
    }

    return SystemCheckPlanning;
});
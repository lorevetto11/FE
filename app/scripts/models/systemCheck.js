angular.module('APP')
.factory('SystemCheck', function (Organization, ResourceService) {

    // function SystemCheck() {
    //     this.name = '';
    //     this.requirements = [];
    // };
    //
    // SystemCheck.parse = function(obj){
    //     var a = new SystemCheck();
    //     a.id = obj.id;
    //     a.name = obj.name;
    //     a.createDate = obj.createDate;
    //
    //     return a;
    // }

    function SystemCheck(obj) {

        if (obj) {

            obj.id ? this.id = obj.id : null;

        }

        var selectedOrganization = ResourceService.getSelectedOrganization();
        this.organization = selectedOrganization ? new Organization(selectedOrganization.id) : null;

        this.name = null;
        this.description = null;
        this.privacy = null;
        
    }

    SystemCheck.parse = function (obj) {

        if (obj != null) {

            var systemCheck = new SystemCheck();

            systemCheck.id = obj.id;

            systemCheck.organization = Organization.parse(obj.organization);

            systemCheck.name = obj.name;
            systemCheck.description = obj.description;
            systemCheck.privacy = obj.privacy;

            systemCheck.deleted = obj.deleted;

            return systemCheck;

        } else {

            return null;

        }

    };

    return SystemCheck;

});
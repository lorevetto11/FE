angular.module('APP')
.factory('SystemCheckRequirement', function (SystemCheck) {

    // function SystemCheckRequirement(checkId) {
    //     this.systemCheckId = checkId;
    //     this.name = '';
    // };
    //
    // SystemCheckRequirement.parse = function(obj){
    //     var a = new SystemCheckRequirement(obj.systemCheckId);
    //     a.id = obj.id;
    //     a.name = obj.name;
    //     return a;
    // }

    function SystemCheckRequirement(obj) {

        if (obj) {

            obj.id ? this.id = obj.id : null;

            obj.systemCheck ? this.systemCheck = new SystemCheck(obj.systemCheck) : null;

        } else {

            this.systemCheck = null;

        }

        this.name = null;
        this.description = null;

    }

    SystemCheckRequirement.parse = function (obj) {

        if (obj != null) {

            var systemCheckRequirement = new SystemCheckRequirement(obj);

            systemCheckRequirement.id = obj.id;

            systemCheckRequirement.systemCheck = SystemCheck.parse(obj.systemCheck);

            systemCheckRequirement.name = obj.name;
            systemCheckRequirement.description = obj.description;

            systemCheckRequirement.deleted = obj.deleted;

            return systemCheckRequirement;

        } else {

            return null;

        }

    };

    return SystemCheckRequirement;

});
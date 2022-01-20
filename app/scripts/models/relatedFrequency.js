angular.module('APP')
.factory('RelatedFrequency', function (Frequency, Organization, RiskClass, PrerequisiteType) {


    function RelatedFrequency(prerequisiteType) {

        this.prerequisiteType = prerequisiteType ? prerequisiteType : null;

        this.frequencies = [];

    }

    RelatedFrequency.parse = function(obj){

        // var f = new RelatedFrequency(obj.prerequisiteType);
        // f.id = obj.id;
        //
        // if(obj.frequencies) {
        //     obj.frequencies.forEach(function(freq){
        //         f.frequencies.push({
        //             riskClass: freq.riskClass,
        //             frequency: Frequency.parse(freq.frequency)
        //         });
        //     });
        // }
        // return f;
        
    };

    return RelatedFrequency;

});
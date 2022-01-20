angular.module('APP')
    .factory('Chart', function () {

        function Chart() {
            this.name = "New chart";
        };

        Chart.parse = function(obj){
            var f = new Chart();

            f.id = obj.id;
            f.name = obj.name;
            f.order = obj.order;

            return f;
        };

        Chart.objectName = 'chart';

        Chart.prototype = {

        };

        return Chart;
    });
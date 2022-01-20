
angular.module('APP')
  .controller('DateTimePickerCtrl', function ($scope, $state, $translate, $q) {
    
    $scope.hours = null;
    $scope.minutes = [0, 30];

    $scope.hour = null;
    $scope.minute = $scope.minutes[0];

    $scope.onChangeHour = function() {
        if($scope.date != null)
        {
            $scope.date.setHours($scope.hour);
            $scope.timestamp = $scope.date.getTime();
        }
    };

    $scope.onChangeMinute = function() {
        if($scope.date != null)
        {
            $scope.date.setMinutes($scope.minute);
            $scope.timestamp = $scope.date.getTime();
        }
    };

    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        minDate: new Date(),
        showWeeks: false
    };

    $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 2);
    $scope.events =
        [
            {
                date: tomorrow,
                status: 'full'
            },
            {
                date: afterTomorrow,
                status: 'partially'
            }
        ];

    $scope.getDayClass = function(date, mode) {
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0,0,0,0);

            for (var i=0;i<$scope.events.length;i++){
                var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    };

    function init() {        
        if ($scope.timestamp != null)
        {
            $scope.date = new Date($scope.timestamp);
               
            $scope.hour = $scope.date.getHours();
            $scope.minute = $scope.date.getMinutes();
       
            $scope.$watch('date', function(newValue, oldValue) {
                //console.log("Watch DATE: ", newValue);

                if (newValue != null) {
                    $scope.timestamp = newValue.getTime();
                }
            });
        }
        var hours = [];
        for(var i = 1; i <= 24 ; ++i) {
          hours.push(i);
        }
       
        $scope.hours = hours;
    }

    init();
});
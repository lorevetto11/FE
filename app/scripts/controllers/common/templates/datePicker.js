
angular.module('APP')
  .controller('DatePickerCtrl', function ($scope, $state, $translate, $q, $controller) {
   
//    $scope.isRequired = true;
    
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
        minDate: $scope.minDate,
        maxDate: $scope.maxDate,
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
    
    $scope.onDatePickerChange = function() {
        onDatePickerChange();
      };
      
    $scope.$watch('isValid',setValidity);

    function onDatePickerChange() {
        $scope.onChange({datePickerValue: $scope.date});
    };

    function setValidity(value) {
        if (!angular.isUndefined($scope.datePickerForm) && !angular.isUndefined(value)) {
            $scope.datePickerForm.date.$setValidity('isValid', value);
//            $scope.datePickerForm.date.$setDirty();
        }
    } ;
    
});
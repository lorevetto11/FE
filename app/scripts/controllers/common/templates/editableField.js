
angular.module('APP')
  .controller('EditableFieldCtrl', function ($scope, $state, $translate, $q) {
    
  	$scope.mode = 'view'; // 'view' || 'edit'

    $scope.edit = function()
    {   
        $scope.mode = 'edit';
    };

    $scope.save = function(val)
    {
        $scope.value = val;

        if($scope.value != null && $scope.value.length > 0)
            $scope.mode = 'view';
    }

    function init() {
        if($scope.value == null || $scope.value.length == 0)
            $scope.mode = 'edit';
    }


    init();
});
'use strict';

angular.module('APP')
    .controller('ProfileCtrl', function ($scope, $state, $stateParams, $translate, $q, $uibModal, currentUser, currentOrganization, ModalService, APIService, notify) {


        $scope.currentUser = currentUser;

        $scope.oldPassword = null;
        $scope.newPassword = null;
        $scope.confirmNewPassword = null;
        $scope.showPassword = false;

        $scope.checkPassword = function(value) {
            return value == $scope.newPassword;
        };

        $scope.changePassword = function(){

            if ($scope.newPassword && $scope.newPassword == $scope.confirmNewPassword) {
               APIService.changePassword(currentUser.id, $scope.oldPassword, $scope.newPassword).then(
                   function successCallback(){
                       $scope.showPassword = false;
                       notify.logSuccess("Ok!", $translate.instant('user.profile.changePassword.success'));
                   }
               );

            }

        };

        function init() {

        }
        init();
    });

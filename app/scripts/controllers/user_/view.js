'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
        .controller('UserViewCtrl', function ($scope, $state, $stateParams, $translate, $q, $uibModal, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, ENV) {

            var orderId = $stateParams.orderId;
            var originalItem;

            $scope.currentUser = currentUser;
            $scope.item = null;

            $scope.editMode = false;
            $scope.labelTypes = null;// ResourceService.getLabelTypes();
            $scope.quantityOptions = [0,20,40,100,200,500,1000,2000,5000];

            $scope.view = function(item) {
                $state.go('order.view', {'orderId':item.id});
            };

            $scope.delete = function(orderItem)
            {
                var idx = $scope.item.orderItems.indexOf(orderItem);

                if(idx != -1) {
                    $scope.item.orderItems.splice(idx,1);
                }
            };

            $scope.add = function()
            {
                $scope.item.orderItems.push({
                    "labelType" : $scope.labelTypes[0],
                    "quantity" : 0
                })
            };

            function init() {
                if (orderId) {
                    APIService.getOrderById(orderId).then(
                        function successCallback(data) {
                            $scope.item = angular.copy(data);
                            originalItem = data;
                            $scope.editMode = data.status == 'VALID';
                        },
                        function errorCallback() {
                            notify.logError($translate.instant("order-load-error"));
                        });
                }
            }
            init();
        });

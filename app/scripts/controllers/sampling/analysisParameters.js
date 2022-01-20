'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
	.controller('AnalysisParametersCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
	                                                AnalysisParameter, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, ValidationService, PermissionService) {
		
		$scope.items = null;
		$scope.userRoles = null;
		
		$scope.loading = null;
		$scope.filter = {};
		
		$scope.selectedOrganization = ResourceService.getSelectedOrganization();
		
		$scope.$on('resourceChange', function () {
			
			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}
			
		});
		
		$scope.add = function () {
			$scope.selectedItem = new AnalysisParameter();
		};
		
		$scope.edit = function (item) {
			$scope.selectedItem = angular.copy(item);
		};
		
		$scope.cancel = function () {
			$scope.selectedItem = null
		};
		
		$scope.delete = function (item) {
			
			ModalService.dialogConfirm('Delete', 'Analysis parameter <strong>' + item.name + '</strong> will be deleted. I proceed? ',
				function onConfirmAction() {
					
					$log.info("Deleting analysis parameter: %O", item);
					$scope.selectedItem = null;
					return APIService.deleteAnalysisParameter(item.id);
					
				}
			).then(init);
			
		};
		
		$scope.clone = function (item) {
			var clone = angular.copy(item);
			clone.id = null;
			clone.title = 'copy of - ' + clone.title;
			$scope.selectedItem = clone;
		};
		
		$scope.save = function (item, form) {
			
			if (form.$invalid) {
				ValidationService.dirtyForm(form);
				return false;
			}
			
			if (item.id == null) {
				
				$log.info("Creating analysis parameter: %O", item);
				APIService.createAnalysisParameter(item).then(
					function success(item) {
						
						$scope.selectedItem = item;
						notify.logSuccess('Success', 'new Parameter successfully created');
						init();
						
					}, savingError);
				
			} else {
				
				$log.info("Updating analysis parameter: %O", item);
				APIService.updateAnalysisParameter(item).then(
					function success(item) {
						
						$scope.selectedItem = item;
						notify.logSuccess('Success', 'Parameter successfully updated');
						init();
						
					}, savingError);
				
			}
			
		};
		
		function savingError() {
			$scope.loader = false;
			$scope.errorMessage = "Saving data error!";
		}
		
		$scope.itemsFilter = function (item) {
			
			var result = true;
			
			if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
				var keyword = $scope.filter.keyword.toLowerCase();
				result &= (item.name && item.name.toLowerCase().indexOf(keyword) != -1);
			}
			
			return result;
			
		};
		
		$scope.isValid = function (item) {
			return true;
		};
		
		function init() {
			
			if (!$scope.selectedOrganization) {
				return;
			}
			
			$scope.loading = true;
			
			APIService.getAnalysisParametersByOrganizationId($scope.selectedOrganization.id).then(
				function successCallback(data) {
					
					$log.info("Analysis parameters: %O", data);
					$scope.items = data;
					
					APIService.getRolesByOrganizationId($scope.selectedOrganization.id).then(
						function success(data) {
							
							$log.info("Roles: %O", data);
							$scope.userRoles = data;
							
							$scope.loading = false;
							
						});
					
				});
			
		}
		
		init();
		
	});

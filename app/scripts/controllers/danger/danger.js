'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
	.controller('DangerCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $timeout,
	                                    Danger, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, ValidationService, notify) {

		$scope.items = null;
		$scope.materialCategories = null;
		$scope.materials = null;
		
		$scope.filter = {};
		$scope.types = [Danger.TYPE.BIOLOGICAL, Danger.TYPE.CHEMICAL, Danger.TYPE.PHYSICAL, Danger.TYPE.ALLERGENS];
		
		$scope.loading = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		$scope.add = function () {
			$scope.selectedItem = new Danger();
			console.log($scope.selectedItem)
		};

		$scope.edit = function (item) {
			$scope.selectedItem = null;

			$timeout(function(){
				$scope.selectedItem = angular.copy(item);
			},1);

		};

		$scope.cancel = function () {
			$scope.selectedItem = null
		};

		$scope.delete = function (item) {
			ModalService.dialogConfirm('Delete', 'Danger <strong>' + item.name + '</strong> will be deleted. I proceed? ',
				function onConfirmAction() {

					$log.info("Deleting danger: %O", item);
					$scope.selectedItem = null;
					return APIService.deleteDanger(item.id);

				}
			).then(init);

		};

		$scope.clone = function (item) {

			var clone = angular.copy(item);
			clone.id = null;
			clone.name = 'copy of - ' + clone.name;
			$scope.selectedItem = clone;

		};

		$scope.save = function (item, form) {

			if (form.$invalid) {
				ValidationService.dirtyForm(form);
				return false;
			}

			if (item.id == null) {

				$log.info("Creating danger: %O", item);
				APIService.createDanger(item).then(
					function success(item) {

						$scope.selectedItem = item;
						notify.logSuccess('Success', 'new danger successfully created');
						init();

					}, savingError);

			} else {

				$log.info("Updating danger: %O", item);
				APIService.updateDanger(item).then(
					function success(item) {

						$scope.selectedItem = item;
						notify.logSuccess('Success', 'systemCheck successfully updated');
						init();

					}, savingError);

			}

		};

		function savingError() {

			$scope.loader = false;
			$scope.errorMessage = "Saving data error!";

		}

		$scope.hasMaterial = function (material) {
			var result = false;

			if ($scope.selectedItem.materials.length > 0) {
				$scope.selectedItem.materials.forEach(function (m) {
					if (m.id == material.id) {
						result = true;
					}
				});
			}

			return result;
		};

		$scope.addMaterial = function (material) {
			$scope.selectedItem.materials.push(material);
		};

		$scope.removeMaterial = function (material) {
			var materials = $scope.selectedItem.materials;
			for (var n = 0; n < materials.length; n++){
				if(materials[n].id == material.id){
					$scope.selectedItem.materials.splice(n, 1);
				}
			}
		};

		$scope.itemsFilter = function (item) {

			var result = true;

			if ($scope.filter.type) {
				result &= (item.type == $scope.filter.type);
			}

			if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
				var keyword = $scope.filter.keyword.toLowerCase();
				result &= (item.name && item.name.toLowerCase().indexOf(keyword) != -1);
			}

			return result;

		};

		$scope.materialFilter = function (item, materialCategory) {

			var result = true;

			if ($scope.filter.type) {
				result &= (item.type == $scope.filter.type);
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

			APIService.getDangersByOrganizationId($scope.selectedOrganization.id).then(
				function success(data) {

					$log.info("Dangers: %O", data);
					$scope.items = data;

					APIService.getMaterialCategoriesByOrganizationId($scope.selectedOrganization.id).then(
						function success(data) {

							$log.info("MaterialCategories: %O", data);
							$scope.materialCategories = data;

							APIService.getMaterialsByOrganizationId($scope.selectedOrganization.id).then(
								function success(data) {

									$log.info("Materials: %O", data);
									$scope.materials = data;


									$scope.loading = false;

								});

						});

				});

		}

		init();

	});

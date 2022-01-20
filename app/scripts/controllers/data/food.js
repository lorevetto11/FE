'use strict';

angular.module('APP')
	.controller('FoodCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $document, $window,
	                                  PackagingMaterial,
	                                  ModalService, APIService, ResourceService, StorageService, ValidationService, notify, UtilsService, PermissionService) {

		$scope.items = null;
		$scope.materialCategories = null;
		$scope.suppliers = null;
		
		$scope.selectedItem = null;

		$scope.filter = {};

		$scope.selectedOrganization = null;
		$scope.loading = null;

		$scope.types = PackagingMaterial.TYPES;

		$scope.add = function () {
			$scope.selectedItem = new PackagingMaterial();
			$scope.selectedItem.type = $scope.types.FOOD;
		};

		$scope.edit = function (item) {
			$scope.selectedItem = angular.copy(item);
		};

		$scope.cancel = function () {
			$scope.selectedItem = null
		};

		$scope.delete = function (item) {

			ModalService.dialogConfirm("alertMessage.delete", '' + $translate.instant("entity.material") + ' <strong>' + item.name + '</strong>  ' + $translate.instant("alertMessage.willBeDeleted"),
				function onConfirmAction() {

					$scope.loading = true;

					return APIService.deleteMaterial(item.id).then(function success() {

					}, savingError);

				}).then(init);

		};


		$scope.save = function (item, form) {

			if (form.$invalid) {
				ValidationService.dirtyForm(form);
				return false;
			}

			$scope.loading = true;

			if (item.id == null) {

				APIService.createMaterial(item).then(
					function success(item) {

						$scope.selectedItem = item;
						notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.typeCreated'));
						init();

					}, savingError);


			} else {

				APIService.updateMaterial(item).then(
					function success(item) {

								$scope.selectedItem = item;
								notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.typeUpdated'));
								init();

					}, savingError);

			}

		};

		$scope.isValid = function (item) {
			return item != null &&
				item.name != null
		};

		$scope.itemsFilter = function (item) {

			var result = true;

			if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
				var keyword = $scope.filter.keyword.toLowerCase();

				result &= (item.name && item.name.toLowerCase().indexOf(keyword) != -1) ||
					(item.description && item.description.toLowerCase().indexOf(keyword) != -1);
			}

			if ($scope.filter.materialCategory && item.materialCategory) {
				result &= item.materialCategory.id == $scope.filter.materialCategory.id;
			}

			return result;

		};

		function savingError() {
			$scope.loading = false;
			$scope.errorMessage = $translate.instant('notify.savingDataError');
		}


		function init() {

			$scope.selectedOrganization = ResourceService.getSelectedOrganization();
			if ($scope.selectedOrganization == null) {
				return;
			}

			$scope.loading = true;

			APIService.getMaterialsByOrganizationId($scope.selectedOrganization.id).then(
				function successCallback(data) {

					$scope.items = data.filter(function (material) {
						return material.type === $scope.types.FOOD;
					});

					$log.info("Materials: %O", $scope.items);

					APIService.getMaterialCategoriesByOrganizationId($scope.selectedOrganization.id).then(
						function (data) {

							$scope.materialCategories = data.filter(function (category) {
								return category.type === $scope.types.FOOD;
							});
							$log.info("Categories: %O", $scope.items);

							APIService.getSuppliersByOrganizationId($scope.selectedOrganization.id).then(
								function (data) {

									$log.info("Suppliers: %O", $scope.items);
									$scope.suppliers = data;

									$scope.loading = false;

								}, savingError)

						}, savingError)

				}, savingError);

		}

		init();

	});

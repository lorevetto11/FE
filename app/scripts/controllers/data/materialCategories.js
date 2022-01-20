'use strict';

angular.module('APP')
	.controller('MaterialCategoriesCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $document, $window,
	                                                MaterialCategory,
	                                                ModalService, APIService, ResourceService, StorageService, ValidationService, notify, UtilsService, PermissionService) {

		$scope.items = null;
		$scope.selectedItem = null;

		$scope.filter = {};

		$scope.selectedOrganization = null;
		$scope.loading = null;

		$scope.types = MaterialCategory.TYPES;

		$scope.add = function () {
			$scope.selectedItem = new MaterialCategory();
		};

		$scope.edit = function (item) {
			$scope.selectedItem = angular.copy(item);
		};

		$scope.cancel = function () {
			$scope.selectedItem = null
		};

		$scope.delete = function (item) {

			ModalService.dialogConfirm("alertMessage.delete", '' + $translate.instant("entity.materialCategory") + ' <strong>' + item.name + '</strong>  ' + $translate.instant("alertMessage.willBeDeleted"),
				function onConfirmAction() {

					$scope.loading = true;

					return APIService.deleteMaterialCategory(item.id).then(function success() {
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

				APIService.createMaterialCategory(item).then(
					function success(item) {

						$scope.selectedItem = item;
						notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.typeCreated'));
						init();

					}, savingError);

			} else {
				
				APIService.updateMaterialCategory(item).then(
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

			if ($scope.filter.type && item.type) {
				result &= item.type == $scope.filter.type;
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

			APIService.getMaterialCategoriesByOrganizationId($scope.selectedOrganization.id).then(
				function (data) {

					$log.info("Categories: %O", $scope.items);
					$scope.items = data;

					$scope.loading = false;

				}, savingError);

		}

		init();

	});

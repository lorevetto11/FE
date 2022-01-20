'use strict';

angular.module('APP')
	.controller('SupplierHomeCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $filter, $timeout, UtilsService,
	                                      Supplier, ValidationService, currentUser, currentOrganization, ModalService, APIService, ResourceService) {

		$scope.items = null;
		$scope.selectedItem = null;

		$scope.organizations = null;
		$scope.kinshipLevels = null;

		$scope.filter = {
			keyword: null
		};

		$scope.pattern = ValidationService.PATTERN;

		$scope.loading = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		var changedSelectedOrganization = ResourceService.getSelectedOrganization();
		if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
			$scope.selectedOrganization = changedSelectedOrganization;
			init();
		}

		$scope.add = function () {

			$scope.selectedItem = new Supplier();

		};

		$scope.edit = function (item) {

			$scope.selectedItem = angular.copy(item);

		};

		$scope.cancel = function () {

			$scope.selectedItem = null;

		};

		$scope.delete = function (item) {

			ModalService.dialogConfirm("alertMessage.delete", '"entity.supplier" <strong> ' + item.name + '</strong> "alertMessage.willBeDeleted"',
				function onConfirmAction() {

					return APIService.deleteSupplier(item.id);

				}
			).then(init);

		};

		$scope.save = function (item, form) {

			if (form.$invalid) {
				ValidationService.dirtyForm(form);
				return false;
			}

			if (item.id == null) {

				createSupplier(item);

			} else {

				updateSupplier(item);

			}

			function createSupplier(item) {

				APIService.createSupplier(item).then(
					function success(item) {

						init();
						$scope.selectedItem = item;

					}, savingError);

			}

			function updateSupplier(item) {

				APIService.updateSupplier(item).then(
					function success(item) {

						init();
						$scope.selectedItem = item;

					}, savingError);

			}

		};

		$scope.itemsFilter = function (item) {

			var result = true;

			if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
				var name = (item.name || '') + ' ' + (item.description || '');
				result &= (name.toLowerCase().indexOf($scope.filter.keyword.toLowerCase()) != -1);
			}

			return result;
		};

		function savingError() {
			$scope.loading = false;
			$scope.errorMessage = $translate.instant('notify.savingDataError');
		}

		function init() {

			if (!$scope.selectedOrganization) {
				return;
			}

			$scope.loading = true;

			APIService.getSuppliersByOrganizationId($scope.selectedOrganization.id).then(
				function successCallback(data) {

					$log.info("Suppliers: %O", data);
					$scope.items = data;

					APIService.getOrganizations($scope.selectedOrganization.id).then(
						function successCallback(data){

							$log.info("Organizations: %O", data);
							$scope.organizations = UtilsService.organizationOrderTree(data);

							setTimeout(function () {
								$scope.kinshipLevels = UtilsService.organizationBuildKinshipLevel($scope.organizations);
							}, 0);

							$scope.loading = false;

						}, savingError);

				}, savingError);

		}

		init();

	});

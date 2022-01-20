'use strict';

angular.module('APP')
	.controller('AirConditioningType', function ($scope, $state, $translate, $q, $uibModal, $log, $document, $window,
	                                             currentUser, currentOrganization, Shape, AirConditioningType, RelatedFrequency, ModalService, APIService, ResourceService, StorageService, ValidationService, notify, UtilsService, PermissionService) {

		$scope.items = null;
		$scope.selectedItem = null;

		$scope.filter = {};

		$scope.selectedOrganization = null;
		$scope.loading = null;

		$scope.shapeTypes = [
			{
				name: "Rectangle",
				value: Shape.RECTANGLE
			},
			{
				name: "Circle",
				value: Shape.CIRCLE
			}
		];

		$scope.add = function () {
			$scope.selectedItem = new AirConditioningType();
			$scope.selectedItem.shape = new Shape(Shape.RECTANGLE);
		};

		$scope.edit = function (item) {
			$scope.selectedItem = angular.copy(item);
		};

		$scope.cancel = function () {
			$scope.selectedItem = null
		};

		$scope.delete = function (item) {

			ModalService.dialogConfirm("alertMessage.delete", ' "entity.type" <strong>' + item.name + '</strong> "alertMessage.willBeDeleted"',
				function onConfirmAction() {

					$scope.loading = true;

					return APIService.deleteAirConditioningType(item.id).then(function success() {
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

				APIService.createShape(item.shape).then(
					function success(data) {

						item.shape = data;

						APIService.createAirConditioningType(item).then(
							function success(item) {

								$scope.selectedItem = item;
								notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.typeCreated'));
								init();

							}, savingError);

					}, savingError);
				
			} else {
				
				APIService.updateShape(item.shape).then(
					function success() {

						APIService.updateAirConditioningType(item).then(
							function success(item) {

								$scope.selectedItem = item;
								notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.typeUpdated'));
								init();

							}, savingError);


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


			APIService.getAirConditioningTypesByOrganizationId($scope.selectedOrganization.id).then(
				function successCallback(data) {

					$log.info("Types: %O", data);
					$scope.items = data;

					$scope.loading = false;

				}, savingError);

		}

		init();

	});

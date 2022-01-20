'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
	.controller('AnalysisParameterValuesCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $timeout, $filter, PrerequisiteType, AnalysisParameterValue,
	                                                     currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

		$scope.items = null;
		$scope.values = null;
		$scope.parameters = null;
		$scope.prerequisites = null;
		$scope.prerequisiteTypes = null;
		$scope.filter = {};

		$scope.loading = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		$scope.getLabels = function (values) {
			if (values) {
				return values.map(function (v) {
					return $filter('date')(v.date, 'dd/MM/yyyy');
				});
			}
		};

		$scope.getData = function (values) {
			if (values) {
				return [values.map(function (v) {
					return v.value;
				})];
			}
		};


		$scope.add = function (parameter) {
			var analysisParameterValue = new AnalysisParameterValue();
			analysisParameterValue.analysisParameter = $scope.selectedItem;
			$scope.save(analysisParameterValue);
		};

		$scope.edit = function (item) {
			$scope.selectedItem = angular.copy(item);
			loadValues($scope.selectedItem);
		};

		$scope.cancel = function () {
			$scope.selectedItem = null
		};

		$scope.delete = function (item) {

			$log.info("Deleting analysis parameter value: %O", item);
			APIService.deleteAnalysisParameterValue(item.id).then(
				function success(){
					loadValues($scope.selectedItem);
				});

		};

		$scope.clone = function (item) {
			var clone = angular.copy(item);
			clone.id = null;
			$scope.save(clone);
		};

		$scope.save = function (item) {

			$timeout(function () {

				if (item.id == null) {

					delete item.prerequisiteType;
					$log.info("Creating analysis parameter value: %O", item);
					APIService.createAnalysisParameterValue(item).then(
						function success(item) {

							notify.logSuccess('Success', 'new procedure successfully created');
							loadValues($scope.selectedItem);

						}, savingError);

				} else {

					delete item.prerequisiteType;
					$log.info("Updating analysis parameter value: %O", item);
					APIService.updateAnalysisParameterValue(item).then(
						function success(item) {

							notify.logSuccess('Success', 'procedure successfully updated');
							loadValues($scope.selectedItem);

						}, savingError);

				}

			}, 200);

		};

		function savingError() {
			$scope.loader = false;
			$scope.errorMessage = "Saving data error!";
			$log.error("Saving data error!");
		}

		$scope.itemsFilter = function (item) {
			return true;
		};

		$scope.isValid = function (item) {
			return true;
		};


		function loadValues(item) {

			APIService.getAnalysisParameterValuesByAnalysisParameterId(item.id).then(
				function successCallback(data) {

					$log.info("Analysis parameter values: %O", data);
					$scope.items = data.sort(function (a, b) {
						return a.date - b.date;
					});

					$scope.items = $scope.items.map(function(value){

						if (value.context){

							var prerequisite = $scope.prerequisites.find(function(prerequisite){

								return prerequisite.context ? prerequisite.context.id == value.context.id : null;

							});

							if (prerequisite) {

								value.prerequisiteType = prerequisite.prerequisiteType.name;

							}

						}


						return value;

					});

					$scope.applyPrerequisiteFilter();

				});

		}

		$scope.applyPrerequisiteFilter = function () {

			if ($scope.selectedItem && $scope.items) {

				$scope.values = $scope.items.filter(function (i) {

					return i.analysisParameter.id == $scope.selectedItem.id &&
						( $scope.filter.prerequisite == null ||
							( $scope.filter.prerequisite.context == null ||
								( i.context == null ||
									( $scope.filter.prerequisite.context.id == i.context.id
							// && $scope.filter.prerequisite.type == i.prerequisiteType // Don't need it
						))));

				})

			}

		};

		function init() {

			if (!$scope.selectedOrganization) {
				return;
			}

			$scope.loading = true;

			$scope.$watch('selectedItem', function (value) {
				if (value && $scope.items) {
					$scope.values = $scope.items.filter(function (i) {
						return i.analysisParameter.id == value.id;
					})
				}
			});

			APIService.getAllPrerequisitesByOrganizationId($scope.selectedOrganization.id).then(
				function success(data) {

					$log.info("Prerequisites: %O", data);
					$scope.prerequisites = data;

					$scope.prerequisiteTypes = PrerequisiteType.TYPES.filter(function (t) {
						return $scope.prerequisites.find(function (p) {
								return p.prerequisiteType.name == t;
							}) != null;
					});
					$log.info("PrerequisiteTypes: %O", $scope.prerequisiteTypes);

					APIService.getAnalysisParametersByOrganizationId($scope.selectedOrganization.id).then(
						function successCallback(data) {

							$log.info("Analysis parameters: %O", data);
							$scope.parameters = data;

							$scope.loading = false;

						});

				});

		}

		init();

	});

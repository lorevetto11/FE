'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
	.controller('NoncomplianceCtrl', function ($rootScope, $scope, $state, $translate, $q, $uibModal, $log, $timeout, $filter, ProcessCheckPlanning,
	                                           PrerequisiteType, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

		$scope.items = null;
		$scope.prerequisites = null;
		$scope.count = {};
		$scope.loading = null;
		$scope.diagrams = null;
		$scope.entities = null;

		var filter = ResourceService.getFilter() || {};
		$scope.filter = filter.nonCompliance || {};
		$scope.filteredItems = [];

		$scope.filterTypes = [
			{
				name: "prerequisite",
				value: "prerequisite"
			}, {
				name: "systemCheck",
				value: "systemCheck"
			}, {
				name: "processCheck",
				value: "processCheck"
			}
		];
		
		$scope.filterStatuses = [
			{
				name: 'open',
				value: false
			}, {
				name: "closed",
				value: true
			}
		];

		$scope.currentPage = 0;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		$scope.onPageChanged = function (page) {
			$scope.currentPage = page;
		};

		$scope.add = function () {
			showDetailModal(null);
		};

		$scope.edit = function (item) {
			showDetailModal(item);
		};

		$scope.view = function (item) {
			showDetailModal(item);
		};

		$scope.setFilter = function () {

			filter.nonCompliance = $scope.filter;

			ResourceService.setFilter(filter);

			$rootScope.$broadcast('filtersChanged');

		};

		$scope.changeType = function () {

			if ($scope.filter.type == null) {
				$scope.filter.type = null;
			} else if ($scope.filter.type == "prerequisite") {
				$scope.filter.type = "prerequisite";
			} else if ($scope.filter.type == "systemCheck") {
				$scope.filter.type = "systemCheck";
			} else if ($scope.filter.type == "processCheck") {
				$scope.filter.type = "processCheck";
			}

			$scope.setFilter();

		};

		$scope.changeStatus = function () {

			if ($scope.filter.status == null) {
				$scope.filter.status = null;
			} else if ($scope.filter.status == true) {
				$scope.filter.status = true;
			} else if ($scope.filter.status == false) {
				$scope.filter.status = false;
			}

			$scope.setFilter();

		};

		$scope.getSubject = function (item) {

			if (item) {

				if (item.systemCheckRequirement && item.systemCheckRequirement.id != null) {

					var requirement = $scope.systemCheckRequirements.find(function (r) {
						return r.id == item.systemCheckRequirement.id;
					});

					if (requirement) {

						var check = $scope.systemChecks.find(function (c) {
							return c.id == requirement.systemCheck.id;
						});

						return '[' + check.name + '] <br/>' + requirement.name;

					}

				} else if (item.processCheck && item.processCheck.id != null) {

					var processCheck = $scope.processChecks.find(function (p) {
						return p.id == item.processCheck.id;
					});

					if (processCheck) {
						return '[' + processCheck.prerequisiteType.name + '] <br/>' + processCheck.name;
					}

				} else if (item.context && item.context.id != null) {

					var prerequisite = $scope.prerequisites.find(function (p) {
						if (p.context && p.context.id) {
							return p.context.id == item.context.id; //&& p.prerequisiteType.name == item.context.className.replace(/Bean/i,'');
						}
					});

					if (prerequisite) {
						
						if (item.context && item.context.className === "FlowElement") {
							return '[' + prerequisite.type + '] ' + prerequisite.name;
						} else {
							return '[' + prerequisite.prerequisiteType.name + '] <br/>' + prerequisite.name;
						}

					}

				}

			}

		};

		function showDetailModal(item) {

			var modalInstance = $uibModal.open({
				templateUrl: 'views/noncompliance/templates/noncompliance.detail.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					processCheck: function () {
						return null;
					},
					systemCheckRequirement: function () {
						return null;
					},
					noncompliance: function () {
						return item;
					},
					editMode: function () {
						return !item || !item.closeDate;
					},
					prerequisites: function () {
						return $scope.prerequisites;
					}
				},
				controller: 'NoncomplianceDetailCtrl'
			});

			modalInstance.result.then(
				function confirm() {
					$scope.$emit('Noncompliance-update');
				}, function dismiss() {

				}
			);
		}

		$scope.$on('Noncompliance-update', function () {

			$log.info('Noncompliance-update');

			APIService.getNoncompliancesByOrganizationId($scope.selectedOrganization.id).then(
				function (data) {

					$scope.items = data;

					$scope.count.closed = data.filter(function (n) {
						return n.closeDate != null;
					}).length;

					$scope.count.opened = data.filter(function (n) {
						return n.closeDate == null;
					}).length;

				});

		});

		$scope.itemsFilter = function (item) {

			var result = true;

			if ($scope.filter.type != null) {
				if ($scope.filter.type == 'prerequisite') {
					result &= item.context != null;
				} else if ($scope.filter.type == 'systemCheck') {
					result &= item.systemCheckRequirement != null;
				} else if ($scope.filter.type == 'processCheck') {
					result &= item.processCheck != null;
				}
			}

			if ($scope.filter.status != null) {
				if ($scope.filter.status) {
					result &= item.closeDate;
				} else {
					result &= !item.closeDate;
				}
			}

			var originalItem = $scope.filteredItems.find(function (oItem) {
				return oItem.id == item.id;
			});

			if (result) {

				if (!originalItem) {

					$scope.filteredItems.push(item);

				}

			} else {

				if (originalItem) {

					var index = $scope.filteredItems.indexOf(originalItem);

					$scope.filteredItems.splice(index, 1);

				}

			}

			return result;

		};

		function savingError() {
			$scope.loading = false;
			$scope.errorMessage = "Saving data error!";
		}

		function init() {

			if (!$scope.selectedOrganization) {
				return;
			}

			$scope.loading = true;

			APIService.getNoncompliancesByOrganizationId($scope.selectedOrganization.id).then(
				function success(data) {

					$scope.items = data;
					$log.info("NonCompliances: %O", $scope.items);

					var items = $scope.items.filter(function (item) {
						return item.context != null;
					});

					// extract unique contextIds and fetch relate prerequisites
					var contexts = $filter('unique')(items.map(function(nonCompliance){ return nonCompliance.context; }), 'id');

					APIService.recursiveCall(contexts, APIService.getPrerequisiteByContext).then(
						function success(data) {

							$scope.prerequisites = data;
							$log.info("Prerequisites: %O", data);

							APIService.getSystemChecksByOrganizationId($scope.selectedOrganization.id).then(
								function successCallback(data) {

									$scope.systemChecks = data;
									$log.info("System checks: %O", data);

									var systemCheckIds = $scope.systemChecks.map(function (systemCheck) {
										return systemCheck.id;
									});

									APIService.recursiveCall(systemCheckIds, APIService.getSystemCheckRequirementsBySystemCheckId).then(
										function success(data) {

											$scope.systemCheckRequirements = data;
											$log.info("System check requirements: %O", data);

											APIService.getProcessChecksByOrganizationId($scope.selectedOrganization.id).then(
												function successCallback(data) {

													$scope.processChecks = data;
													$log.info("Process checks: %O", data);

													$scope.loading = false;

												}, savingError );

										}, savingError );

								}, savingError );

						}, savingError );

				},savingError );

			// $scope.selectedOrganization = ResourceService.getSelectedOrganization();
			// if ($scope.selectedOrganization == null) {
			// 	return;
			// }
			//
			// $scope.loading = true;
			//
			// APIService.getSystemChecksByOrganizationId($scope.selectedOrganization.id).then(
			// 	function successCallback(data) {
			//
			// 		$scope.systemChecks = data;
			// 		$log.info("System checks: %O", data);
			//
			// 		var systemCheckIds = $scope.systemChecks.map(function (systemCheck) {
			// 			return systemCheck.id;
			// 		});
			//
			// 		APIService.recursiveCall(systemCheckIds, APIService.getSystemCheckRequirementsBySystemCheckId).then(
			// 			function success(data) {
			//
			// 				$scope.systemCheckRequirements = data;
			// 				$log.info("System check requirements: %O", data);
			//
			// 				APIService.getProcessChecksByOrganizationId($scope.selectedOrganization.id).then(
			// 					function successCallback(data) {
			//
			// 						$scope.processChecks = data;
			// 						$log.info("Process checks: %O", data);
			//
			// 						APIService.getAllPrerequisitesByOrganizationId($scope.selectedOrganization.id).then(
			// 							function successCallback(data) {
			//
			// 								$scope.prerequisites = data;
			// 								$log.info("Prerequisites: %O", data);
			//
			// 								APIService.getNoncompliancesByOrganizationId($scope.selectedOrganization.id).then(
			// 									function successCallback(data) {
			//
			// 										$scope.items = data;
			// 										$log.info("Non compliances: %O", data);
			//
			// 										$scope.count.closed = data.filter(function (n) {
			// 											return n.closeDate != null;
			// 										}).length;
			//
			// 										$scope.count.opened = data.filter(function (n) {
			// 											return n.closeDate == null;
			// 										}).length;
			//
			// 										APIService.getDiagramsByOrganizationId($scope.selectedOrganization.id).then(
			// 											function (data) {
			//
			// 												$scope.diagrams = data;
			//
			// 												var diagramIds = $scope.diagrams.map(function (diagram) {
			// 													return diagram.id;
			// 												});
			//
			// 												APIService.recursiveCall(diagramIds, APIService.getEntitiesByDiagramId).then(
			// 													function (data) {
			//
			// 														$scope.entities = data;
			// 														$scope.loading = false;
			//
			// 													});
			//
			// 											});
			//
			// 									});
			//
			// 							});
			//
			// 					});
			//
			// 			});
			//
			// 	});

		}

		init();

	});

'use strict';

angular.module('APP')
	.controller('StaffHygieneUsersCtrl', function ($scope, $state, $translate, $q, $uibModal, $log,
	                                               PrerequisiteType, APIService, ResourceService) {
		$scope.prerequisites = null;
		$scope.audits = null;
		$scope.people = null;
		$scope.userRoles = null;
		$scope.trainings = null;
		$scope.items = [];

		$scope.loading = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {

			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}

		});

		$scope.viewTrainings = function (item) {

			var modalInstance = $uibModal.open({
				templateUrl: 'views/prerequisite/staffHygiene/templates/staffHygiene.users.trainings.detail.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					user: function () {
						return item.user;
					},
					items: function () {
						return item.trainings;
					},
					selectedOrganization: function () {
						return $scope.selectedOrganization;
					}
				},
				controller: ['$scope', '$uibModalInstance', 'items', 'user', 'selectedOrganization', 'APIService',
					function ($scope, $uibModalInstance, items, user, selectedOrganization,  APIService) {

						$scope.items = items;
						$scope.user = user;
						$scope.courses = null;

						$scope.close = function () {
							$uibModalInstance.dismiss();
						};

						function init() {

							APIService.getCoursesByOrganizationId(selectedOrganization.id).then(
								function (data) {

									$log.info("Courses: %O", data);
									$scope.courses = data;

								});

						}

						init();

					}]
			});
		};

		function init() {

			if (!$scope.selectedOrganization) {
				return;
			}

			$scope.loading = true;

			APIService.getRolesByOrganizationId($scope.selectedOrganization.id).then(
				function (data) {

					$log.info("Roles: %O", data);
					$scope.userRoles = data;

					APIService.getUsersByOrganizationId($scope.selectedOrganization.id).then(
						function (data) {

							$log.info("Users: %O", data);
							$scope.people = data.filter(function(u){ return u.organization.id == $scope.selectedOrganization.id});

							APIService.getTrainingsByOrganizationId($scope.selectedOrganization.id).then(
								function (data) {

									$log.info("Trainings: %O", data);
									$scope.trainings = data;

									APIService.getStaffHygienesByOrganizationId($scope.selectedOrganization.id).then(
										function (data) {

											$log.info("Staff hygienes: %O", data);
											$scope.prerequisites = data;

											APIService.getMonitoringsByOrganizationId($scope.selectedOrganization.id).then(
												function (data) {

													$log.info("Monitorings: %O", data);
													$scope.monitorings = data;

													var monitoringIds = $scope.monitorings.map(function (monitoring) {
														return monitoring.id;
													});

													APIService.recursiveCall(monitoringIds, APIService.getOutcomeByMonitoringId).then(
														function success(data) {

															$log.info("Outcomes: %O", data);
															$scope.outcomes = data;

															$scope.people.forEach(function (p) {

																var item = {};
																item.user = p;
																item.name = p.getFullName();
																item.role = $scope.userRoles.find(function (r) {
																	return r.id == p.role.id;
																});

																item.trainings = $scope.trainings.filter(function (t) {
																	return t.participants && (t.participants.find(function (part) {
																			return part.user.id == p.id;
																		}) != null);
																}).sort(function (a, b) {
																	return b.insertTime - a.insertTime;
																});

																var prerequisite = $scope.prerequisites.find(function (pre) {
																	return pre.role.id == p.role.id;
																});

																item.monitorings = $scope.monitorings.filter(function (m) {
																	return prerequisite && prerequisite.context.id == m.context.id;
																});

																item.outcomes = $scope.outcomes.sort(function (a, b) {
																	return b.insertTime - a.insertTime;
																});

																$scope.items.push(item);

															});

															$scope.loading = false;

															// $scope.items = angular.copy(data.filter(function (o) {
															// 	return o.attachment != null && o.preRequisiteType == Prerequisite.TYPES.STAFF_HYGIENE;
															// }));
															//
															// $scope.items.forEach(function (o) {
															//
															// 	var audit = $scope.audits.find(function (a) {
															// 		return o.auditId == a.id;
															// 	});
															//
															// 	if (audit) {
															// 		o.preRequisite = $scope.preRequisites.find(function (p) {
															// 			return p.id == audit.prerequisiteId;
															// 		});
															// 	}
															// });
															//
															// $scope.items = $scope.items.sort(function (a, b) {
															// 	return new Date(b.createDate) - new Date(a.createDate);
															// });

														});
												});
										});
								});
						});
				});
		}

		init();

	});

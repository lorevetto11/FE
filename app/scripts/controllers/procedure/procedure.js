'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
	.controller('ProcedureCtrl', function ($scope, $state, $translate, $timeout, $q, $uibModal, $log, Command, Layout, Shape, Color, Procedure,
	                                       Prerequisite, RiskClass, currentUser, ValidationService, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {

		$scope.items = null;
		$scope.userRoles = null;
		$scope.prerequisiteTypes = null;
		$scope.riskOptions = null;

		$scope.filter = {};

		$scope.add = function () {
			$scope.cancel();
			$timeout(function () {
				$scope.selectedItem = new Procedure();
			});
		};

		$scope.edit = function (item) {
			$scope.cancel();
			$timeout(function () {
				$scope.selectedItem = angular.copy(item);
			});
		};

		$scope.cancel = function () {
			$scope.selectedItem = null
		};

		$scope.delete = function (item) {
			ModalService.dialogConfirm('Delete',
				'Procedure <strong>' + item.name + '</strong> will be deleted. May I proceed? ',
				function onConfirmAction() {
					$scope.selectedItem = null;

					$log.info("Deleting Procedure: %O", item);
					return APIService.deleteProcedure(item.id);
				}
			).then(init);
		};

		$scope.textarea = function ($event) {

			var textarea = $("form").find("textarea").addClass("hidden");
			$(".procedureParagraph").parent().removeClass("hidden");

			if ($event) {
				$($event.target).parent().addClass('hidden');

				textarea = $($event.target).parent().parent().find("textarea");
				$(textarea).removeClass("hidden");

				$scope.textareaInit(textarea[0]);
			}

		};

		$scope.textareaInit = function (textarea) {
			var observe;
			if (window.attachEvent) {
				observe = function (element, event, handler) {
					element.attachEvent('on' + event, handler);
				};
			}
			else {
				observe = function (element, event, handler) {
					element.addEventListener(event, handler, false);
				};
			}
			var text = textarea;

			function resize() {
				text.style.height = 'auto';
				text.style.height = text.scrollHeight + 'px';
			}

			/* 0-timeout to get the already changed text */
			function delayedResize() {
				window.setTimeout(resize, 0);
			}

			observe(text, 'change', resize);
			observe(text, 'cut', delayedResize);
			observe(text, 'paste', delayedResize);
			observe(text, 'drop', delayedResize);
			observe(text, 'keydown', delayedResize);
			observe(text, 'focus', delayedResize);

			text.focus();
			text.select();
			resize();

		};

		$scope.clone = function (item) {
			var clone = angular.copy(item);
			clone.id = null;
			clone.title = 'copy of - ' + clone.title;
			clone.organization = ResourceService.getSelectedOrganization();
			$scope.selectedItem = clone;
		};

		$scope.save = function (item, form) {

			if (form.$invalid) {
				ValidationService.dirtyForm(form);
				return false;
			}

			if (item.id == null) {

				if ( item.prerequisiteType.name === 'CCP'
					|| item.prerequisiteType.name === 'OPRP'){
					item.riskClass = null;
				}
				item.revision = 100;

				$log.info("Creating Procedure: %O", item);
				APIService.createProcedure(item).then(
					function success(item) {

						$scope.selectedItem = item;
						notify.logSuccess('Success', 'new procedure successfully created');
						init();

					},
					savingError
				);

			} else {

				// check for revision increment
				var orig = $scope.items.find(function (i) {
					return i.id == item.id;
				});

				/*
				 p.title = obj.title;
				 p.purpose = obj.purpose;
				 p.equipments = obj.equipments;
				 p.activities = obj.activities;
				 p.processCheck = obj.processCheck;
				 p.resultsCheck = obj.resultsCheck;
				 p.attachment = obj.attachment;

				 */

				if (orig.title != item.title ||
					orig.purpose != item.purpose ||
					orig.equipments != item.equipments ||
					orig.activities != item.activities ||
					orig.process_check != item.process_check ||
					orig.results_check != item.results_check/* ||
				 orig.attachment != item.attachment*/) {
					item.revision += 1;
				}

				$log.info("Updating Procedure: %O", item);
				APIService.updateProcedure(item).then(
					function success(item) {
						$scope.selectedItem = item;
						notify.logSuccess('Success', 'procedure successfully updated');
						init();
					},
					savingError
				);
			}
		};

		function savingError() {
			$scope.loader = false;
			$scope.errorMessage = "Saving data error!";
		}

		$scope.itemsFilter = function (item) {

			var result = true;

			if ($scope.filter.role && item.userRole) {
				result &= item.userRole.id == $scope.filter.role.id;
			}

			if ($scope.filter.prerequisite && item.prerequisiteType) {
				result &= item.prerequisiteType.id == $scope.filter.prerequisite.id;
			}

			if ($scope.filter.keyword && $scope.filter.keyword.length > 0) {
				var keyword = $scope.filter.keyword.toLowerCase();
				result &= (item.title && item.title.toLowerCase().indexOf(keyword) != -1);
			}

			return result;
		};

		$scope.getRoleLabel = function (roleId) {

			var role = $scope.userRoles.find(function (r) {
				return r.id == roleId;
			});

			if (role) {
				var text = role.name;
				if (role.description) {
					text += ' - ' + role.description;
				}
				return text;
			}
		};

		$scope.isValid = function (item) {
			return true;
		};

		function showDetailModal(item, editMode) {

			var isNew = (item == null);

			var modalInstance = $uibModal.open({
				templateUrl: 'views/monitoring/prerequisite/monitoring.detail.tmpl.html',
				size: 'lg',
				backdrop: 'static',
				resolve: {
					item: function () {
						return item;
					},
					editMode: function () {
						return editMode != null ? editMode : false;
					}
				},
				controller: ['$scope', '$uibModalInstance', 'item', 'editMode', 'Prerequisite',
					function ($scope, $uibModalInstance, item, editMode, Prerequisite) {

						$scope.editMode = editMode;
						$scope.originalItem = item;
						$scope.item = angular.copy(item) || {};
						$scope.preRequisiteTypes = Prerequisite.TYPES;
						$scope.people = null;


						$scope.save = function () {
							$scope.loader = true;
							if ($scope.item.id == null) {
								APIService.createMonitoring($scope.item).then(
									function success(item) {
										$uibModalInstance.close(item);
									},
									savingError
								);
							} else {

								APIService.updateMonitoring($scope.item).then(
									function success(item) {
										$uibModalInstance.close(item);
									},
									savingError
								);
							}
						};

						$scope.cancel = function () {
							$uibModalInstance.dismiss();
						};

						function savingError() {
							$scope.loader = false;
							$scope.errorMessage = "Saving data error!";
						}

						(function init() {

							APIService.getPeopleByOrganizationId().then(
								function success(data) {
									$scope.people = data;
								}
							);

						})();
					}]
			});

			modalInstance.result.then(
				function confirm(item) {

					if (isNew) {
						$scope.items.push(item);
					} else {
						init();
					}
				}, function dismiss() {
					$log.info('Modal dismissed at: ' + new Date());
				});
		}


		function init() {

			APIService.getRolesByOrganizationId(ResourceService.getSelectedOrganization().id).then(
				function successCallback(data) {

					$scope.userRoles = data;
					$log.info("Roles: %O", data);

					APIService.getPrerequisiteTypes().then(
						function successCallback(data) {

							$scope.prerequisiteTypes = data;
							$log.info("PrerequisiteTypes: %O", data);

							APIService.getRiskClassesByOrganizationId(ResourceService.getSelectedOrganization().id).then(
								function successCallback(data) {

									$scope.riskOptions = data;
									$log.info("RiskClasses: %O", data);

									APIService.getProceduresByOrganizationId(ResourceService.getSelectedOrganization().id).then(
										function successCallback(data) {

											$scope.items = data;
											$log.info("Procedures: %O", data);

										}
									);

								}
							);

						}
					);

				}
			);


		}

		init();
	});

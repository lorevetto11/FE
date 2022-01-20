'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
	.controller('WasteDisposalCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, PrerequisiteType, Command, WaterSupply, WasteDisposal, Shape, Color, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {


		$scope.items = null;
		$scope.command = null;

		$scope.MODE = {
			SHOW_PLAN: 'show_plan',
			SHOW_ANALYSIS: 'show_analysis',
			SHOW_PROCESS_CHECKS: 'show_checks'
		};

		$scope.prerequisiteType = PrerequisiteType.WASTE_DISPOSAL;

		$scope.mode = $scope.MODE.SHOW_PLAN;

		$scope.showAnalysis = function () {
			if ($scope.mode == $scope.MODE.SHOW_ANALYSIS) {
				$scope.mode = $scope.MODE.SHOW_PLAN;
			} else {
				$scope.mode = $scope.MODE.SHOW_ANALYSIS;
			}
		};

		$scope.showProcessChecks = function () {
			if ($scope.mode == $scope.MODE.SHOW_PROCESS_CHECKS) {
				$scope.mode = $scope.MODE.SHOW_PLAN;
			} else {
				$scope.mode = $scope.MODE.SHOW_PROCESS_CHECKS;
			}
		};

		$scope.wasteDisposalTypes = [
			// {
			//     name: 'UW',
			//     description: 'Urban Waste',
			//     shape: angular.extend(new Shape(), {
			//         type: Shape.RECTANGLE,
			//         sizeX: 0.04,
			//         sizeY: 0.02,
			//         color: '#f00'
			//     })
			// },
			// {
			//     name: 'AR',
			//     description: 'Animal Rejection',
			//     shape: angular.extend(new Shape(), {
			//         type: Shape.RECTANGLE,
			//         sizeX: 0.04,
			//         sizeY: 0.02,
			//         color: '#95a'
			//     })
			// }
		];

		$scope.changeState = function (path) {

			$state.go(path);

		};

		$scope.add = function (type) {

			$scope.mode = $scope.MODE.SHOW_PLAN;

			if ($scope.items == null) {
				$scope.items = [];
			}

			if ($scope.command.action == null) {
				$scope.command.action = Command.action.ADD;
				$scope.command.element = new WasteDisposal(type);
			}
			else {
				$scope.command.action = null;
			}
		};

		$scope.onSaveItem = function (item, floor) {

			if (PrerequisiteType.isWasteDisposal(item)) {

				if (item.id == null) {

					delete item.drawing;
					delete item.selected;
					delete item.constrainedToType;
					item.layout = item.constrainedTo;
					delete item.layout.selected;
					delete item.constrainedTo;
					$log.info("Creating Shape: %O", item.shape);
					APIService.createShape(item.shape).then(
						function successCallback(data) {

							item.shape.id = data.id;

							$log.info("Creating Waste Disposal: %O", item);
							APIService.createWasteDisposal(item).then(
								function successCallback(data) {

									setTimeout(function () {

										data.selected = true;

										angular.extend(item, data);
										notify.logSuccess('Success', 'Element successfully created');
									}, 0);

								}
							);

						}
					);

					$scope.items.push(item);

				} else { // update existing waterSupply

					delete item.drawing;
					delete item.selected;
					delete item.constrainedToType;
					var constrainedTo = item.constrainedTo;
					delete item.constrainedTo;
					$log.info("Updating shape: %O", item.shape);
					APIService.updateShape(item.shape).then(
						function successCallback(data) {

							item.shape.id = data.id;

							$log.info("Updating Waste Disposal: %O", item);
							APIService.updateWasteDisposal(item).then(
								function successCallback(data) {

									data.selected = true;

									angular.extend(item, data);
									notify.logSuccess('Success', 'Element successfully updated');

								}
							);

						}
					);

				}

				$scope.command.action = null;

			}

		};

		$scope.onDeleteItem = function (item) {

			if (PrerequisiteType.isWasteDisposal(item)) {

				if (item.id != null) {

					$log.info("Deleting Shape: %O", item.shape);
					APIService.deleteShape(item.shape.id).then(
						function successCallback(data) {

							$log.info("Deleting Waste Disposal: %O", item);
							APIService.deleteWasteDisposal(item.id).then(
								function successCallback(data) {

									var idx = $scope.items.indexOf(item);

									if (idx != -1) {

										$scope.items.splice(idx, 1);
										notify.logSuccess('Success', 'Element successfully deleted');

									}

									item.selected = false;

								}
							);

						}
					);

				}

				$scope.command.action = null;

			}

		};


		function init() {

			$scope.command = {
				action: null,
				type: PrerequisiteType.WASTE_DISPOSAL
			};

			$scope.items = [];

			APIService.getLayoutsByOrganizationId(ResourceService.getSelectedOrganization().id).then(
				function successCallback(data) {

					$scope.items = $scope.items.concat(data);
					$log.info("Layouts: %O", data);

					APIService.getWasteDisposalTypesByOrganizationId(ResourceService.getSelectedOrganization().id).then(
						function success(data) {

							data = data.map(function (type) {
								type.shape = angular.extend(new Shape(), {
									type: type.shape.type,
									sizeX: type.shape.sizeX,
									sizeY: type.shape.sizeY,
									radius: type.shape.radius,
									color: type.shape.color
								});

								return type
							});
							$scope.wasteDisposalTypes = data;
							$log.info("Types: %O", $scope.wasteDisposalTypes);


							APIService.getWasteDisposalsByOrganizationId(ResourceService.getSelectedOrganization().id).then(
								function successCallback(data) {

									$scope.items = $scope.items.concat(data);
									$log.info("Waste Disposals: %O", data);

								});

						});

				});

		}

		init();

	});

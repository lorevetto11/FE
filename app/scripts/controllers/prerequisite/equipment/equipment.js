'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
	.controller('EquipmentCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, PrerequisiteType, Command,
	                                       Equipment, Frequency, EEquipment, EquipmentType, Shape, Color, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {


		$scope.items = null;
		$scope.command = null;

		$scope.MODE = {
			SHOW_PLAN: 'show_plan',
			SHOW_ANALYSIS: 'show_analysis',
			SHOW_PROCESS_CHECKS: 'show_checks'
		};

		$scope.prerequisiteType = PrerequisiteType.EQUIPMENT;

		$scope.mode = $scope.MODE.SHOW_PLAN;

		$scope.changeState = function (path) {

			$state.go(path);

		};

		$scope.showAnalysis = function () {
			if ($scope.mode == $scope.MODE.SHOW_ANALYSIS) {
				$scope.mode = $scope.MODE.SHOW_PLAN;
			} else {
				$scope.mode = $scope.MODE.SHOW_ANALYSIS;
			}
		};

		$scope.showEquipments = function () {
			if ($scope.mode == $scope.MODE.SHOW_EQUIPMENTS) {
				$scope.mode = $scope.MODE.SHOW_PLAN;
			} else {
				$scope.mode = $scope.MODE.SHOW_EQUIPMENTS;
			}
		};

		$scope.showProcessChecks = function () {
			if ($scope.mode == $scope.MODE.SHOW_PROCESS_CHECKS) {
				$scope.mode = $scope.MODE.SHOW_PLAN;
			} else {
				$scope.mode = $scope.MODE.SHOW_PROCESS_CHECKS;
			}
		};

		$scope.equipmentTypes = [
			// {
			//     name: 'FR',
			//     description: 'Freezer Siemens',
			//     shape: angular.extend(new Shape(), {
			//         type: Shape.RECTANGLE_FIX,
			//         sizeX: 0.04,
			//         sizeY: 0.03,
			//         color: '#a32'
			//     }),
			//     equipmentType: {
			//         id: 2
			//     }
			// },
			// {
			//     name: 'OV',
			//     description: 'Oven Bosch',
			//     shape: angular.extend(new Shape(), {
			//         type: Shape.RECTANGLE_FIX,
			//         sizeX: 0.04,
			//         sizeY: 0.03,
			//         color: '#95a'
			//     }),
			//     equipmentType: {
			//         id: 17
			//     }
			// },
			// {
			//     name: 'DW',
			//     description: 'Dishwasher AEG',
			//     shape: angular.extend(new Shape(), {
			//         type: Shape.CIRCLE_FIX,
			//         radius: 0.025,
			//         color: '#2a7'
			//     }),
			//     equipmentType: {
			//         id: 18
			//     }
			// }
		];


		$scope.add = function (type) {

			$scope.mode = $scope.MODE.SHOW_PLAN;

			if ($scope.items == null) {
				$scope.items = [];
			}

			if ($scope.command.action == null) {
				$scope.command.action = Command.action.ADD;
				$scope.command.element = new Equipment(type);
				$scope.command.element.equipmentType = EquipmentType.parse(type);
			}
			else {
				$scope.command.action = null;
			}
		};

		$scope.onSaveItem = function (item, floor) {

			if (PrerequisiteType.isEquipment(item)) {

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

							item.equipment.frequency = Frequency.parse(item.equipment.frequency);

							$log.info("Creating Frequency: %O", item.equipment.frequency);
							APIService.createFrequency(item.equipment.frequency).then(
								function success(frequency) {

									item.equipment.frequency = frequency;

									item.equipment.name = item.name;
									item.equipment.description = item.description;

									$log.info("Creating Equipment: %O", item.equipment);
									APIService.createEEquipment(item.equipment).then(
										function successCallback(equipment) {

											item.equipment = equipment;

											$log.info("Creating Prerequisite Equipment: %O", item);
											APIService.createEquipment(item).then(
												function successCallback(data) {

													setTimeout(function () {

														item.id = data.id;
														item.context = data.context;
														item.selected = true;

														notify.logSuccess('Success', 'Element successfully created');

													}, 0);

												});

										});

								});

						});

					$scope.items.push(item);

				} else {

					delete item.drawing;
					delete item.selected;
					delete item.constrainedToType;
					delete item.constrainedTo;

					$log.info("Updating Shape: %O", item.shape);
					APIService.updateShape(item.shape).then(
						function successCallback(data) {

							var itemShape = data;
							item.shape.id = data.id;

							$log.info("Updating Frequency: %O", item.equipment.frequency);
							APIService.updateFrequency(item.equipment.frequency).then(
								function success(frequency) {

									var itemFrequency = frequency;
									item.equipment.name = item.name;
									item.equipment.description = item.description;

									$log.info("Updating Equipment: %O", item.equipment);
									APIService.updateEEquipment(item.equipment).then(
										function successCallback(equipment) {

											var itemEquipment = equipment;
											item.equipment = equipment;

											$log.info("Updating Prerequisite Equipment: %O", item);
											APIService.updateEquipment(item).then(
												function successCallback(data) {

													setTimeout(function () {

														item.context = data.context;
														item.selected = true;

														item.shape = itemShape;
														item.equipment = itemEquipment;
														item.equipment.frequency = itemFrequency;

														notify.logSuccess('Success', 'Element successfully updated');

													}, 0);

												});

										});

								});

						});

				}

				$scope.command.action = null;

			}

		};

		$scope.onDeleteItem = function (item) {

			if (PrerequisiteType.isEquipment(item)) {

				if (item.id != null) {

					$log.info("Deleting Shape: %O", item.shape);
					APIService.deleteShape(item.shape.id).then(
						function successCallback() {

							$log.info("Deleting Frequency: %O", item.equipment.frequency);
							APIService.deleteFrequency(item.equipment.frequency.id).then(
								function success() {

									$log.info("Deleting Equipment: %O", item.equipment);
									APIService.deleteEEquipment(item.equipment.id).then(
										function successCallback() {

											$log.info("Deleting Prerequisite Equipment: %O", item);
											APIService.deleteEquipment(item.id).then(
												function successCallback() {

													var idx = $scope.items.indexOf(item);

													if (idx != -1) {

														$scope.items.splice(idx, 1);
														notify.logSuccess('Success', 'Element successfully deleted');

													}

													item.selected = false;

												});

										});

								});

						});

				}

				$scope.command.action = null;

			}

		};


		function init() {

			var selectedOrganization = ResourceService.getSelectedOrganization();

			$scope.command = {
				action: null,
				type: PrerequisiteType.EQUIPMENT
			};

			$scope.items = [];

			APIService.getLayoutsByOrganizationId(selectedOrganization ? selectedOrganization.id : null).then(
				function successCallback(data) {

					$scope.items = $scope.items.concat(data);
					$log.info("Layouts: %O", data);

					APIService.getEquipmentTypesByOrganizationId(selectedOrganization ? selectedOrganization.id : null).then(
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
							$scope.equipmentTypes = data;
							$log.info("Equipment types: %O", $scope.equipmentTypes);

							APIService.getEquipmentsByOrganizationId(selectedOrganization ? selectedOrganization.id : null).then(
								function successCallback(data) {

									var items = data;

									APIService.getEEquipmentsByOrganizationId(selectedOrganization ? selectedOrganization.id : null).then(
										function successCallback(data) {

											var equipments = data;
											$log.info("Equipments: %O", equipments);

											equipments = equipments.map(function (equipment) {

												equipment.frequency.organization = selectedOrganization;

												return equipment;

											});

											items = items.map(function (prerequisiteEquipment) {

												prerequisiteEquipment.equipment = equipments.find(function (equipment) {
													return prerequisiteEquipment.equipment.id == equipment.id;
												});

												return prerequisiteEquipment;

											});

											$scope.items = $scope.items.concat(items);
											$log.info("Prerequisite Equipments: %O", $scope.items);

										});

								});

						});

				});

		}

		init();
	});

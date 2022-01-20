'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
	.controller('AirConditioningCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, Command, Layout, Shape, Color,
	                                             PrerequisiteType, AirConditioning, currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify, UtilsService, PermissionService) {
		
		$scope.items = null;
		$scope.command = null;
		
		$scope.prerequisiteType = PrerequisiteType.AIR_CONDITIONING;
		
		$scope.MODE = {
			SHOW_PLAN: 'show_plan',
			SHOW_ANALYSIS: 'show_analysis',
			SHOW_EQUIPMENTS: 'show_equipments',
			SHOW_PROCESS_CHECKS: 'show_checks'
		};
		
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
		
		
		$scope.airConditionEquipments = [
			// {
			//     name: 'PPZ',
			//     description: 'Positive Pressure Zone',
			//     shape: angular.extend(new Shape(), {
			//         type: Shape.RECTANGLE,
			//         color: '#be7'
			//     })
			// }
			/*,
			 {   name:'HOOD',
			 description: 'Extractor Hood',
			 shape : angular.extend(new Shape(), {
			 type : Shape.CIRCLE,
			 color : '#be7',
			 radius : 0.03
			 })
			 },*/
		];
		
		$scope.add = function (equipment) {
			
			$scope.mode = $scope.MODE.SHOW_PLAN;
			
			if ($scope.items == null) {
				$scope.items = [];
			}
			
			if ($scope.command.action == null) {
				$scope.command.action = Command.action.ADD;
				$scope.command.element = new AirConditioning(equipment);
			}
			else {
				$scope.command.action = null;
			}
			
		};
		
		$scope.onSaveItem = function (item, floor) {
			
			if (PrerequisiteType.isAirConditioning(item)) {
				
				if (item.id == null) {
					
					delete item.drawing;
					delete item.selected;
					delete item.constrainedToType;
					item.layout = item.constrainedTo;
					delete item.layout.selected;
					delete item.constrainedTo;
					var equipment = item.equipment;
					delete item.equipment;
					$log.info("Creating Shape: %O", item.shape);
					APIService.createShape(item.shape).then(
						function successCallback(data) {
							
							item.shape.id = data.id;
							
							$log.info("Creating Air Conditioning: %O", item);
							APIService.createAirConditioning(item).then(
								function successCallback(data) {
									
									setTimeout(function () {
										
										data.selected = true;
										data.equipment = equipment;
										
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
					delete item.constrainedTo;
					var equipment = item.equipment;
					delete item.equipment;
					
					$log.info("Updating shape: %O", item.shape);
					APIService.updateShape(item.shape).then(
						function successCallback(data) {
							
							item.shape.id = data.id;
							
							$log.info("Updating Air Conditioning: %O", item);
							APIService.updateAirConditioning(item).then(
								function successCallback(data) {
									
									data.selected = true;
									data.equipment = equipment;
									
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
			
			if (PrerequisiteType.isAirConditioning(item)) {
				
				if (item.id != null) {
					
					$log.info("Deleting Shape: %O", item.shape);
					APIService.deleteShape(item.shape.id).then(
						function successCallback(data) {
							
							$log.info("Deleting Air Conditioning: %O", item);
							APIService.deleteAirConditioning(item.id).then(
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
				type: PrerequisiteType.AIR_CONDITIONING
			};
			
			$scope.items = [];
			
			APIService.getLayoutsByOrganizationId(ResourceService.getSelectedOrganization().id).then(
				function successCallback(data) {
					
					$scope.items = data;
					$log.info("Layouts: %O", data);
					
					APIService.getAirConditioningTypesByOrganizationId(ResourceService.getSelectedOrganization().id).then(
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
							
							$scope.airConditionEquipments = data;
							$log.info("Types: %O", $scope.airConditionEquipments);
							
							
							APIService.getAirConditioningsByOrganizationId(ResourceService.getSelectedOrganization().id).then(
								function successCallback(data) {
									
									$scope.items = $scope.items.concat(data);
									$log.info("Air Conditioning: %O", data);
									
								});
							
						});
					
				});
			
		}
		
		init();
		
	});

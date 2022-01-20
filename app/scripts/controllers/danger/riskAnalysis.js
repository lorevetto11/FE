'use strict';

/**
 * @ngdoc function
 * @name APP.controller:MainHomeCtrl
 * @description
 * # MainHomeCtrl
 * Controller of the APP
 */
angular.module('APP')
	.controller('RiskAnalysisCtrl', function ($scope, $state, $translate, $q, $uibModal, $log, $timeout,
	                                          Entity, Danger, PackagingMaterial, RiskMap,
	                                          currentUser, currentOrganization, ModalService, APIService, ResourceService, StorageService, notify) {

		$scope.items = null;
		$scope.diagrams = null;
		$scope.materials = null;
		$scope.shapes = null;
		$scope.entities = null;
		$scope.numMonitorings = null;
		$scope.riskMapRelation = null;

		$scope.selected = {};
		$scope.filtered = {};

		$scope.types = [Danger.TYPE.BIOLOGICAL, Danger.TYPE.CHEMICAL, Danger.TYPE.PHYSICAL, Danger.TYPE.ALLERGENS];

		$scope.panelClass = {};
		$scope.panelClass[Danger.TYPE.BIOLOGICAL] = 'panel-info';
		$scope.panelClass[Danger.TYPE.CHEMICAL] = 'panel-warning';
		$scope.panelClass[Danger.TYPE.PHYSICAL] = 'panel-success';
		$scope.panelClass[Danger.TYPE.ALLERGENS] = 'panel-default';

		$scope.riskMap = [
			Danger.RISK.LOW,
			Danger.RISK.LOW,
			Danger.RISK.MEDIUM,
			Danger.RISK.MEDIUM,
			Danger.RISK.LOW,
			Danger.RISK.MEDIUM,
			Danger.RISK.MEDIUM,
			Danger.RISK.HIGH,
			Danger.RISK.MEDIUM,
			Danger.RISK.MEDIUM,
			Danger.RISK.HIGH,
			Danger.RISK.HIGH,
			Danger.RISK.MEDIUM,
			Danger.RISK.HIGH,
			Danger.RISK.HIGH,
			Danger.RISK.HIGH
		];

		$scope.riskMapColor = {};
		$scope.riskMapColor[Danger.RISK.LOW] = 'yellow';
		$scope.riskMapColor[Danger.RISK.MEDIUM] = 'warning';
		$scope.riskMapColor[Danger.RISK.HIGH] = 'danger';

		$scope.survey = {}

		$scope.loading = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		var changedSelectedOrganization = ResourceService.getSelectedOrganization();
		if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
			$scope.selectedOrganization = changedSelectedOrganization;
			init();
		}

		$scope.add = function () {
			$scope.selectedItem = new Danger();
		};

		$scope.edit = function (item) {
			$scope.originalItem = item;
			$scope.selectedItem = angular.copy(item);
		};

		$scope.cancel = function () {
			$scope.selectedItem = null;
			$scope.selected.phase = null;
		};

		$scope.delete = function (item) {

			ModalService.dialogConfirm("alertMessage.delete", '"entity.danger" <strong> ' + item.name + '</strong> "alertMessage.willBeDeleted"',
				function onConfirmAction() {

					$scope.selectedItem = null;
					$log.info("Deleting danger: %O", item);
					return APIService.deleteDanger(item.id);

				}
			).then(init);

		};

		$scope.clone = function (item) {
			var clone = angular.copy(item);
			clone.id = null;
			clone.name = 'copy of - ' + clone.name;
			$scope.selectedItem = clone;
		};

		$scope.save = function (item) {

			if (item.id == null) {

				$log.info("Creating danger: %O", item);
				APIService.createDanger(item).then(
					function success(item) {

						$scope.selectedItem = item;
						notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.dangerCreated'));
						init();

					}, savingError);

			} else {

				$log.info("Updating danger: %O", item);
				APIService.updateDanger(item).then(
					function success(item) {

						$scope.selectedItem = item;
						notify.logSuccess($translate.instant('notify.success'), $translate.instant('notify.dangerUpdated'));
						init();

					}, savingError);

			}

		};



		$scope.hasMaterial = function (danger, material) {
			var result = false;

			if (danger.materials.length > 0) {
				danger.materials.forEach(function (m) {
					if (m.id == material.id) {
						result = true;
					}
				});
			}

			return result;
		};

		$scope.loadShapes = function(diagram) {

			diagram = diagram || $scope.selected.diagram;

			$scope.selected.diagram = diagram;

			$scope.selectedItem = null;
			$scope.filtered.dangers = [];
			$scope.filtered.entities = [];
			$scope.filtered.materials = [];
			
			$scope.loading = true;

			APIService.getDiagramShapesByDiagramId(diagram.id).then(
				function success(data) {

					$log.info("Shapes: %O", data);
					$scope.shapes = data;

					var shapeIds = $scope.shapes.map(function (shape) {
						return shape.id;
					});
					APIService.getEntitiesByDiagramId(diagram.id).then(
						function success(data) {

							$log.info("Entities: %O", data);
							$scope.entities = data;
							
							$scope.filtered.entities = $scope.entities.filter(function (entity) {
								if (entity.type == Entity.TYPES.PHASE){
									return entity;
								}
							});

							$scope.filtered.entities = $scope.filtered.entities.filter(function (entity) {
								var shape = $scope.shapes.find(function (shape) {
									return shape.element && ( shape.element.id === entity.id );
								});

								if (shape) {
									return entity;
								}
							});

							$scope.materials.forEach(function (material) {
								var result = false;
								$scope.entities.filter(function(entity) {
									if (entity.type == Entity.TYPES.MATERIAL){
										return entity;
									}
								}).forEach(function (entity) {

									if(entity.material && material.id == entity.material.id && material.type == PackagingMaterial.TYPES.FOOD){
										result = true;
									}
								});
								if (result) {
									$scope.filtered.materials.push(material);
								}
							});

							$scope.items.forEach(function(danger){

								var result = false;

								$scope.filtered.materials.forEach(function (material) {

									if ($scope.hasMaterial(danger, material)){
										result = true;
									}

								});

								if (result) {
									$scope.filtered.dangers.push(danger);
								}

							});

							$scope.loading = false;

						}, savingError);

				}, savingError);

		};

		$scope.selectPhase = function(entity){

			$scope.selected.phase = null;

			$timeout(function () {
				$scope.selected.phase = entity;
				$scope.numMonitorings = 0;
				$scope.selected.danger = null;
				$scope.riskMapRelation = null;
			}, 1);

		};

		$scope.editPhase = function(phase, type) {

			if ($scope.numMonitorings == null || $scope.numMonitorings === 0) {

				var shape = $scope.shapes.find(function (shape) {
					return shape.element && ( shape.element.id === phase.id );
				});
				
				if (shape) {
					
					phase.shape = shape;
					phase.typeCCP = type || null;
					
					$scope.loading = true;
					APIService.updateEntity(phase).then(function (data) {
						
						$scope.loading = false;
						
					});
					
				}
				
			} else {

				notify.logWarning('Warning', 'Can\'t modify, first delete monitorings associated with this phase.');

			}


		};

		$scope.getColor = function(phase) {
			if (phase.typeCCP === Entity.CCPTYPES.NONE
				|| phase.typeCCP == null ) {
				return {"background-color": Entity.COLOR.NONE };
			} else if ( phase.typeCCP === Entity.CCPTYPES.CCP ) {
				return {"background-color": Entity.COLOR.CCP };
			} else if ( phase.typeCCP === Entity.CCPTYPES.OPRP ) {
				return {"background-color": Entity.COLOR.OPRP }
			}
		};
		
		$scope.savePhase = function(shape){


			APIService.updateDiagramShape($scope.selected.shape).then(function () {
				$scope.loadShapes();
			});

		};

		$scope.isCCP = function(item) {

			var shape = $scope.shapes.find(function (shape) {
				return shape.element.id == item.id;
			});
			if ( shape ) {
				return shape.typeCCP == "CCP";
			}

		};

		$scope.$on('numMonitorings', function(event, data) {
			$scope.numMonitorings = data;
		});

		$scope.loadRiskMapRelation = function() {

			var danger = $scope.selected.danger,
				element = $scope.selected.phase;

			if (danger != null && element != null) {

				APIService.getRiskMap(danger.id, element.id).then(
					function success(data) {

						if (data.length !== 0){
							$scope.riskMapRelation = data[0];
						} else {
							var riskMap = {
								danger: { id: danger.id },
								element: {id: element.id }
							};
							$scope.riskMapRelation = new RiskMap(riskMap);
						}

						console.log($scope.riskMapRelation);

					}, savingError);

			}

		};
		
		$scope.saveRiskMapRelation = function (value) {
			
			if (value != null) {

				$scope.riskMapRelation.value = value;
				if ($scope.riskMapRelation.id == null) {

					$log.info("Creating riskMap: %O", $scope.riskMapRelation);
					APIService.createRiskMap($scope.riskMapRelation).then(
						function success(data) {
							$scope.riskMapRelation = data;
						}, savingError);

				} else {
					$log.info("Updating riskMap: %O", $scope.riskMapRelation);
					APIService.updateRiskMap($scope.riskMapRelation).then(
						function success(data) {
							$scope.riskMapRelation = data;
						}, savingError);
				}
			}
			
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

			APIService.getDangersByOrganizationId($scope.selectedOrganization.id).then(
				function success(data) {

					$log.info("Dangers: %O", data);
					$scope.items = data;

					APIService.getMaterialsByOrganizationId($scope.selectedOrganization.id).then(
						function success(data) {

							$log.info("Materials: %O", data);
							$scope.materials = data;

							APIService.getDiagramsByOrganizationId($scope.selectedOrganization.id).then(
								function success(data) {

									$log.info("Diagrams: %O", data);
									$scope.diagrams = data;

									if ( $scope.selectedItem !== null ) {
										$scope.originalItem = $scope.selectedItem;
									}

									$scope.loading = false;

								}, savingError);

						}, savingError);

				}, savingError);

		}

		init();

	});

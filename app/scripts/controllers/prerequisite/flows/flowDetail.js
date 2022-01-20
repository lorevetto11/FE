'use strict';
angular.module('APP')
	.controller('FlowDetailCtrl', function ($rootScope, $scope, $state, $timeout, $translate, $q, $uibModal, $log,
											DiagramShape, PackagingMaterial,
	                                        APIService, ResourceService, ValidationService) {

		$scope.entity = null;
		$scope.materials = null;

		$scope.selectedOrganization = ResourceService.getSelectedOrganization();

		$scope.$on('resourceChange', function () {
			var changedSelectedOrganization = ResourceService.getSelectedOrganization();
			if (!angular.equals($scope.selectedOrganization, changedSelectedOrganization)) {
				$scope.selectedOrganization = changedSelectedOrganization;
				init();
			}
		});

		$scope.dataChange = function(){
			var entity = $scope.entity,
				selectedShape = $scope.selectedShape;
			if (entity.name != null &&
				selectedShape.centerX != null && selectedShape.centerY != null &&
				selectedShape.width != null && selectedShape.height != null &&
				selectedShape.fillColor != null){

				$rootScope.$broadcast("dataChange");
			}
		};

		/*

		$rootScope.$on('selectedShape', function(events, args){

			if (args != null) {
				$scope.entity = _entities.find(function(entity){
					return entity.shape.id == args.id;
				});
			}

		});
		*/

		$scope.onSave = function(item){

			$rootScope.$broadcast("saveShape", item);

		};
		
		function init(){

			$scope.loading = true;

			$scope.$watch('selectedShape', function(value){
				if(value) {
					$scope.entity = value.element;
				}
			});

			APIService.getMaterialsByOrganizationId($scope.selectedOrganization.id).then(
				function success(data) {

					$scope.materials = data.filter(function (material) {
						if (material.type == PackagingMaterial.TYPES.FOOD) {
							return material;
						}
					});
					
					$scope.loading = false;
				});
		}
		
		init();

	});

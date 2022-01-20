'use strict';

angular.module('APP')
.controller('PrintHomeCtrl', function ($scope, $state, $translate, $timeout, $q, $uibModal, $log, $window,
									   ResourceService, PrintService, APIService  ) {


	$scope.selectedOrganization = ResourceService.getSelectedOrganization();
	$scope.printing = false;

	$scope.printTest = function () {
		$log.info("printTest()");
	};


	$scope.printOrganizationDetails = function () {
		//$scope.printing = true;
		var data = {};
		
		APIService.getOrganizationById($scope.selectedOrganization.id).then(
			function success(organization) {
				data.organization = organization;

				APIService.getOrganizationPlaces(organization.id).then(
					function success(places) {
						data.places = places.filter(function (p) {
							return p.organization.id == organization.id;
						});

						APIService.getOrganizationCertifications(organization.id).then(
							function success(certifications) {
								data.certifications = certifications.filter(function (c) {
									return c.organization.id == organization.id;
								});

								$scope.printing = true;
								PrintService.printOrganizationDetails(data).then(onPrintFinish, onPrintError);
							});
					});
			});
	};
	
	$scope.printDelega = function () {
		$scope.printing = true;
		PrintService.printDelega().then(onPrintFinish, onPrintError);
	};

	$scope.printStaff = function() {
		$scope.printing = true;
		PrintService.printStaff().then(onPrintFinish, onPrintError);
	};

	$scope.printStaffTrainings = function() {
		$scope.printing = true;
		PrintService.printStaffTrainings().then(onPrintFinish, onPrintError);
	};


	function onPrintError() {
		//$scope.printing = false
	}

	function onPrintFinish() {
		//$scope.printing = false
	}

	function init() {

		PrintService.onPrintFinished().then(function(){
			$scope.printing = false
		});
		
		$window.onafterprint = function () {
			$log.info("=========================================== onafterprint =================================");
			//deferred.resolve();
		};
		
	}

	init();
});

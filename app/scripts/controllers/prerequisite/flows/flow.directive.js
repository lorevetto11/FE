angular.module('APP')
	.directive('flowChart', function () {
		return {
			restrict: "AE",
			replace: true,
			controller: 'FlowsChartCtrl',
			templateUrl: 'views/prerequisite/flows/flow.chart.tmpl.html'
		};
	})

	.directive('flowDiagrams', function () {
		return {
			restrict: "AE",
			replace: true,
			controller: 'FlowsDiagramsCtrl',
			templateUrl: 'views/prerequisite/flows/flow.diagrams.tmpl.html'
		};
	})

	.directive('flowCanvas', function () {
		return {
			restrict: "AE",
			replace: true,
			scope: {
				shapes : '='
			},
			controller: 'FlowsCanvasCtrl',
			templateUrl: 'views/prerequisite/flows/templates/flow.canvas.tmpl.html',
			link: function(scope, element) {
				
				var canvasElement = document.getElementById("drawingField");
				
				element.bind('mousedown', scope.onMouseDown);
				element.bind('mousemove', scope.onMouseMove);
				element.bind('mouseup', scope.onMouseUp);
				
			}
		};
	})

	.directive('elementDiagramDetail', function () {
		return {
			restrict: "AE",
			replace: true,
			scope: {
				selectedShape: '=ngModel',
				onDelete: '&'
			},
			controller: 'FlowDetailCtrl',
			templateUrl: 'views/prerequisite/flows/flow.detail.tmpl.html'
		};
	});

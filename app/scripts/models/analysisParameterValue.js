angular.module('APP')
	.factory('AnalysisParameterValue', function (Context, Organization, AnalysisParameter, ResourceService) {
		
		function AnalysisParameterValue(obj) {
			
			if (obj) {
				
				obj.id ? this.id = obj.id : null;
				
				obj.context ? this.context = new Context(obj.context) : null;
				obj.analysisParameter ? this.analysisParameter = new AnalysisParameter(obj.analysisParameter) : null;
				
			} else {
				
				this.context = null;
				this.analysisParameter = null;
				
			}
			
			var selectedOrganization = ResourceService.getSelectedOrganization();
			this.organization = Organization.parse(selectedOrganization);
			
			this.date = new Date();
			this.value = 0;
			this.note = null;
			
		}
		
		AnalysisParameterValue.parse = function (obj) {
			
			if (obj != null) {
				
				var analysisParameterValue = new AnalysisParameterValue();
				
				analysisParameterValue.id = obj.id;
				
				analysisParameterValue.organization = Organization.parse(obj.organization);
				analysisParameterValue.context = Context.parse(obj.context);
				analysisParameterValue.analysisParameter = AnalysisParameter.parse(obj.analysisParameter);
				
				analysisParameterValue.name = obj.name;
				analysisParameterValue.date = obj.date;
				analysisParameterValue.value = obj.value;
				analysisParameterValue.note = obj.note;
				
				analysisParameterValue.deleted = obj.deleted;
				
				return analysisParameterValue;
				
			} else {
				
				return null;
				
			}
			
		};
		
		return AnalysisParameterValue;
	});
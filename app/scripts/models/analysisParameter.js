angular.module('APP')
	.factory('AnalysisParameter', function (Organization, UserRole, ResourceService) {
		
		function AnalysisParameter(obj) {
			
			if (obj) {
				
				obj.id ? this.id = obj.id : null;
				
				obj.userRole ? this.userRole = new UserRole(obj.userRole) : null;
				
			} else {
				
				this.userRole = null;
				
			}
			
			var selectedOrganization = ResourceService.getSelectedOrganization();
			this.organization = Organization.parse(selectedOrganization);
			
			this.name = null;
			this.description = null;
			this.thresholdValue = 0;
			
		}
		
		AnalysisParameter.parse = function (obj) {
			
			if (obj != null) {
				
				var analysisParameter = new AnalysisParameter();
				
				analysisParameter.id = obj.id;
				
				analysisParameter.organization = Organization.parse(obj.organization);
				analysisParameter.userRole = UserRole.parse(obj.userRole);
				
				analysisParameter.name = obj.name;
				analysisParameter.description = obj.description;
				analysisParameter.thresholdValue = obj.thresholdValue;
				
				analysisParameter.deleted = obj.deleted;
				
				return analysisParameter;
				
			} else {
				
				return null;
				
			}
			
		};
		
		return AnalysisParameter;
		
	});
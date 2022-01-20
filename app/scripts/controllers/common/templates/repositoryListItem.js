
angular.module('APP')
  .controller('RepositoryListItemCtrl', function ($scope, $state, $translate, $q) {
    
  	$scope.documents =  {
    	'a_cespiti_creazione' :  { 
    			items: [
 					{
    				title : "Proc.Reg. Sicilia 123/2015",
    				date: new Date(),
    				version: 1.0,
    				filename: "proc1.pdf",
    				fileSize: 100,
    				status: 0
    			},
    			{
    				title : "Proc.Reg. Sicilia 123/2015",
    				date: new Date(),
    				version: 1.1,
    				filename: "proc1.pdf",
    				fileSize: 110,
    				status: 1
    			},
    			{
    				title : "Proc.Reg. Sicilia 123/2015",
    				date: new Date(),
    				version: 2.0,
    				filename: "proc1.pdf",
    				fileSize: 80,
    				status: 2
    			}
    		]
    	}
    };
    



});
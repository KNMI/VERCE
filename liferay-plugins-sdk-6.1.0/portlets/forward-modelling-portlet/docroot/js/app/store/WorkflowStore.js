 
 /* call to update ASM repository with run description

Ext.Ajax.request({
Ê Ê Ê Ê Ê Ê Ê Ê Ê Ê url:ÊupdateWorkflowDescriptionURL,
Ê Ê Ê Ê Ê Ê Ê Ê Ê Ê params: {
Ê Ê Ê Ê Ê Ê Ê Ê Ê Ê "workflowId": "name0434598495872934",
			"newText":"blabla"
Ê Ê Ê Ê Ê Ê Ê Ê Ê Ê },
Ê});

wfStore.load();

*/

 
 						
 Ext.define('CF.model.Worflow', {
    extend: 'Ext.data.Model',
 
  fields : [
  		     
            {name: 'runId', type: 'string', mapping:'_id'},
            {name: 'name', type: 'string', mapping:'name'},
            {name: 'description', type: 'string', mapping:'description'},
            {name: 'date', type: 'string', mapping:'startTime'}
            
            
        	], 
});
 						


 

/**
 * The store used for summits
 */
Ext.define('CF.store.WorkflowStore', { 
 						  extend:'Ext.data.Store',
 						  restful: true,
   						  requires: [
    							'Ext.grid.*',
							    'Ext.data.*',
							    'Ext.util.*',
							    'Ext.grid.plugin.BufferedRenderer'
   							 		],
   						 
   						  model:   'CF.model.Worflow',
   						  alias: 'store.workflowstore',
   						  storeId: 'workflowStore',
   						   
   						  // allow the grid to interact with the paging scroller by buffering
   					     buffered: true,
   					     leadingBufferZone: 30,
   					     pageSize: 15,
     				     
 					     
				         proxy:	{
 											type: 'ajax',
   							 actionMethods: { read: 'GET', update: 'POST', destroy: 'DELETE' },
    
  						     api: {
        read: '/j2ep-1.0/prov/workflow/'+userSN,
        update: '/j2ep-1.0/prov/workflow',
        destroy: '/j2ep-1.0/prov/workflow',
	    },
	   	
	  reader: {
   	          root: 'runIds',
              totalProperty: 'totalCount'
  	          },
  	           simpleSortMode: true
    
     			   } 	,				    
    		
     					   
     				
     					   
     		listeners:
            {
                
                update:
                {
                    fn: function(s,r,o) {
                    
                    Ext.Ajax.request({method:'POST',
Ê Ê Ê Ê Ê Ê Ê Ê Ê Ê					  url:Ê'/j2ep-1.0/prov/workflow/'+r.get('runId'),
Ê Ê Ê Ê Ê Ê Ê Ê Ê 					Ê params: {
Ê Ê Ê Ê Ê Ê Ê Ê Ê Ê 							
												"doc":'{ "description":"'+r.get('description')+'"}'
Ê Ê Ê Ê Ê Ê Ê Ê Ê Ê 							},
Ê										
										failure: function(response){
  				 												       
  				 												       alert("Workflow Run update failed")
  				 												     
  				 												       
  				 												       },
  				 												       
  				 						success: function(response) {
  				 												       
  																 	 Ext.Ajax.request({
Ê Ê Ê 													Ê Ê Ê Ê Ê Ê Êurl:ÊupdateWorkflowDescriptionURL,
Ê Ê													 Ê Ê Ê Ê Ê Ê Ê Ê params: {
Ê Ê 												Ê Ê Ê Ê Ê Ê Ê Ê "workflowId": r.get('runId'),
																	"newText":r.get('description')
Ê Ê Ê Ê Ê Ê Ê Ê Ê Ê 												},
																	 success: function(response){
  				 												       
  				 												       wfStore.load();
  				 												       }
																	Ê});

																		
																	}
  				 												       
  				 	
										});

                    },
                 
                  destroy:
                {
                    fn: function(s,r,o) {
                    alert("XXXX");
                    Ext.Ajax.request({method:'DELETE',
Ê Ê Ê Ê Ê Ê Ê Ê Ê Ê					  url:Ê'/j2ep-1.0/prov/workflow/'+r.get('runId'),
									  failure: function(response){
  				 												       
  				 												       alert("Workflow Run update failed: Illegal characters")
  				 												     
  				 												       
  				 												       }
										});

                    
                }
                 
                } 
                 
                 
                }
            }
        
     				    
     				   
     				 
 						 
 						   
 						});



 
 

 
 						
 Ext.define('CF.model.Activity', {
    extend: 'Ext.data.Model',
 
  fields : [
  		     
            {name: 'ID', type: 'string', mapping:'_id'},
            {name: 'instanceId', type: 'string', mapping:'instanceId'},
            {name: 'parameters', type: 'string', mapping:'parameters'},
            {name: 'creationDate', type: 'string', mapping:'endTime'},  
            {name: 'errors', type: 'string' , mapping:'errors'},
            {name: 'iterationIndex', type: 'string' , mapping:'iterationIndex'}
        	], 
});
 						


 

/**
 * The store used for summits
 */
Ext.define('CF.store.ActivityStore', { 
 						  extend:'Ext.data.Store',
   						  requires: [
    							'Ext.grid.*',
							    'Ext.data.*',
							    'Ext.util.*',
							    'Ext.grid.plugin.BufferedRenderer'
   							 		],
   						 
   						  model:   'CF.model.Activity',
   						  alias: 'store.activitystore',
   						  storeId: 'activityStore',
   						   
   						  // allow the grid to interact with the paging scroller by buffering
   					     buffered: true,
   					     leadingBufferZone: 30,
   					     pageSize: 300,
     				     
 					     
				        
     				 
 						 
 						   
 						});



 
 

 
 						
 Ext.define('RS.model.Artifact', {
    extend: 'Ext.data.Model',
 
  fields : [
  		     
            {name: 'ID', type: 'string', mapping:'_id'},
            {name: 'metadata', type: 'string', mapping:'metadata'},
            {name: 'annotations', type: 'string', mapping:'annotations'},
            {name: 'location', type: 'string', mapping:'creationDate'}, // custom mapping
            
            
        	], 
});
 						


 

/**
 * The store used for summits
 */
Ext.define('RS.store.ArtifactStore', { 
 						  extend:'Ext.data.Store',
   						  requires: [
    							'Ext.grid.*',
							    'Ext.data.*',
							    'Ext.util.*',
							    'Ext.grid.plugin.BufferedRenderer'
   							 		],
   						 
   						  model:   'RS.model.Artifact',
   						  alias: 'store.artifactstore',
   						  storeId: 'artifactStore',
   						   
   						  // allow the grid to interact with the paging scroller by buffering
   					     buffered: true,
   					     leadingBufferZone: 30,
   					     pageSize: 300,
     				     
 					     
				         proxy: {
            // load using script tags for cross domain, if the data in on the same domain as
            // this page, an Ajax proxy would be better
   				         type: 'ajax',
  				          url: '/j2ep-1.0/prov/streamchunk/?runid=http%3A%2F%2Flocalhost%3A8080%2FDispelGateway%2Fservices%2Fprocess-6bd8e593-0847-443e-a842-e69635c2c2c6&id=orfeus-wifi.local-c5494abe-efaa-11e2-9721-34159e074480',
  				          reader: {
   						             root: 'activities',
  						             totalProperty: 'totalCount'
  						          },
  						  simpleSortMode: true
    
     					   },
        
     				    
     				   
     				 
 						 
 						   
 						});



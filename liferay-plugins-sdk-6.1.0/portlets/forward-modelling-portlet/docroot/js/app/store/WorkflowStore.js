
 Ext.define('CF.model.Worflow', {
     extend: 'Ext.data.Model',

     fields: [

         {
             name: 'runId',
             type: 'string',
             mapping: '_id'
         }, {
             name: 'name',
             type: 'string',
             mapping: 'name'
         }, {
             name: 'description',
             type: 'string',
             mapping: 'description'
         }, {
             name: 'date',
             type: 'string',
             mapping: 'startTime'
         }


     ],
 });
 
 
 
  
 /**
  * The store used for summits
  */
 Ext.define('CF.store.WorkflowStore', {
     extend: 'Ext.data.Store',
     restful: true,
     requires: [
         'Ext.grid.*',
         'Ext.data.*',
         'Ext.util.*',
         'Ext.grid.plugin.BufferedRenderer'
     ],

     model: 'CF.model.Worflow',
     alias: 'store.workflowstore',
     storeId: 'workflowStore',

     // allow the grid to interact with the paging scroller by buffering
     trailingBufferZone: 60,
     buffered: true,
     leadingBufferZone: 10,
     pageSize: 10,


     proxy: {
         type: 'ajax',
         actionMethods: {
             read: 'GET',
             update: 'POST',
             destroy: 'POST'
         },

         api: {
             read: PROV_SERVICE_BASEURL + 'workflow/user/' + userSN,
             update: PROV_SERVICE_BASEURL + 'workflow',
             destroy: PROV_SERVICE_BASEURL + 'workflow/delete/',
         },

         reader: {
             root: 'runIds',
             totalProperty: 'totalCount'
         },
         simpleSortMode: true

     },




     listeners: {
     

         update: {
             fn: function (s, r, o) {

                 Ext.Ajax.request({
                     method: 'POST',
                               url:  PROV_SERVICE_BASEURL + 'workflow/edit/' + r.get('runId'),
                               params: {          
                         "doc": '{ "description":"' + r.get('description') + '"}'          
                     },
                      
                     failure: function (response) {

                         alert("Workflow Run update failed")


                     },

                     success: function (response) {

                         Ext.Ajax.request({          
                             url:  updateWorkflowDescriptionURL,
                                       params: {          
                                 "workflowId": r.get('runId'),
                                 "newText": r.get('description')          
                             },
                             success: function (response) {

                                 wfStore.load();
                             } 
                         });


                     }


                 });

             }


         },
         destroy: {
             fn: function (s, r, o) {
				
                 Ext.Ajax.request({
                     method: 'POST',
                               url:  PROV_SERVICE_BASEURL + 'workflow/delete/' + r.get('runId'),
                               params: {          
                         "doc": '{ "description":"' + r.get('description') + '"}'          
                     },
                      
                     failure: function (response) {

                         alert("Workflow Run update failed")


                     },

                     success: function (response) {

                         Ext.Ajax.request({          
                             url:  updateWorkflowDescriptionURL,
                                       params: {          
                                 "workflowId": r.get('runId'),
                                 "newText": r.get('description')          
                             },
                             success: function (response) {

                                 wfStore.load();
                             } 
                         });


                     }


                 });

             }


         }
         
     }




 });
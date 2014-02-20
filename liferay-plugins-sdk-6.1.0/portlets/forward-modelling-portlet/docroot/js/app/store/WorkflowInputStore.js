

*/
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
 
 
 
 Ext.define('CF.model.WorkflowInput', {
     extend: 'Ext.data.Model',

     fields: [

         {
             name: 'url',
             type: 'string',
             mapping: 'url'
         }, {
             name: 'mimetype',
             type: 'string',
             mapping: 'mime-type'
         }, {
             name: 'name',
             type: 'string',
             mapping: 'name'
         }


     ],
 });



Ext.define('CF.store.WorkflowInputStore', {
	extend:'Ext.data.Store',
   	requires:['CF.model.WorkflowInput'],
   	model:   'CF.model.WorkflowInput',
   	alias: 'store.workflowinput',
   	storeId: 'workflowinputStore'
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
     buffered: true,
     leadingBufferZone: 30,
     pageSize: 15,


     proxy: {
         type: 'ajax',
         actionMethods: {
             read: 'GET',
             update: 'POST',
             destroy: 'DELETE'
         },

         api: {
             read: '/j2ep-1.0/prov/workflow/user/aspinuso',
             update: '/j2ep-1.0/prov/workflow/user/aspinuso',
             destroy: '/j2ep-1.0/prov/workflow/user/aspinuso',
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
                               url:  '/j2ep-1.0/prov/workflow/' + r.get('runId'),
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
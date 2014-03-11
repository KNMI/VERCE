
 Ext.define('RS.model.WorkflowInput', {
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



Ext.define('RS.store.WorkflowInputStore', {
	extend:'Ext.data.Store',
   	requires:['RS.model.WorkflowInput'],
   	model:   'RS.model.WorkflowInput',
   	alias: 'store.workflowinput',
   	storeId: 'workflowinputStore'
});



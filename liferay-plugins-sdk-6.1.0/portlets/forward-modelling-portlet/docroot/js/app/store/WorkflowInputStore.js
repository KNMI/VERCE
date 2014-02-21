
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



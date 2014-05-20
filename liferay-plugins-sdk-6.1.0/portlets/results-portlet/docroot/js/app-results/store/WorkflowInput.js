Ext.define('RS.store.WorkflowInput', {
  extend: 'Ext.data.Store',
  requires: ['RS.model.WorkflowInput'],
  model: 'RS.model.WorkflowInput',
  alias: 'store.workflowinput',
  storeId: 'workflowinputStore'
});
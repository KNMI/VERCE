Ext.define('RS.store.Workflow', {
  extend: 'Ext.data.ArrayStore',
  model: 'RS.model.Workflow',
  sortOnLoad: true,
  sorters: {
    property: 'date2',
    direction: 'DESC'
  }
});
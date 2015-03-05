Ext.define('CF.store.Workflow', {
  extend: 'Ext.data.BufferedStore',
  model: 'CF.model.Workflow',

  sortOnLoad: true,
  sorters: [{
    property: 'date2',
    direction: 'DESC'
  }],

  proxy: {
    type: 'ajax',
    url: getWorkflowListURL,
    reader: {
      rootProperty: 'list',
      totalProperty: 'totalCount',
    }
  },

  // trailingBufferZone: 15,
  leadingBufferZone: 30,
  // pageSize: 30,
  purgePageCount: 0,
  autoLoad: true,
});
Ext.define('CF.store.PE', {
  extend: 'Ext.data.TreeStore',
  requires: ['CF.model.PE'],
  model: 'CF.model.PE',
  folderSort: true,
  proxy: {
    type: 'memory',
    reader: {
      type: 'json',
      rootProperty: 'children',
    }
  }
});
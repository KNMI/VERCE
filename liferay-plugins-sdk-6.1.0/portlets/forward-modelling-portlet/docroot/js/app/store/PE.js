Ext.define('CF.store.PE', {
  extend: 'Ext.data.TreeStore',
  requires: ['CF.model.PE'],
  model: 'CF.model.PE',
  folderSort: true,
  proxy: {
    type: 'ajax',
    url: '/j2ep-1.0/node/pe.json',
    reader: {
      type: 'json',
      rootProperty: 'children',
    }
  },
});
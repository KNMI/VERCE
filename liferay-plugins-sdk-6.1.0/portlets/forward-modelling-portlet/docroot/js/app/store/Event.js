Ext.define('CF.store.Event', {
  extend: 'Ext.data.Store',
  requires: ['CF.model.Event'],
  model: 'CF.model.Event',
  alias: 'store.event',
  storeId: 'eventStore',
  pageSize: 10
});
Ext.define('CF.store.Station', {
  extend: 'Ext.data.Store',
  requires: ['CF.model.Station'],
  model: 'CF.model.Station',
  alias: 'store.station',
  storeId: 'stationStore'
});
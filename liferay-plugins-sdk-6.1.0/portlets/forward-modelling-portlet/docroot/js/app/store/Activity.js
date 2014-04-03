/**
 * The store used for summits
 */
Ext.define('CF.store.Activity', {
  extend: 'Ext.data.Store',
  requires: [
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.grid.plugin.BufferedRenderer',
    'CF.model.Activity'
  ],

  model: 'CF.model.Activity',
  alias: 'store.activity',
  storeId: 'activityStore',

  // allow the grid to interact with the paging scroller by buffering
  buffered: true,
  leadingBufferZone: 30,
  pageSize: 300
});
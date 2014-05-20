/**
 * The store used for summits
 */
Ext.define('RS.store.Artifact', {
  extend: 'Ext.data.Store',
  requires: [
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.grid.plugin.BufferedRenderer',
    'RS.model.Artifact'
  ],

  model: 'RS.model.Artifact',
  alias: 'store.artifact',
  storeId: 'artifactStore',
  /*buffered: true,
    leadingBufferZone: 30,*/
  pageSize: 1000
});
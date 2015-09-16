/**
 * The store used for submits
 */
Ext.define('CF.store.MisfitConf', {
  extend: 'Ext.data.Store',
  requires: ['CF.model.Conf'],
  model: 'CF.model.Conf',
  storeId: 'misfitConfStore',
  groupField: 'group'
});
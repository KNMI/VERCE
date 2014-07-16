var providers = [{
  "abbr": "INGV",
  "name": "Istituto Nazionale di Geofisica e Vulcanologia"
}];

Ext.define('CF.store.Provider', {
  extend: 'Ext.data.Store',
  model: 'CF.model.Provider',
  data: providers
});
var providers = [{
  "abbr": "INGV",
  "name": "Istituto Nazionale di Geofisica e Vulcanologia",
  "url": "/j2ep-1.0/ingv",
}, {
  "abbr": "GCMT",
  "name": "Global Centroid Moment Tensor Catalog",
  "url": "/j2ep-1.0/gcmt",
}];

Ext.define('CF.store.Provider', {
  extend: 'Ext.data.Store',
  model: 'CF.model.Provider',
  data: providers
});
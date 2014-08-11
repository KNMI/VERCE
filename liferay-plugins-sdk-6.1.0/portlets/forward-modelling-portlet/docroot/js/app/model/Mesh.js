Ext.define("CF.model.Mesh", {
  extend: "Ext.data.Model",
  fields: [{
    type: 'string',
    name: 'name'
  }, {
    type: 'number',
    name: 'geo_minLat'
  }, {
    type: 'number',
    name: 'geo_maxLat'
  }, {
    type: 'number',
    name: 'geo_minLon'
  }, {
    type: 'number',
    name: 'geo_maxLon'
  }, {
    type: 'string',
    name: 'geo_proj'
  }, {
    type: 'auto',
    name: 'velmod'
  }, {
    type: 'auto',
    name: 'values'
  }]
});
Ext.define("CF.model.Mesh", {
  extend: "Ext.data.Model",
  fields: [{
    type: 'string',
    name: 'name'
  }, {
    type: 'int',
    name: 'geo_minLat'
  }, {
    type: 'int',
    name: 'geo_maxLat'
  }, {
    type: 'int',
    name: 'geo_minLon'
  }, {
    type: 'int',
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
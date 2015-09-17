Ext.define("CF.model.MisfitType", {
  extend: "Ext.data.Model",
  fields: [{
    type: 'string',
    name: 'name'
  }, {
    type: 'auto',
    name: 'parameters'
  }]
});
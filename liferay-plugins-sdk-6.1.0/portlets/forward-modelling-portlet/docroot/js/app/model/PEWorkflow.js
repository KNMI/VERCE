Ext.define('CF.model.PEWorkflow', {
  extend: 'Ext.data.Model',
  fields: [{
    name: 'name',
    type: 'string'
  }, {
    name: 'include_visu',
    type: 'boolean'
  }, {
    name: 'include_store',
    type: 'boolean'
  }]
});
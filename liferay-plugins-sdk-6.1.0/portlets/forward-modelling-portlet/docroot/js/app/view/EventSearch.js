var providersStore = Ext.create('CF.store.Provider');

// ComboBox with multiple selection enabled
Ext.define('CF.view.ProvidersCombo', {
  extend: 'Ext.form.field.ComboBox',
  alias: 'widget.ProvidersCombo',
  fieldLabel: 'Providers',
  id: 'event_catalog',
  name: 'catalog',
  displayField: 'abbr',
  width: 300,
  labelWidth: 130,
  colspan: 4,
  store: providersStore,
  value: 'INGV',
  queryMode: 'local',
  getInnerTpl: function() {
    return '<div data-qtip="{abbr}">{abbr} {name}</div>';
  }
});

Ext.define('CF.view.EventSearchForm', {
  extend: 'Ext.form.Panel',
  alias: 'widget.EventSearchForm',
  width: 500,
  frame: false,
  border: false,
  bodyPadding: '10 10 0 10',
  layout: {
    type: 'table',
    columns: 4
  },
  defaults: {
    bodyStyle: 'padding:5px;text-align:center;'
  },
  defaultType: 'numberfield',
  items: [{
    xtype: 'ProvidersCombo'
  }, {
    xtype: 'label',
    forId: '',
    text: '',
    margin: '10 15 0 0'
  }, {
    xtype: 'label',
    forId: 'Mag',
    text: 'Mag',
    margin: '10 10 0 0'
  }, {
    xtype: 'label',
    forId: 'Depth',
    text: 'Depth',
    margin: '10 10 0 0'
  }, {
    xtype: 'label',
    forId: 'Time',
    text: 'Time',
    margin: '10 10 0 0'
  }, {
    xtype: 'label',
    forId: 'Min',
    text: 'Min',
    margin: '4 15 0 0'
  }, {
    name: 'minmag',
    allowBlank: false,
    value: 4,
    width: 100,
    margin: '4 10 0 0'
  }, {
    name: 'mindepth',
    allowBlank: false,
    value: 0,
    margin: '4 10 0 0'
  }, {
    xtype: 'datefield',
    // fieldLabel: 'Start Time',
    name: 'starttime',
    format: 'Y-m-d\\TH:i:s',
    value: "2013-01-01T00:00:00",
    margin: '4 5 0 0'
  }, {
    xtype: 'label',
    forId: 'Max',
    text: 'Max',
    margin: '5 15 5 0'
  }, {
    name: 'maxmag',
    allowBlank: false,
    value: 9,
    width: 100,
    margin: '5 10 5 0'
  }, {
    name: 'maxdepth',
    allowBlank: false,
    value: 100000,
    margin: '5 10 5 0'
  }, {
    xtype: 'datefield',
    //	fieldLabel: 'End Time',
    name: 'endtime',
    format: 'Y-m-d\\TH:i:s',
    value: "2013-08-02T00:00:00",
    margin: '5 5 5 0'
  }],
  buttons: [{
    itemId: 'event_but', //action defined in controller/Map.js
    text: 'Search'
  }, {
    itemId: 'event_cl_but',
    text: 'Clear'
  }]
});

Ext.define('CF.view.EventSearch', {
  extend: 'Ext.form.Panel',
  alias: 'widget.eventsearch',
  bodyPadding: '0 0 10 0',
  items: [{
    xtype: 'EventSearchForm'
  }]
});
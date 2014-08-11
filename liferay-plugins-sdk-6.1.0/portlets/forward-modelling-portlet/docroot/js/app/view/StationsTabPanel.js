Ext.define('CF.view.StationsTabPanel', {
  extend: 'Ext.TabPanel',
  alias: 'widget.stationstabpanel',
  requires: ['CF.view.StationSearchByFile', 'CF.view.StationSearch'],
  border: false,
  layout: {
    type: 'vbox',
    align: 'stretch'
  },
  items: [{
    xtype: 'panel',
    title: 'FDSN',
    border: false,
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    items: [{
      xtype: 'stationsearch'
    }]
  }, {
    xtype: 'panel',
    title: 'File',
    border: false,
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    items: [{
      xtype: 'StationSearchByFile'
    }]
  }]
});
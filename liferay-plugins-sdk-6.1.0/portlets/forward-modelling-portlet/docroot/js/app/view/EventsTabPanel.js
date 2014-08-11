Ext.define('CF.view.EventsTabPanel', {
  extend: 'Ext.TabPanel',
  alias: 'widget.eventstabpanel',
  requires: ['CF.view.EventSearchByFile', 'CF.view.EventSearch'],
  region: 'center',
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
      xtype: 'eventsearch'
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
      xtype: 'eventsearchbyfile'
    }]
  }]
});
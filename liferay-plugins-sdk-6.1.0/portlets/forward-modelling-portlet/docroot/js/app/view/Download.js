Ext.define('CF.view.Download', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.download_panel',
  requires: [
    'Ext.layout.container.Border'
  ],
  layout: 'border', // border
  height: "100%",
  bodyBorder: false,

  defaults: {
    collapsible: false,
    split: true,
    bodyPadding: 0
  },

  items: [{
    xtype: 'cf_mappanel',
    region: 'west',
  }, {
    xtype: 'tabpanel',
    region: 'center',
    layout: 'fit',
    bodyBorder: false,

    items: [{
      xtype: 'panel',
      layout: 'border', // border
      height: "100%",
      title: 'Setup',
      bodyBorder: false,

      defaults: {
        collapsible: false,
        split: true,
        bodyPadding: 0
      },

      items: [],
    }, {
      xtype: 'panel',
      layout: 'border', // border
      height: "100%",
      title: 'Submit',
      bodyBorder: false,

      defaults: {
        collapsible: false,
        split: true,
        bodyPadding: 0
      },
    }, {
      xtype: 'panel',
      title: 'Control',
      border: false,
      layout: 'fit',
      items: [{
        xtype: 'control'
      }]
    }],
  }],
});
Ext.define('CF.view.Simulation', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.simulation_panel',
  layout: 'border',
  defaults: {
    split: true
  },
  items: [{
    xtype: 'cf_mappanel'
  }, {
    xtype: 'tabpanel', // Search & Upload
    region: 'center',
    border: false,
    id: 'tabpanel_principal',
    name: 'tabpanel_principal',
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    deferredRender: false,
    items: [{
      xtype: 'panel',
      title: 'Solver',
      border: false,
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: [{
        xtype: 'solverselect'
      }, {
        xtype: 'solverconf'
      }]
    }, {
      xtype: 'panel',
      title: 'Earthquakes',
      id: 'earthquakes',
      name: 'earthquakes',
      border: false,
      disabled: true,
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: [{
        xtype: 'eventstabpanel'
      }, {
        xtype: 'eventgrid'
      }]
    }, {
      xtype: 'panel',
      title: 'Stations',
      id: 'stations',
      name: 'stations',
      disabled: true,
      border: false,
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: [{
        xtype: 'stationstabpanel'
      }, {
        xtype: 'stationgrid'
      }]
    }, {
      xtype: 'panel',
      title: 'Submit',
      id: 'submit',
      disabled: true,
      border: false,
      height: '100%',
      layout: {
        type: 'fit',
        // align: 'stretch',
      },
      items: [{
        xtype: 'submit'
      }]
    }, {
      xtype: 'panel',
      title: 'Control',
      border: false,
      layout: 'fit',
      items: [{
        xtype: 'control',
        filters: [{
          property: 'type',
          value: 'download',
        }]
      }]
    }],
    listeners: {
      'tabchange': function(tabPanel, tab) {
        if (tab.id == "submit") updateSubmitOverview();
      },
    }
  }]
});
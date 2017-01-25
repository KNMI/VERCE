var networksStore = Ext.create('CF.store.Network', {});

var stationProvidersStore = Ext.create('CF.store.Provider', {
  data: [{
    abbr: "ODC",
    url: "/j2ep-1.0/odc"
  }, {
    abbr: "IRIS",
    url: "/j2ep-1.0/iris"
  }]
});

// ComboBox with multiple selection enabled
Ext.define('CF.view.MultiCombo', {
  extend: 'Ext.form.field.ComboBox',
  alias: 'widget.multicombo',
  fieldLabel: 'Networks',
  name: 'net',
  displayField: 'abbr',
  valueField: 'abbr',
  width: 300,
  store: networksStore,
  queryMode: 'local',
  allowBlank: false,
  multiSelect: true,
  getInnerTpl: function() {
    return '<div data-qtip="{abbr}">{abbr} {name}</div>';
  },
  listeners: {
    change: function(multicombo, value, display) {
      multicombo.up('form').down('#station_but').enable();
    }
  }
});

Ext.define('CF.view.StationSearchPanel', {
  extend: 'Ext.form.Panel',
  alias: 'widget.StationSearchPanel',
  requires: ['CF.model.Station'],
  width: 450,
  frame: false,
  border: false,
  bodyPadding: '10 10 0 10',
  errorReader: {
    type: 'xml',
    model: 'CF.model.Station'
  },
  items: [{
    xtype: 'combobox',
    fieldLabel: "Provider:",
    id:"station_catalog",
    // store is going to be updated later when a user selects a type of solver    
    //store: stationProvidersStore,
    displayField: 'abbr',
    valueField: 'url',
    queryMode: 'local',
    listeners: {
      change: function(combobox, value, display) {
        networksStore.removeAll();
        combobox.up('panel').down('multicombo').disable();
        Ext.Ajax.request({
          type: 'GET',
          url: value + '/fdsnws/station/1/query?level=network',
          dataType: 'xml',
          disableCaching: false,
          success: function(response) {
            comboNetworks = [];
            comboNetworks.push({
              abbr: '*',
              name: '*'
            });
            var xml = response.responseText;

            $('Network', xml).each(function() {
              var net = {
                abbr: $(this).attr('code'),
                name: $('Description', this).text()
              };
              comboNetworks.push(net);
            });
            networksStore.add(comboNetworks);
            if(Ext.getCmp('solvertype').getValue() == "SPECFEM3D_GLOBE") 
        	{ 
            	combobox.up('panel').down('multicombo').setValue('II,IU');
        	}
            else
            {
            	combobox.up('panel').down('multicombo').setValue('*');
            }
            combobox.up('panel').down('multicombo').enable();
          },
          failure: function() {
            comboNetworks = [];
            var net = {
              abbr: "Error",
              name: "Error: please reload the page to see the networks"
            };
            comboNetworks.push(net);
            networksStore.add(comboNetworks);
          }
        });
      }
    }
  }, {
    xtype: 'multicombo',
    disabled: true
  }],
  buttons: [{
    itemId: 'station_but',
    disabled: true,
    text: 'Search'
  }, {
    itemId: 'station_cl_but',
    text: 'Clear'
  }]
});

Ext.define('CF.view.StationSearch', {
  extend: 'Ext.form.Panel',
  alias: 'widget.stationsearch',
  bodyPadding: '0 0 10 0',
  items: [{
    xtype: 'StationSearchPanel'
  }]
});

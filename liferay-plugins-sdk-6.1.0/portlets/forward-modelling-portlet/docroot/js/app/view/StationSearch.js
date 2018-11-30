var networksStore = Ext.create('CF.store.Network', {});

//stationProvidersStore data now depends on the type of solver to be selected. This will be updated once a user has selected a solver    
var stationProvidersStore = Ext.create('CF.store.Provider', {});

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
            multicombo.up('form').down('#station_btn').enable();
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
        id: "station_catalog",
        store: stationProvidersStore,
        displayField: 'abbr',
        valueField: 'url',
        queryMode: 'local',
        listeners: {
            change: function(combobox, value, display) {
                networksStore.removeAll();
                combobox.up('panel').down('multicombo').disable();
                Ext.Ajax.request({
                    method: 'GET',
                    url: value + '/fdsnws/station/1/query?level=network' +
                        (Ext.getCmp('solvertype').getValue() == "SPECFEM3D_GLOBE" && combobox.getSelectedRecord() && combobox.getSelectedRecord().data && combobox.getSelectedRecord().data["extraParams"] ? combobox.getSelectedRecord().data["extraParams"] : ""),

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
                        combobox.up('panel').down('multicombo').setValue('*');
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
        itemId: 'station_btn',
        disabled: true,
        text: 'Search'
    }, {
        itemId: 'station_cl_btn',
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

Ext.Ajax.request({
	type: 'GET', 
    url: '/j2ep-1.0/odc/fdsnws/station/1/query?level=network',
    dataType: 'xml', 
    success: function(response){ 
    	comboNetworks = [];
    	var xml = response.responseText;

    	$('Network', xml).each(function() {
    		var net = {abbr: $(this).attr('code'), name: $('Description', this).text()};
    		comboNetworks.push(net);
        });
    	networksStore.add(comboNetworks);
    },
	failure: function(){ 
		comboNetworks = [];
		var net = {abbr: "Error", name: "Error: please reload the page to see the networks"};
		comboNetworks.push(net);
		networksStore.add(comboNetworks);
	}
});

var networks = [];

Ext.regModel('NetworkCombo', {
    fields: [
        {type: 'string', name: 'abbr'},
        {type: 'string', name: 'name'}
    ]
});

var networksStore = Ext.create('Ext.data.Store', {
    model: 'NetworkCombo',
    data: networks
});

// ComboBox with multiple selection enabled
var multiCombo = Ext.create('Ext.form.field.ComboBox', {
    fieldLabel: 'Networks',
    name: 'net',
    displayField: 'abbr',
    allowBlank: false,
    width: 300,
    labelWidth: 130,
    store: networksStore,
    queryMode: 'local',
    allowBlank: true,
    getInnerTpl: function() {
        return '<div data-qtip="{abbr}">{abbr} {name}</div>';
    }
});

var formStationSearch = Ext.create('Ext.form.Panel', {   
	width: 450,
    frame: false,
    border: false,
    bodyPadding: '10 10 0 10',
    errorReader : {
    	  type : 'xml',
  	  model: 'Station'
  	},    
      items: [multiCombo],
      buttons: [
      {
      	itemId: 'station_but',
          text: 'Search'
      },
      {
      	itemId: 'station_cl_but',
          text: 'Clear'   
      }]
  });

Ext.define('CF.view.StationSearch', {
	  extend:'Ext.form.Panel',
	  bodyPadding: '0 0 10 0',
	  items: [formStationSearch]
	});

    

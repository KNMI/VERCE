

 var providers = [
        {"abbr":"G","name":"GEOSCOPE"},
        {"abbr":"AU","name":"Geoscience Australia"},
        {"abbr":"AZ","name":"ANZA Regional Network"},
        {"abbr":"BK","name":"Berkeley Digital Seismograph Network"}
        
    ];

Ext.regModel('ProvidersCombo', {
    fields: [
        {type: 'string', name: 'abbr'},
        {type: 'string', name: 'name'}
        
    ]
});

	




// The data store holding the states
var store = Ext.create('Ext.data.Store', {
    model: 'ProvidersCombo',
    data: providers
});



// ComboBox with multiple selection enabled
var providerscombo = Ext.create('Ext.form.field.ComboBox', {
    fieldLabel: 'Providers',
    name: 'auth',
    displayField: 'abbr',
    width: 300,
    labelWidth: 130,
    store: store,
    queryMode: 'local',
    getInnerTpl: function() {
        return '<div data-qtip="{abbr}">{abbr} {name}</div>';
    }
});


Ext.define('CF.view.EventSearch', {
     extend:'Ext.form.Panel',
     alias: 'widget.mypanel',
    
    // configure how to read the XML Data
    
    
     errorReader : {
  			  type : 'xml',
		      model: 'Station'
    
		},
     
    items: [providerscombo,
    {
        fieldLabel: 'Max Mag',
        name: 'magMax',
        allowBlank: false
    }, {
        fieldLabel: 'Min Mag',
        name: 'magMin',
        allowBlank: false
    }

   			 
            ],
     buttons: [{
    	itemId: 'event_but',
        text: 'Search'
       
    },
    {
    	itemId: 'event_cl_but',
        text: 'Clear'
       
    }]
});

    

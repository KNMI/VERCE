

 var providers = [
        {"abbr":"EMSC","name":"European blah.."},
        {"abbr":"GFZ","name":"Geo..Germany"},
        {"abbr":"INGV","name":"Istituto Nazionale di Geofisica e Vulcanologia"}
        
        
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
    valueField: 'abbr',
    width: 300,
    labelWidth: 130,
    colspan: 3,
    store: store,
    value: eval("store.getAt('2').get('abbr')"),
    queryMode: 'local',
    getInnerTpl: function() {
        return '<div data-qtip="{abbr}">{abbr} {name}</div>';
    }
});


Ext.define('CF.view.EventSearch', {
     extend:'Ext.form.Panel',
     alias: 'widget.eventsearch',
    
    // configure how to read the XML Data
   
    layout: {
            type: 'table',
            columns: 3
        },
    defaultType:'numberfield',
    items: [providerscombo,
     {  style: 'font: normal 12px courier',
        xtype: 'label',
        forId: '',
        text: '',
        margins: '0 0 0 10'
    },
    {   style: 'font: normal 12px courier',
        xtype: 'label',
        forId: 'Mag',
        text: 'Mag',
        margins: '0 0 0 10'
    },
    {   style: 'font: normal 12px courier',
        xtype: 'label',
        forId: 'Depth',
        text: 'Depth',
        margins: '0 0 0 10'
    },
    {   style: 'font: normal 12px courier',
        xtype: 'label',
        forId: 'Max',
        text: 'Max',
        margins: '0 0 0 0'
    },
    {
        
        name: 'magMax',
        allowBlank: false,
        value:9
    }, 
    {
         
        name: 'depthMax',
        allowBlank: false,
        value:100
    },
     {
        xtype: 'label',
        style: 'font: normal 12px courier',
        forId: 'Min',
        text: 'Min',
        margins: '0 0 0 10'
    },{
        
        name: 'magMin',
        allowBlank: false,
        value:0
    },
    {
        
        name: 'depthMin',
        allowBlank: false,
        value:0
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

    

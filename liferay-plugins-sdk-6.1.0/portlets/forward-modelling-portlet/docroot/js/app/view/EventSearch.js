

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

var providersStore = Ext.create('Ext.data.Store', {
    model: 'ProvidersCombo',
    data: providers
});



// ComboBox with multiple selection enabled
var providerscombo = Ext.create('Ext.form.field.ComboBox', {
    fieldLabel: 'Providers',
    name: 'catalog',
    displayField: 'abbr',
    width: 300,
    labelWidth: 130,
    colspan: 4,
    store: providersStore,
    value:'INGV',
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
            columns: 4
        },
    defaultType:'numberfield',
    items: [
     providerscombo,    
     {  
    	style: 'font: normal 12px courier',
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
        forId: 'Time',
        text: 'Time',
        margins: '0 0 0 10'
    },
    {
        xtype: 'label',
        style: 'font: normal 12px courier',
        forId: 'Min',
        text: 'Min',
        margins: '0 0 0 0'
    },
    {
        
        name: 'minmag',
        allowBlank: false,
        value:4
    },
    {
        name: 'mindepth',
        allowBlank: false,
        value:0
    },
    {
        xtype: 'datefield',
   	  // fieldLabel: 'Start Time',
   	   name: 'starttime',
          format: 'Y-m-d\\TH:i:s',
          value: "2013-01-01T00:00:00"
    },
    {   style: 'font: normal 12px courier',
        xtype: 'label',
        forId: 'Max',
        text: 'Max',
        margins: '0 0 0 10'
    },
    {
        name: 'maxmag',
        allowBlank: false,
        value:9
    }, 
    {
        name: 'maxdepth',
        allowBlank: false,
        value:100000
    }, 
    {
      	xtype: 'datefield',
      //	fieldLabel: 'End Time',
          name: 'endtime',
          format: 'Y-m-d\\TH:i:s',
          value: "2013-08-02T00:00:00"
    },
    {
    	xtype: 'hidden',
    	name: 'user',
    	value: 'verce_'+userSN	//user screen name, it is populated in html/init.jsp
    }
            ],
     buttons: [{
    	itemId: 'event_but',		//action defined in controller/Map.js
        text: 'Search'
       
    },
    {
    	itemId: 'event_cl_but',
        text: 'Clear'
       
    }]
});

    

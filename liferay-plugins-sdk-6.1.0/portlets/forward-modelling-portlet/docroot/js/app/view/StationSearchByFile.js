Ext.require([
    'Ext.form.field.File',
    'Ext.form.field.ComboBox',
    'Ext.data.Store'
]);

var fileTypesStore = Ext.create('Ext.data.Store', {
    fields: ['abbr', 'name'],
    data: [{
        "abbr": STXML_TYPE,
        "name": "Station XML"
    }, {
        "abbr": STPOINTS_TYPE,
        "name": "List of points"
    }]
});

var fileTypes = Ext.create('Ext.form.ComboBox', {
    fieldLabel: 'File format',
    allowBlank: false,
    name: 'filetype',
    store: fileTypesStore,
    queryMode: 'local',
    displayField: 'name',
    valueField: 'abbr'
});

var form1 = Ext.create('Ext.form.Panel', {
    width: 500,
    frame: false,
    border: false,
    bodyPadding: '10 10 10 10',
    defaults: {
        anchor: '100%',
        allowBlank: false,
        msgTarget: 'side',
        labelWidth: 70
    },
    items: 
    [
	    {
	        xtype: 'textfield',
	        id: 'name',
	        name: 'name',
	        value: 'DefaultName',
	        fieldLabel: 'Name',
	        allowBlank: false,
	        
	    },
	    fileTypes,
	    {
	        xtype: 'filefield',
	        id: 'form-file',
	        emptyText: 'Select a file',
	        fieldLabel: 'File',
	        name: 'form-file',
	        buttonText: 'Browse...'
	    }
    ],
    buttons: [{ 
        text: 'Upload',
        handler: function(){
            var form = this.up('form').getForm();
            if(form.isValid()){
            	var n = form.getValues()['name'];
            	if(n.indexOf(" ") < 0)
            	{
            		gl_stFileType = form.getValues()['filetype'];
	                form.submit({
	                    url: uploadFileURL,
	                    waitMsg: 'Uploading your file...',
	                    success: function(fp, o) {
	                    	 getStations(ctrl, o.result.path, gl_stFileType);
	                    },
	                    failure: function(rec, op) {
	                    	Ext.Msg.alert("Error!", "Was not possible to upload the file");
	                    }
	                });
            	}
            	else
            	{
            		Ext.Msg.alert('Alert!',"The name cannot contain blankspaces");
            	}
            }
        }
    }]
});

var openMenuStations = [];
//openMenuStations.push("->");
openMenuStations.push({
    xtype: 'splitbutton',
    text: 'Open',
    menuAlign: 'tr-br',
    menu: {
        xtype: 'menu',
        plain: true,
        items: [
        	Ext.create('Ext.button.Button', {
        	    text: 'StationXML',     
        	    handler: function() {
        	    	gl_stFileType = STXML_TYPE;
        	    	fileSelection(STXML_TYPE);			//declared in Viewport.js
        	    }
        	}),
        	Ext.create('Ext.button.Button', {
        	    text: 'List of points',     
        	    handler: function() {
        	    	gl_stFileType = STPOINTS_TYPE;
        	    	fileSelection(STPOINTS_TYPE);			//declared in Viewport.js
        	    }
        	})
        ]
   	}
});

Ext.define('CF.view.StationSearchByFile', {
	  extend:'Ext.form.Panel',
	  dockedItems: [{
		    xtype: 'toolbar',
		    dock: 'top',
		    items: openMenuStations,
		    style: {
		        border: 0,
		        padding: 0
		    }
    }],
	  items: [form1]
	});

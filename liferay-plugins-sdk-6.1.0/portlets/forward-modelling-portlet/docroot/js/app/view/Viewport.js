/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */



var eventsTabPanel = Ext.create('Ext.TabPanel',{
    region: 'center',
    border: false,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [
                {
                    xtype: 'panel',
                    title: 'File',
                    border: false,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                            Ext.create('CF.view.EventSearchByFile'),
                           ]
                },
                {
                    xtype: 'panel',
                    title: 'WS',
                    border: false,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                            Ext.create('CF.view.EventSearch')
                           ]
                    
                }
          ],
    });

var stationsTabPanel = Ext.create('Ext.TabPanel',{
    border: false,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [
                {
                    xtype: 'panel',
                    title: 'File',
                    border: false,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                            Ext.create('CF.view.StationSearchByFile')
                           ]
                },
                {
                    xtype: 'panel',
                    title: 'WS',
                    border: false,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                            Ext.create('CF.view.StationSearch')
                           ]
                    
                }
          ]
    });
  


Ext.define('CF.view.Viewport', {
    extend: 'Ext.Viewport',
    layout: 'fit',
    requires: [
        'Ext.layout.container.Border',
        'Ext.resizer.Splitter',
        'CF.view.StationSearch',
        'CF.view.StationSearchByFile',
        'CF.view.Commons',
        'CF.view.EventSearch',
        'CF.view.ResultsPane',
        'CF.view.EventSearchByFile',
        'CF.view.Control',
        'CF.view.Map'
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(me, {  id: 'viewport',
            items: [{
                xtype: 'tabpanel',
                border: 'false',
                layout: 'border',
                defaults: {
                    split: true
                },
                items: [
                {
	                title:'Setup',
	                xtype: 'panel',
	                border: 'false',
	                layout: 'border',
	                defaults: {
	                    split: true
                },
                items:[
                    {
                        xtype: 'cf_mappanel'
                    },
                    {
                        xtype: 'tabpanel',		// Search & Upload
                        region: 'center',
                        border: false,
                        id:'tabpanel_principal',
                        name:'tabpanel_principal',
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [
	                                 {
		                                xtype: 'panel',
        				                title: 'Solver',
            				            border: false,
          					              layout: {
                 				           type: 'vbox',
  				                          align: 'stretch'
          					              },
 			                            items: [
 			                                    Ext.create('CF.view.SolverSelect'),
		                             		    Ext.create('CF.view.dataviews.SolverConf')
                                              ]
                   					 },
                   					 {
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
		                                items: [
		                                        eventsTabPanel,
	                                            Ext.create('CF.view.dataviews.EventGrid')
			                                   ]
	                                },
	                                {
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
	                                    items: [
	                                            	stationsTabPanel,
    			                                    Ext.create('CF.view.dataviews.StationGrid')
	                                           ]	                                    
	                                },
	                                {
		                                xtype: 'panel',
		                                title: 'Submit',
		                                id: 'submit',
		                                disabled: true,
		                                border: false,
		                                layout: {
		                                    type: 'vbox',
		                                    align: 'stretch'
		                                },
		                                items: [
			                                    Ext.create('CF.view.Submit')
			                                   ]
	                                },
	                                {
		                                xtype: 'panel',
		                                title: 'Control',
		                                border: false,
		                                layout: {
		                                    type: 'vbox',
		                                    align: 'stretch'
		                                },
		                                items: [
			                                    Ext.create('CF.view.Control')
			                                   ]
	                                }
			                  ]
                    }
                    
                ]
            }
            , {
			                        xtype: 'panel',	// Earthquake & Station & Common
			                        title: 'Results',
			                        region: 'center',
			                        border: false,
			                      autoSroll:true,
			                        layout: {
 									           type: 'border',
									            padding: 5
 									       },
 								       defaults: {
 								           split: true
 								       },
			                        items: [	Ext.create('CF.view.ActivityMonitor'), 
					                        { 
          									  region: 'center',
      								    	  layout: 'border',
      								   		  border: false,
      								   		  autoSroll:true,
    								   	 	  items: [
			   		                     			Ext.create('CF.view.ResultsPane'),
			   		                     			Ext.create('CF.view.ArtifactView')
			   		                     			]
			   		                     	}
			                        	
			                               
			                              ]
			                    }
            ]
          
          }]
          
        });

        me.callParent(arguments);
    }
});


selectedFile = "";

function fileSelection(filetype) {
	Ext.Ajax.request({
		url: getListURL,
		params: {
			userSN: userSN,		//user screen name, it is populated in html/init.jsp
			filetype: filetype
		},
		success: function(response){
			showFileSelector(response.responseText, filetype);	        
		}
	});
}
function showFileSelector(htmlFileList, filetype)
{
    win = Ext.widget('window', {
        title: 'Select existing file',
        closeAction: 'hide',
        width: 300,
        height: 350,
        layout: 'fit',
        modal: true,
        autoScroll: true,
        resizable: false,
        html: htmlFileList,
        buttons: [{
            text: 'Cancel',
            handler: function() {
            	selectedFile = "";
                this.up('window').hide();
            }
        }, {
            text: 'Select',
            handler: function() {
            	parseSelectedFile(this.up('window'), filetype);
            }
        }]
    });
    win.show();
}
function parseSelectedFile(win, filetype)
{
	if(selectedFile==="")
	{
		Ext.Msg.alert("Alert!", "Please, select a file by clicking on it");
	}
	else
	{
		if(filetype===EVENT_TYPE) 	getEvents(ctrl, selectedFile);
		if(filetype===STXML_TYPE || filetype===STPOINTS_TYPE)
			getStations(ctrl, selectedFile, filetype);
		selectedFile = "";
		win.hide();
	}
}
function selectFile(e)
{
	$("li").css('background-color', '');
	selectedFile = e.getAttribute('filePath');
	$(e).css('background-color', '#CED9E7');
}

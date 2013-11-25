/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */
var networks = [{
        "abbr": "G",
        "name": "GEOSCOPE"
    }, {
        "abbr": "AU",
        "name": "Geoscience Australia"
    }, {
        "abbr": "AZ",
        "name": "ANZA Regional Network"
    }, {
        "abbr": "BK",
        "name": "Berkeley Digital Seismograph Network"
    }

];



Ext.define('CF.view.Viewport', {
    extend: 'Ext.Viewport',
    layout: 'fit',

    requires: [
        'Ext.layout.container.Border',
        'Ext.resizer.Splitter',
        'CF.view.StationSearch',
        'CF.view.Commons',
        'CF.view.EventSearch',
        'CF.view.Map'

    ],

    initComponent: function () {
        var me = this;

        Ext.apply(me, {  id: 'viewport',
            items: [{
                xtype: 'panel',
                border: 'false',
                layout: 'border',
                defaults: {
                    collapsible: true,
                    split: true,
                    bodyStyle: 'padding:15px'
                },

                items: [{
                        xtype: 'cf_mappanel'
                    },


                    {
                        xtype: 'tabpanel',
                        region: 'center',
                        border: false,
                      
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [{
                                xtype: 'panel',
                                title: 'Earthquakes',
                                border: false,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items: [
                                    Ext.create('CF.view.EventSearch'),
                                    Ext.create('CF.view.dataviews.EventGrid')


                                ]
                            }, {
                                xtype: 'panel',
                                title: 'Stations',
                                border: false,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items: [

                                    Ext.create('CF.view.StationSearch'),
                                    Ext.create('CF.view.dataviews.StationGrid')
                                ]
                            },

                            {
                                xtype: 'panel',
                                title: 'Common Search Criteria',
                                border: false,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items: [Ext.create('CF.view.Commons')


                                ]
                            },
                            {
                                xtype: 'panel',
                                title: 'Solver',
                                border: false,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items: [Ext.create('CF.view.SolverSelect'),
                               		    Ext.create('CF.view.SolverConf')
                                


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

  

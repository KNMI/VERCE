/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */

Ext.define('RS.view.Viewport', {
    extend: 'Ext.Viewport',
    layout: 'fit',
    requires: [
        'Ext.layout.container.Border',
        'Ext.resizer.Splitter',
        'RS.view.ResultsPane'
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(me, {  id: 'viewport',
            items: [
{
    xtype: 'tabpanel',
    border: 'false',
    layout: 'border',
    defaults: {
        split: true
    },items : [
                    {
		                xtype: 'panel',	
		                title: 'Results',
		                region: 'center',
		                border: false,
		                autoScroll:true,
		                layout: {
				           type: 'border',
			            padding: 5
				       },
				       defaults: {
				           split: true
				       },
				       items: [
				                Ext.create('RS.view.ActivityMonitor'), 
				               	{ 
								  region: 'center',
						    	  layout: 'border',
						   		  border: false,
						   		  autoScroll:true,
						   		  items: [
						   		          Ext.create('RS.view.provenanceGraphsViewer'),
						   		          Ext.create('RS.view.ArtifactView')
						   		          ]
				               	}
				       ]
                    },
                    ,
	               	 {
	                    xtype: 'panel',
	                    title: 'iRods',
	                    region: 'center',
	                    border: false,
	                    autoScroll:true,
	                    layout: 'border',
	                    defaults: {
	                    },
	                    items: [
	                        {
	                            xtype : "component",
	                            autoEl : {
	                                tag : "iframe",
	                                seamless: "seamless",
	                                // TODO real url
	                                src: "http://dir-irods.epcc.ed.ac.uk/irodsweb/browse.php?ruri="+(userSN?userSN+"@":"")+"dir-irods.epcc.ed.ac.uk%3A1247/UEDINZone/home/"+(userSN?userSN+"/verce":"")
	                            },
	                            region: 'center',
	                            border: false,
	                        }
	                    ]
	                }
                ]
}

]
        });
        me.callParent(arguments);
    }
});

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
                    }
                ]
        });
        me.callParent(arguments);
    }
});

/**
 * The GeoExt.panel.Map used in the application.  Useful to define map options
 * and stuff.
 * @extends GeoExt.panel.Map
 */
Ext.define('CF.view.Map', {
    // Ext.panel.Panel-specific options:
    extend: 'GeoExt.panel.Map',
    alias : 'widget.cf_mappanel',
    requires: [
        'Ext.window.MessageBox',
        'GeoExt.Action',
        'GeoExt.slider.LayerOpacity',
        'CF.view.help.Action'
    ],
    border: 'false',
    layout: 'fit',
    region: 'west',
    width: 600,
    // GeoExt.panel.Map-specific options :
    center: '13.3046875,40.48193359375',
    zoom: 4,

    initComponent: function() {
        var me = this,
            items = [],
            ctrl;
        
         var layers = [];

        
           var hwms = 
           new OpenLayers.Layer.WMS(
            "Hazard Map WMS (Epher) ",
            "http://gemmsrvr.ethz.ch/cgi-bin/mapserv?MAP=/var/www/mapfile/sharehazard.01.map&",
             {layers: 'hmap469',
             transparent: 'true',
             },{
             isBaseLayer: false
             }
        );
        
        
         var vecwms = 
           new OpenLayers.Layer.WMS(
            "Borders ",
            "http://gemmsrvr.ethz.ch/cgi-bin/mapserv?map=/var/www/mapfile/worldvector.map&",
             {layers: 'wv_country_ol',
             transparent: 'true',
             },{
             isBaseLayer: false
             }
        );
        
         layers.push(hwms);
         layers.push(vecwms);
        
        
        
       
        
        
        map = new OpenLayers.Map('map', {
                    controls: [
                        new OpenLayers.Control.Navigation(),
                        new OpenLayers.Control.PanZoomBar(),
                        new OpenLayers.Control.LayerSwitcher({'ascending':false}),
                        new OpenLayers.Control.Permalink(),
                        new OpenLayers.Control.ScaleLine(),
                        new OpenLayers.Control.Permalink('permalink'),
                        new OpenLayers.Control.MousePosition(),
                        new OpenLayers.Control.OverviewMap(),
                        new OpenLayers.Control.KeyboardDefaults()
                    ],
                    numZoomLevels: 10
                    
                });
                
        map.addLayers(layers)
        hwms.setOpacity(0.5);
         
       

        // ZoomToMaxExtent control, a "button" control
        items.push(Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
            control: new OpenLayers.Control.ZoomToMaxExtent(),
            map: map,
            text: "max extent",
            tooltip: "zoom to max extent"
        })));

        items.push("-");

        // Navigation control
        items.push(Ext.create('Ext.button.Button',Ext.create('GeoExt.Action', {
            text: "nav",
            control: new OpenLayers.Control.Navigation(),
            map: map,
            // button options
            toggleGroup: "draw",
            allowDepress: false,
            pressed: true,
            tooltip: "navigate",
            // check item options
            group: "draw",
            checked: true
        })));

        items.push("-");

        // Navigation history - two "button" controls
        ctrl = new OpenLayers.Control.NavigationHistory();
        map.addControl(ctrl);
        
        items.push(Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
            text: "previous",
            control: ctrl.previous,
            disabled: true,
            tooltip: "previous in history"
        })));
        
        items.push(Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
            text: "next",
            control: ctrl.next,
            disabled: true,
            tooltip: "next in history"
        })));
        items.push("->");

        // Help action
        items.push(
            Ext.create('Ext.button.Button', Ext.create('CF.view.help.Action', {
                windowContentEl: "help"
            }))
        );
        
        
        
        
        items.push(
        {
            xtype: 'splitbutton',
            text: 'Opacity',
            menuAlign: 'tr-br',
            menu: {
                xtype: 'menu',
                plain: true,
                items: [
                {
                    text: 'Hazard'
                },
                    {    
				        xtype: "gx_opacityslider",
				        layer: hwms,
				        aggressive: true,
				        vertical: false,
				        value:50,
				        height: 10,
						x: 10,
     				    y: 20
 			 		  } ,
 			 		  {
                    text: 'Borders'
                },
                    {    
				        xtype: "gx_opacityslider",
				        text: 'Boundaries',
   					    layer: vecwms,
				        aggressive: true,
				        vertical: false,
				        height: 10,
				    
						x: 10,
     				    y: 20
 			 		  } 
                		]
           		 }
      		  }

        );
        
        
         
        
        Ext.apply(me, {
            map: map,
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: items,
                style: {
                    border: 0,
                    padding: 0
                }
            }]
        });
                
        me.callParent(arguments);
    }
});

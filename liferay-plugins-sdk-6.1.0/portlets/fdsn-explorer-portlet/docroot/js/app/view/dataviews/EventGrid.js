/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */
 
evisfeature=null;
 
 
 
Ext.define('CF.view.dataviews.EventGrid' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.eventsgrid',
    
    multiSelect: true,
    requires: [
    	'CF.store.EventStore',
        'GeoExt.selection.FeatureModel',
        'GeoExt.grid.column.Symbolizer',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Number',
        'Ext.grid.plugin.BufferedRenderer'
    ],
   
    initComponent: function() { eventgrid=this;
        Ext.apply(this, {
            border: false,
            store:eventStore,
            selType: 'checkboxmodel',
            
            loadMask: true,
		  //  plugins: 'bufferedrenderer',
		     
		    
            columns: [
			{
                    header: '',
                    dataIndex: 'symbolizer',
                    menuDisabled: true,
                    sortable: false,
                    xtype: 'gx_symbolizercolumn',
                    width: 30
                },
                
                {header: 'Desc', dataIndex: 'description', flex: 3},
                {header: 'Date', dataIndex: 'date', flex: 3},
                 
                {header: 'Depth',dataIndex: 'depth',flex: 3},
                {header: 'Latitude', dataIndex: 'latitude', flex: 3},
                {header: 'Longitude', dataIndex: 'longitude', flex: 3},
                {header: 'Magnitude', dataIndex: 'magnitude', flex: 3},
                {
            xtype:'actioncolumn', 
            width:40,
            tdCls:'show',
            items: [{
               icon: localResourcesPath+'/img/eye-3-256.png', // Use a URL in the icon config
                tooltip: 'Show',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
             
                     if(evisfeature)
                     {
                 	    map.removePopup(evisfeature.popup);
            	  	    evisfeature.popup.destroy();
             	 	    evisfeature.popup = null;
                 	 }
                     evisfeature = rec.raw;
             	     var popup = new OpenLayers.Popup.FramedCloud("popup",
                     OpenLayers.LonLat.fromString(evisfeature.geometry.toShortString()),
                     null,
                     "<div style='font-size:.8em'><br>Description: " + evisfeature.attributes.description+"</div>",
                     null,
                     true
                );
				 
                evisfeature.popup = popup;
                map.addPopup(popup);
                }
            }] 
        
                  
        }    ],
            flex: 1,
            
            
           
        });
        this.callParent(arguments);
       
        // store singleton selection model instance
       
         
    },
    
});

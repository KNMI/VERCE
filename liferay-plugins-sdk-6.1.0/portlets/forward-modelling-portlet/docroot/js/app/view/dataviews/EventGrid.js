
function renderMomentTensor(value, p, record) {
        return Ext.String.format(
            '<img src="/j2ep-1.0/odc/verce-scig-api/mt/components-image?mrr={0}&mtt={1}&mpp={2}&mrt={3}&mrp={4}&mtp={5}" width="20" height="20"/>',
            encodeURIComponent(record.data.tensor_mrr),
            encodeURIComponent(record.data.tensor_mtt),
            encodeURIComponent(record.data.tensor_mpp),
            encodeURIComponent(record.data.tensor_mrt),
            encodeURIComponent(record.data.tensor_mrp),
            encodeURIComponent(record.data.tensor_mtp)
        );
 }

Ext.define('CF.view.dataviews.EventGrid' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.eventsgrid',
	id: 'gridEvent',
    multiSelect: true,
    requires: [
    	'CF.store.EventStore',
        'GeoExt.selection.FeatureModel',
        'GeoExt.grid.column.Symbolizer',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Number',
        'Ext.grid.plugin.BufferedRenderer'
    ],
    initComponent: function() {
    	eventgrid=this;
        Ext.apply(this, {
        	id: 'gridEvents',
            border: false,
            store:eventStore,
            selModel: Ext.create('Ext.selection.CheckboxModel',
            		{checkOnly: true,
		            	listeners: {
		           			 select: function(t, r, i) 
		        			 {
		           				 //upate to selected image
		        				 var newSymbolizer = eventstylemap.createSymbolizer(r.raw, 'gridSelect');
		        				 r.data.symbolizer = newSymbolizer;
		        			 },
		        			 deselect: function(t, r, i) 
		        			 {
		        				 //update to unselected image
		        				 var newSymbolizer = eventstylemap.createSymbolizer(r.raw, 'default');
		        				 r.data.symbolizer = newSymbolizer;
		        			 },
	            			 selectionchange: function(t, s)
	            			 {
	            				 //render grid and layer to update the selected/unselected symbols
	            				 //Ext.getCmp('gridEvents').getView().refresh();
	            				 ctrl.eventLayer.redraw();
	            				 if(s.length>1)	Ext.getCmp('checkboxNSubmit').setDisabled(false);
	            				 else			Ext.getCmp('checkboxNSubmit').setDisabled(true);
	            				 Ext.getCmp('eventSelColumn').setText(s.length+"/"+eventStore.getTotalCount());
	            			 }
		        		 }
            		}),  
            loadMask: true,
            columns: [
			{
				header: '0/0',
                id: 'eventSelColumn',
                dataIndex: 'symbolizer',
                menuDisabled: true,
                sortable: false,
                xtype: 'gx_symbolizercolumn',
                width: 40
            },
            {header: 'Desc', dataIndex: 'description', flex: 3},
            {header: 'Date', dataIndex: 'date', flex: 3},
            {header: 'Depth',dataIndex: 'depth',flex: 3},
            {header: 'Latitude', dataIndex: 'latitude', flex: 3},
            {header: 'Longitude', dataIndex: 'longitude', flex: 3},
            {header: 'Magnitude', dataIndex: 'magnitude', flex: 3},
            {header: 'MT', renderer: renderMomentTensor,flex: 3},
            {
	            xtype:'actioncolumn', 
	            width:40,
	            tdCls:'show',
	            items: [{
	            	icon: localResourcesPath+'/img/eye-3-256.png', // Use a URL in the icon config
	                tooltip: 'Show',
	                handler: function(grid, rowIndex, colIndex) {
	                    var rec = grid.getStore().getAt(rowIndex);
	                    showEventInfo(rec.raw);
	                }
	            }]
            }],
            flex: 1
        });
        this.callParent(arguments);
    }
});
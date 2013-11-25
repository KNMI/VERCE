/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */
Ext.define('CF.view.summit.EventGrid' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.eventsgrid',
   
    requires: [
    	'CF.store.EventStore',
        'GeoExt.selection.FeatureModel',
        'GeoExt.grid.column.Symbolizer',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Number'
    ],
   
    initComponent: function() {
        Ext.apply(this, {
            border: false,
            store:eventStore,
            selType: 'featuremodel',
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
                {header: 'Magnitude', dataIndex: 'magnitude', flex: 3}
                  
            ],
            flex: 1,
            
            
           
        });
        this.callParent(arguments);
       
        // store singleton selection model instance
       
         
    },
    
});

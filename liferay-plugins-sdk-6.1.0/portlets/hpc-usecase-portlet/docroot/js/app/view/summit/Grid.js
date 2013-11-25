/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */
Ext.define('CF.view.summit.Grid' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.stationsgrid',
   
    requires: [
    	'CF.store.StationStore',
        'GeoExt.selection.FeatureModel',
        'GeoExt.grid.column.Symbolizer',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Number'
    ],
   
    initComponent: function() {
        Ext.apply(this, {
            border: false,
            store:stationStore,
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
                
                {header: 'Station', dataIndex: 'station', flex: 3},
                {header: 'Network', dataIndex: 'network', flex: 3},
                 
                {header: 'Elevation',dataIndex: 'elevation',flex: 3},
                {header: 'Latitude', dataIndex: 'latitude', flex: 3},
                {header: 'Longitude', dataIndex: 'longitude', flex: 3}
                  
            ],
            flex: 1,
            
            
           
        });
        this.callParent(arguments);
       
        // store singleton selection model instance
       
         
    },
    
});

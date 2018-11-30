function renderMomentTensor(value, p, record) {
    return Ext.String.format(
        '<img src="/verce-scig-api/mt/components-image?mrr={0}&mtt={1}&mpp={2}&mrt={3}&mrp={4}&mtp={5}" width="20" height="20"/>',
        encodeURIComponent(record.data.tensor_mrr),
        encodeURIComponent(record.data.tensor_mtt),
        encodeURIComponent(record.data.tensor_mpp),
        encodeURIComponent(record.data.tensor_mrt),
        encodeURIComponent(record.data.tensor_mrp),
        encodeURIComponent(record.data.tensor_mtp)
    );
}

Ext.define('CF.view.dataviews.EventGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.eventgrid',
    id: 'eventgrid',
    multiSelect: true,
    requires: [
        //'GeoExt.selection.FeatureModel',
        //'GeoExt.grid.column.Symbolizer',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Number',
        'Ext.grid.plugin.BufferedRenderer'
    ],
    border: false,
    selType: 'checkboxmodel',
    selModel: {
        checkOnly: true,
        injectCheckbox: 0,
        listeners: {
            select: function(rowmodel, record, index) {
                controller.onEventClick(record,true);
            },
            deselect: function(rowmodel, record, index) {
                controller.onEventClick(record,false);
            },
            selectionchange: function(t, s) {
                if (s.length > 1) Ext.getCmp('checkboxNSubmit').setDisabled(false);
                else Ext.getCmp('checkboxNSubmit').setDisabled(true);
                Ext.getCmp('eventSelColumn').setText(s.length + "/" + Ext.data.StoreManager.lookup('eventStore').data.length);
            }
        }
    },
    loadMask: true,
    columns: [{
        header: '0/0', //it will be updated on selectionchange and when the grid reloads (in Map.js)
        id: 'eventSelColumn',
        dataIndex: 'symbolizer',
        menuDisabled: true,
        sortable: false,
        //xtype: 'gx_symbolizercolumn',
        width: 60
    }, {
        header: 'Desc',
        dataIndex: 'description',
        flex: 3
    }, {
        header: 'Date',
        dataIndex: 'date',
        flex: 3
    }, {
        header: 'Depth',
        dataIndex: 'depth',
        flex: 3
    }, {
        header: 'Latitude',
        dataIndex: 'latitude',
        flex: 3
    }, {
        header: 'Longitude',
        dataIndex: 'longitude',
        flex: 3
    }, {
        header: 'Magnitude',
        dataIndex: 'magnitude',
        flex: 3
    }, {
        header: 'MT',
        renderer: renderMomentTensor,
        flex: 3
    }, {
        xtype: 'actioncolumn',
        width: 40,
        tdCls: 'show',
        items: [{
            icon: localResourcesPath + '/img/eye-3-256.png', // Use a URL in the icon config
            tooltip: 'Show/Hide',
            handler: function(grid, rowIndex, colIndex) {
                var rec = grid.getStore().getAt(rowIndex);
                controller.showEventInfo(rec.data);
            }
        }]
    }],
    flex: 1,
    initComponent: function() {
        this.store = Ext.data.StoreManager.lookup('eventStore');
        this.callParent(arguments);
    }
});
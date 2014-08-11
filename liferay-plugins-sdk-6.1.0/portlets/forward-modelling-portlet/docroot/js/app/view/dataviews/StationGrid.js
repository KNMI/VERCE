/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */

Ext.define('CF.view.dataviews.StationGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.stationsgrid',
  requires: [
    'CF.store.Station',
    'GeoExt.selection.FeatureModel',
    'GeoExt.grid.column.Symbolizer',
    'Ext.grid.plugin.CellEditing',
    'Ext.grid.plugin.BufferedRenderer',
    'Ext.form.field.Number'
  ],

  initComponent: function() {
    var controller = CF.app.getController('Map');
    Ext.apply(this, {
      id: 'gridStations',
      border: false,
      store: stationStore,
      selModel: Ext.create('Ext.selection.CheckboxModel', {
        checkOnly: true,
        listeners: {
          select: function(rowmodel, record, index) {
            controller.mapPanel.map.getControl('dragselect').select(record.data);
          },
          deselect: function(rowmodel, record, index) {
            controller.mapPanel.map.getControl('dragselect').unselect(record.data);
          },
          selectionchange: function(t, s) {
            if (s.length > 1) Ext.getCmp('checkboxNSubmit').setDisabled(false);
            else Ext.getCmp('checkboxNSubmit').setDisabled(true);
            Ext.getCmp('stationSelColumn').setText(s.length + "/" + stationStore.getTotalCount());
          }
        }
      }),
      columns: [{
        header: '0/0', //it will be updated on selectionchange and when the grid reloads (in Map.js)
        id: 'stationSelColumn',
        dataIndex: 'symbolizer',
        menuDisabled: true,
        sortable: false,
        xtype: 'gx_symbolizercolumn',
        width: 45
      }, {
        header: 'Station',
        dataIndex: 'station',
        flex: 3
      }, {
        header: 'Network',
        dataIndex: 'network',
        flex: 3
      }, {
        header: 'Elevation',
        dataIndex: 'elevation',
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
        xtype: 'actioncolumn',
        width: 40,
        tdCls: 'delete',
        items: [{
          icon: localResourcesPath + '/img/eye-3-256.png', // Use a URL in the icon config
          tooltip: 'Show',
          handler: function(grid, rowIndex, colIndex) {
            var rec = grid.getStore().getAt(rowIndex);
            controller.showStationInfo(rec.data);
          }
        }]
      }],
      flex: 1
    });
    this.callParent(arguments);
  }
});
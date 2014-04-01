Ext.define('CF.view.dataviews.SolverConf', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.solvergrid',
  id: "SolverConfPanel",
  autoScroll: true,
  disabled: true,
  requires: [
    'Ext.grid.plugin.CellEditing',
    'Ext.form.field.Number'
  ],
  store: solverConfStore,
  initComponent: function() {
    var me = this;
    Ext.apply(this, {
      border: false,
      columns: [{
        header: 'Name',
        dataIndex: 'name'
      }, {
        header: 'Value',
        dataIndex: 'value',
        flex: 1,
        field: {
          xtype: 'textfield',
          allowBlank: true
        }
      }, {
        header: 'Required',
        dataIndex: 'req'
      }, {
        header: 'Description',
        dataIndex: 'desc'
      }],
      flex: 1,
      selType: 'cellmodel',
      plugins: [
        Ext.create('Ext.grid.plugin.CellEditing', {
          clicksToEdit: 1,
          listeners: {
            'validateedit': function(c, e, eOpts) {
              var r = e.rowIdx;
              var sr = solverConfStore.getAt(r);
              sr.set(e.field, e.value);
            }
          }
        })
      ]
    });
    this.callParent(arguments);
  }
});

/*//Useful to add a rightclick menu 
var doCellCtxMenu = function(editorGrid, rowIndex, cellIndex, evtObj) {
    evtObj.stopEvent();
    if (!editorGrid.rowCtxMenu) {
      editorGrid.rowCtxMenu = new Ext.menu.Menu( {
        items: [ {
          text: 'Insert Record',
          handler: onInsertRecord
        }, {
          text: 'Delete Record',
          handler: onDelete
        } ]
      });
    }
    editorGrid.getSelectionModel().select(rowIndex, cellIndex);
    editorGrid.rowCtxMenu.showAt(evtObj.getXY());
  };*/
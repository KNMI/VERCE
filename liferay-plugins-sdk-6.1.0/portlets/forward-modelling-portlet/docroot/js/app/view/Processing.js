//Ext.ux.tree.TreeGrid is no longer a Ux. You can simply use a tree.TreePanel
Ext.define('CF.view.ProcessingTree', {
  extend: 'Ext.tree.Panel',
  alias: 'widget.processing_tree',
  requires: ['CF.store.PE'],

  title: 'Available PEs',
  //width: 500,
  height: 300,

  //renderTo: Ext.getBody(),
  collapsible: false,
  useArrows: true,
  rootVisible: false,

  initComponent: function(options) {
    this.store = Ext.create('CF.store.PE', {});

    this.callParent();
  },
  multiSelect: false,
  singleExpand: true,
  viewConfig: {
    copy: true,
    plugins: {
      ptype: 'treeviewdragdrop',
      dragText: 'Drag and drop to reorganize',

      dragGroup: 'trashDrag'
    }
  },
  listeners: {
    viewready: function(tree) {
      var view = tree.getView(),
        dd = view.findPlugin('treeviewdragdrop');

      // only leaf nodes are draggable
      dd.dragZone.onBeforeDrag = function(data, e) {
        var rec = view.getRecord(e.getTarget(view.itemSelector));
        return rec.isLeaf();
      };
    }
  },

  columns: [{
    xtype: 'treecolumn', //this is so we know which column will show the tree
    text: 'name',
    width: 150,
    sortable: true,
    dataIndex: 'name'
  }, {
    text: 'description',
    flex: 1,
    dataIndex: 'description',
    sortable: false
  }]
});

Ext.define('pe_params', {
  extend: 'Ext.data.Model',
  fields: ['param', 'value', 'description']
});

//drop: function (
Ext.define('CF.view.ProcessingGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.processing_grid',
  requires: ['CF.store.PEWorkflow'],

  title: 'PE Workflow',
  //width: 500,
  //height: 200,
  layout: 'fit',
  width: "100%",
  //renderTo: Ext.getBody(),
  collapsible: false,
  useArrows: true,
  rootVisible: false,
  initComponent: function(options) {
    this.store = Ext.create('CF.store.PEWorkflow', {
      data: []
    });

    this.callParent();
  },
  multiSelect: false,
  singleExpand: true,
  selType: 'rowmodel',

  listeners: {
    /*
              selectionchange :function ( selected, eOpts ) {
                  console.log("selectionchange",selected);
              },
              */
    select: function(selected, eOpts) {
      if (!this.getSelectionModel().hasSelection()) {
        return;
      }

      var d = this.getSelectionModel().getSelection()[0];
      var index = d.store.indexOf(d.data) + 1;

      var store = Ext.create('Ext.data.Store', {
        model: 'pe_params',
        data: d.data.params
      });
      var property_grid = Ext.getCmp('processing_property_grid');
      property_grid.setStore(store);
      property_grid.setTitle("parameters of step " + (index) + ": " + d.data.name);

    }
  },
  viewConfig: {
    plugins: {
      ptype: 'gridviewdragdrop',
      dropGroup: 'trashDrag',
      dragGroup: 'trashDrag',
      dragText: 'Drag and drop to add to workflow'
    },
    listeners: {

      rowclick: function(searchgrid, record, e) {
        var index = record.store.indexOf(record);
        this.getSelectionModel().selectRange(index, index);
      },

      beforedrop: function(node, data, overModel, dropPosition, dropHandlers, eOpts) {


        // reorder inside the this.store : let extjs manage that
        if (overModel != null && data.records[0].store == overModel.store) {
          return;
        }

        // drag from the pe list : insert ourself (add a new copy of the pe model)
        dropHandlers.wait = true;
        dropHandlers.cancelDrop();

        // no multiselect so records has only 1 element
        var v = data.records[0];
        var d = v.data;
        var p = null;
        if (d.params != null) {
          p = [];
          $.each(d.params, function(ii, obj) {
            p.push($.extend(true, {}, obj));
          });
        }
        var index = 0;
        if (overModel != null) {
          index = this.store.indexOf(overModel.data);
          if (dropPosition == 'after') {
            index = index + 1;
          }
          this.store.insert(index, {
            "name": d.name,
            "include_visu": true,
            "include_store": true,
            params: p
          });
        } else {
          this.store.add({
            "name": d.name,
            "include_visu": true,
            "include_store": true,
            params: p
          });
        }

        this.getSelectionModel().selectRange(index, index);
        return 0;
      }
    }
  },
  dockedItems: [

    {
      xtype: 'toolbar',
      dock: 'bottom',
      items: [{
        xtype: 'button',
        text: 'remove selected step',
        handler: function() {
          var selection = this.getView().getSelectionModel().getSelection()[0];
          if (selection) {
            var index = selection.store.indexOf(selection);
            this.store.remove(selection);
            // TODO if index out of range : get last record, + remove all selection if no records in store
            this.getView().getSelectionModel().selectRange(index, index);
          }
        }
      }, {
        xtype: 'tbfill'
      }, {
        xtype: 'button',
        text: 'get values',
        handler: function() {
          var msg = "";
          $.each(this.store.getRange(), function(i, r) {
            var step = i + 1;
            var name = r.data.name;
            msg += "step=" + step + " - " + name + "<br/>";
            msg += "visu=" + r.data.include_visu + "<br/>";
            msg += "store=" + r.data.include_store + "<br/>";
            if (r.data.params != null) {
              $.each(r.data.params, function(i2, p) {
                msg += p.name + "=" + p.value + "<br/>";
              });
            }
            msg += "--------<br/>";
          });
          Ext.Msg.alert(msg);
        }
      }]
    }
  ],


  columns: {
    defaults: {
      menuDisabled: true,
      sortable: true
    },
    items: [{
        xtype: 'rownumberer',
        text: 'step',
        width: 50
      }, {
        text: 'name',
        flex: 1,
        dataIndex: 'name',
        sortable: false
      }, {
        text: 'visu',
        dataIndex: 'include_visu',
        xtype: 'checkcolumn'
      }, {
        text: 'store',
        dataIndex: 'include_store',
        xtype: 'checkcolumn'
      }

    ]
  }
});

Ext.define('CF.view.ProcessingPropertyGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.processing_property_grid',

  id: 'processing_property_grid',
  //renderTo: Ext.getBody(),

  //height: 300,
  width: "100%",
  title: 'Parameters',
  //features: [{ ftype: 'grouping' }],
  selType: 'cellmodel',
  plugins: [
    Ext.create('Ext.grid.plugin.CellEditing', {
      clicksToEdit: 1
    })
  ],

  columns: [{
    menuDisabled: true,
    sortable: true,
    text: 'Param',
    width: 100,
    dataIndex: 'name',
    tdCls: 'bold-me'
  }, {
    menuDisabled: true,
    sortable: false,
    text: 'Value',
    width: 100,
    dataIndex: 'value',

    getEditor: function(record) {
      var ed = record.data.editor;
      if (ed == null) {
        ed = {
          xtype: "textfield"
        };
      }
      return Ext.create('Ext.grid.CellEditor', {
        field: ed
      })

    },
    renderer: function(value, metaData) {
      if (typeof metaData.record.get('value') == "boolean") {
        if (metaData.record.get('value') == true) {
          return '<div style="text-align: center"><img class="x-grid-checkcolumn x-grid-checkcolumn-checked" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="></div>';

        } else {
          return '<div style="text-align: center"><img class="x-grid-checkcolumn" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="></div>';
        }
      }
      return value;
    }
  }, {
    menuDisabled: true,
    sortable: false,
    text: 'Description',
    flex: 1,
    dataIndex: 'description',
    tdCls: 'italic-me'
  }]
});

Ext.define('CF.view.ProcessingCenterPanel', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.processing_center_panel',
  //renderTo: Ext.getBody(),
  requires: [
    'Ext.layout.container.Border'
  ],
  layout: 'border', // border
  //height:500,
  bodyBorder: false,
  defaults: {
    collapsible: false,
    split: true,
    bodyPadding: 0
  },

  items: [{
    region: 'north',
    height: 200,
    layout: 'fit',
    margins: '0 0 0 0',
    items: [{
      xtype: 'processing_grid',
    }]
  }, {
    region: 'center',
    flex: 1,

    margins: '0 0 0 0',
    items: [{
      xtype: 'processing_property_grid',
    }]

  }] //,layout: 'vbox'
});

Ext.define('CF.view.Processing', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.processing_panel',
  requires: [
    'Ext.layout.container.Border'
  ],
  layout: 'border', // border
  height: "100%",
  bodyBorder: false,

  defaults: {
    collapsible: false,
    split: true,
    bodyPadding: 0
  },

  items: [{
    xtype: 'cf_mappanel',
    region: 'west',
  }, {
    xtype: 'tabpanel',
    region: 'center',
    layout: 'fit',
    bodyBorder: false,

    items: [{
      xtype: 'panel',
      layout: 'border', // border
      height: "100%",
      title: 'Processing Setup',
      bodyBorder: false,

      defaults: {
        collapsible: false,
        split: true,
        bodyPadding: 0
      },

      items: [{
        region: 'west',
        width: 300,
        height: "100%",
        layout: 'fit',
        margins: '0 0 0 0',
        items: [{
          xtype: 'processing_tree',
        }]
      }, {
        region: 'center',
        //height:"100%",
        layout: 'fit',
        margins: '0 0 0 0',
        //items : {layout:"vbox",items:[grid,property_grid]}
        items: [{
          xtype: 'processing_center_panel',
        }],
      }],
    }, {
      xtype: 'panel',
      layout: 'border', // border
      height: "100%",
      title: 'Data Setup',
      bodyBorder: false,

      defaults: {
        collapsible: false,
        split: true,
        bodyPadding: 0
      },
    }, {
      xtype: 'panel',
      layout: 'border', // border
      height: "100%",
      title: 'Submit',
      bodyBorder: false,

      defaults: {
        collapsible: false,
        split: true,
        bodyPadding: 0
      },
    }, {
      xtype: 'panel',
      title: 'Control',
      border: false,
      layout: 'fit',
      items: [{
        xtype: 'control'
      }]
    }],
  }],
});
// doc : http://docs.sencha.com/extjs/5.0/5.0.1-apidocs/#!/api/Ext.grid.column.Check
Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.tree.*'
]);

//we want to setup a model and store instead of using dataUrl
Ext.define('PEI', {
  extend: 'Ext.data.Model',
  fields: [{
    name: 'name',
    type: 'string'
  }, {
    name: 'description',
    type: 'string'
  }]
});

Ext.define('workflow_model', {
  extend: 'Ext.data.Model',
  fields: [{
      name: 'name',
      type: 'string'
    }, {
      name: 'include_visu',
      type: 'boolean'
    }, {
      name: 'include_store',
      type: 'boolean'
    },

  ]
});

var store = Ext.create('Ext.data.TreeStore', {
  model: 'PEI',
  proxy: {
    type: 'ajax',
    //the store will get the content from the .json file
    url: 'pei.json'
  },
  folderSort: true
});

var workflow_store = Ext.create('Ext.data.Store', {
  model: 'workflow_model',
  data: []
});

//Ext.ux.tree.TreeGrid is no longer a Ux. You can simply use a tree.TreePanel
var tree = Ext.create('Ext.tree.Panel', {
  title: 'Available PEIs',
  //width: 500,
  height: 300,

  //renderTo: Ext.getBody(),
  collapsible: false,
  useArrows: true,
  rootVisible: false,
  store: store,
  multiSelect: false,
  singleExpand: true,
  copy: true,
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

Ext.define('pei_params', {
  extend: 'Ext.data.Model',
  fields: ['param', 'value', 'description']
});

//drop: function (
var grid = Ext.create('Ext.grid.Panel', {

  title: 'PEI Workflow',
  //width: 500,
  //height: 200,
  layout: 'fit',
  width: "100%",
  //renderTo: Ext.getBody(),
  collapsible: false,
  useArrows: true,
  rootVisible: false,
  store: workflow_store,
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
      if (!grid.getSelectionModel().hasSelection()) {
        return;
      }

      var d = grid.getSelectionModel().getSelection()[0];
      var index = d.store.indexOf(d.data) + 1;

      var store = Ext.create('Ext.data.Store', {
        model: 'pei_params',
        data: d.data.params
      });
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
        grid.getSelectionModel().selectRange(index, index);
      },

      beforedrop: function(node, data, overModel, dropPosition, dropHandlers, eOpts) {


        // reorder inside the workflow_store : let extjs manage that                    
        if (overModel != null && data.records[0].store == overModel.store) {
          return;
        }

        // drag from the pei list : insert ourself (add a new copy of the pei model)
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
          index = workflow_store.indexOf(overModel.data);
          if (dropPosition == 'after') {
            index = index + 1;
          }
          workflow_store.insert(index, {
            "name": d.name,
            "include_visu": true,
            "include_store": true,
            params: p
          });
        } else {
          workflow_store.add({
            "name": d.name,
            "include_visu": true,
            "include_store": true,
            params: p
          });
        }

        grid.getSelectionModel().selectRange(index, index);
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
          var selection = grid.getView().getSelectionModel().getSelection()[0];
          if (selection) {
            var index = selection.store.indexOf(selection);
            workflow_store.remove(selection);
            // TODO if index out of range : get last record, + remove all selection if no records in store
            grid.getView().getSelectionModel().selectRange(index, index);
          }
        }
      }, {
        xtype: 'tbfill'
      }, {
        xtype: 'button',
        text: 'get values',
        handler: function() {
          var msg = "";
          $.each(workflow_store.getRange(), function(i, r) {
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

var property_grid = Ext.create('Ext.grid.Panel', {
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


var center_panel = Ext.create('Ext.panel.Panel', {
  //renderTo: Ext.getBody(),
  xtype: 'layout-border',
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
    items: [grid]
  }, {
    region: 'center',
    flex: 1,

    margins: '0 0 0 0',
    items: [property_grid]

  }] //,layout: 'vbox'
});





var pei_panel = Ext.create('Ext.panel.Panel', {
  renderTo: Ext.getBody(),
  xtype: 'layout-border',
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
    region: 'west',
    width: 300,
    height: "100%",
    layout: 'fit',
    margins: '0 0 0 0',
    items: [
      tree
    ]
  }, {
    region: 'center',
    //height:"100%",
    layout: 'fit',
    margins: '0 0 0 0',
    //items : {layout:"vbox",items:[grid,property_grid]}
    items: center_panel
  }]
});
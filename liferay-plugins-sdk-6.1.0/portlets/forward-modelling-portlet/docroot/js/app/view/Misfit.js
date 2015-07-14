var pei = {
  "text": ".",
  "children": [{
      "name": "detrend",
      "description": "Method to remove a linear trend from all traces",
      "include_visu": false,
      "include_store": false,
      "leaf": true,
      "iconCls": "task",
      "params": [{
        "name": "type",
        "description": "Method to use for detrending",
        "value": "linear",
        "editor": {
          "xtype": "combo",
          "store": ["linear", "simple", "constant"]
        }
      }]
    }, {
      "name": "taper",
      "description": "Method to taper all Traces in Stream",
      "leaf": true,
      "iconCls": "task",
      "params": [{
        "name": "max_percentage",
        "value": 0.05,
        "description": "Decimal percentage of taper at one end (ranging from 0. to 0.5). Default is 0.05 (5%).",
        "editor": {
          "xtype": "numberfield",
          "step": 0.01,
          "maxValue": 0.5,
          "minValue": 0
        }
      }, {
        "name": "type",
        "value": "hann",
        "description": "Type of taper to use for detrending",
        "editor": {
          "xtype": "combo",
          "store": ["cosine", "barthann", "bartlett", "blackman", "blackmanharris", "bohman", "boxcar", "chebwin", "flattop", "gaussian", "general_gaussian", "hamming", "hann", "kaiser", "nuttall", "parzen", "slepian", "triang"]
        }
      }]
    }, {
      "name": "removeResponse",
      "description": "Method to deconvolve instrument response for all Traces in Stream",
      "leaf": true,
      "iconCls": "task",
      "params": [{
          "name": "pre_filt_1",
          "value": 0.01,
          "description": "Apply a bandpass filter in frequency domain to the data before deconvolution. ",
          "editor": {
            "xtype": "numberfield",
            "step": 0.01
          }
        }, {
          "name": "pre_filt_2",
          "value": 0.02,
          "description": "The list or tuple defines the four corner frequencies (f1, f2, f3, f4) of a ",
          "editor": {
            "xtype": "numberfield",
            "step": 0.01
          }
        }, {
          "name": "pre_filt_3",
          "value": 8,
          "description": "cosine taper which is one between f2 and f3 and tapers to zero for ",
          "editor": {
            "xtype": "numberfield",
            "step": 0.01
          }
        }, {
          "name": "pre_filt_4",
          "value": 10,
          "description": "f1 < f < f2 and f3 < f < f4.",
          "editor": {
            "xtype": "numberfield",
            "step": 0.01
          }
        }, {
          "name": "water_level",
          "value": "",
          "description": "Water level for deconvolution",
          "editor": {
            "xtype": "numberfield",
            "step": 0.01
          }
        }, {
          "name": "output",
          "value": "VEL",
          "description": "Output units. One of 'DISP' (displacement, output unit is meters), 'VEL' (velocity, output unit is meters/second) or 'ACC' (acceleration, output unit is meters/second**2).",
          "editor": {
            "xtype": "combo",
            "store": ["DISP", "VEL", "ACC"]
          }
        }

      ]
    },

    {
      "iconCls": "task-folder",
      "name": "filters",
      "description": "Filters the data of all traces in the Stream",
      "children": [{
          "name": "bandpass",
          "description": "Butterworth-Bandpass",
          "leaf": true,
          "iconCls": "task",
          params: [{
            "name": "freqmin",
            "value": 1.0 / 150.0,
            "description": "Pass band low corner frequency"
          }, {
            "name": "freqmax",
            "value": 1.0 / 50.0,
            "description": "Pass band high corner frequency"
          }, {
            "name": "df",
            "value": "",
            "description": "Sampling rate in Hz"
          }, {
            "name": "corners",
            "value": 4,
            "description": "Filter corners / orders"
          }, {
            "name": "zerophase",
            "value": true,
            "description": "If True, apply filter once forwards and once backwards. This results in twice the number of corners but zero phase shift in the resulting filtered trace",
            "editor": {
              "xtype": "checkboxfield"
            },
            "render": {
              "xtype": "checkboxfield"
            }
          }, ]
        }, {
          "name": "bandstop",
          "description": "Butterworth-Bandstop",
          "leaf": true,
          "iconCls": "task",
          params: [{
            "name": "freqmin",
            "value": 1.0 / 150.0,
            "description": "Stop band low corner frequency"
          }, {
            "name": "freqmax",
            "value": 1.0 / 50.0,
            "description": "Stop band high corner frequency"
          }, {
            "name": "df",
            "value": "",
            "description": "Sampling rate in Hz"
          }, {
            "name": "corners",
            "value": 4,
            "description": "Filter corners / orders"
          }, {
            "name": "zerophase",
            "value": true,
            "description": "If True, apply filter once forwards and once backwards. This results in twice the number of corners but zero phase shift in the resulting filtered trace",
            "editor": {
              "xtype": "checkboxfield"
            },
            "render": {
              "xtype": "checkboxfield"
            }
          }, ]
        }, {
          "name": "envelope",
          "description": "Computes the envelope of the given function. The envelope is determined by adding the squared amplitudes of the function and it’s Hilbert-Transform and then taking the square-root",
          "leaf": true,
          "iconCls": "task"
        }, {
          "name": "highpass",
          "description": "Butterworth-Highpass Filter : Filter data removing data below certain frequency freq using corners corners.",
          "leaf": true,
          "iconCls": "task",
          params: [{
            "name": "freq",
            "value": "",
            "description": "Filter corner frequency."
          }, {
            "name": "df",
            "value": "",
            "description": "Sampling rate in Hz"
          }, {
            "name": "corners",
            "value": 4,
            "description": "Filter corners / orders"
          }, {
            "name": "zerophase",
            "value": true,
            "description": "If True, apply filter once forwards and once backwards. This results in twice the number of corners but zero phase shift in the resulting filtered trace",
            "editor": {
              "xtype": "checkboxfield"
            },
            "render": {
              "xtype": "checkboxfield"
            }
          }, ]
        }



      ]
    }, {
      "name": "resample",
      "description": "Resample data in all traces of stream using Fourier method",
      "leaf": true,
      "iconCls": "task",
      "params": [{
        "name": "sampling_rate",
        "value": 0.0,
        "description": "The sampling rate of the resampled signal",
        "editor": {
          "xtype": "numberfield",
          "step": 0.01,
          "maxValue": 0.5,
          "minValue": 0
        }
      }]


    }
  ]
};

// doc : http://docs.sencha.com/extjs/5.0/5.0.1-apidocs/#!/api/Ext.grid.column.Check
Ext.require([
  'Ext.data.*',
  'Ext.grid.*',
  'Ext.tree.*'
]);

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
  data: pei,
  folderSort: true
});

var workflow_store = Ext.create('Ext.data.Store', {
  model: 'workflow_model',
  data: []
});

//Ext.ux.tree.TreeGrid is no longer a Ux. You can simply use a tree.TreePanel
Ext.define('CF.view.MisfitTree', {
  extend: 'Ext.tree.Panel',
  alias: 'widget.misfit_tree',
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
Ext.define('CF.view.MisfitGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.misfit_grid',

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

Ext.define('CF.view.MisfitPropertyGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.misfit_property_grid',
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

Ext.define('CF.view.MisfitCenterPanel', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.misfit_center_panel',
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
      xtype: 'misfit_grid',
    }]
  }, {
    region: 'center',
    flex: 1,

    margins: '0 0 0 0',
    items: [{
      xtype: 'misfit_property_grid',
    }]

  }] //,layout: 'vbox'
});

Ext.define('CF.view.Misfit', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.misfit',
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
    items: [{
      xtype: 'misfit_tree',
    }]
  }, {
    region: 'center',
    //height:"100%",
    layout: 'fit',
    margins: '0 0 0 0',
    //items : {layout:"vbox",items:[grid,property_grid]}
    items: [{
      xtype: 'misfit_center_panel',
    }],
  }]
});
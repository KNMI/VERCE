//Ext.ux.tree.TreeGrid is no longer a Ux. You can simply use a tree.TreePanel
Ext.define('CF.view.ProcessingTree', {

  extend: 'Ext.tree.Panel',
  alias: 'widget.processing_tree',
  requires: ['CF.store.PE'],
  initComponent: function(options) {
    this.store = Ext.create('CF.store.PE', {});

    this.callParent(arguments);
  },

  title: 'Available PEs',
  //width: 500,
  height: 300,

  //renderTo: Ext.getBody(),
  collapsible: false,
  useArrows: true,
  rootVisible: false,
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
    dataIndex: 'ui_name'
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
  initComponent: function(options) {
    this.store = Ext.create('CF.store.PEWorkflow', {
      data: []
    });

    this.callParent();
  },

  title: 'PE Workflow',
  //width: 500,
  //height: 200,
  layout: 'fit',
  width: "100%",
  //renderTo: Ext.getBody(),
  collapsible: false,
  useArrows: true,
  rootVisible: false,
  multiSelect: false,
  singleExpand: true,
  selType: 'rowmodel',
  tbar: [{
    xtype: "combo",
    itemId: "output_combo",
    store: ["velocity", "displacement", "acceleration"],
    fieldLabel: 'output unit'
  }, {
    xtype: "checkbox",
    itemId: "rotation_checkbox",
    fieldLabel: 'rotation'
  }],
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
      property_grid.setTitle("parameters of step " + (index) + ": " + d.data.ui_name);

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


        // reorder inside the workflow_store : let extjs manage that                    
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
            "ui_name": d.ui_name,
            "include_visu": true,
            "include_store": true,
            "raw": true,
            "synt": true,
            params: p
          });
        } else {
          this.store.add({
            "name": d.name,
            "ui_name": d.ui_name,
            "include_visu": true,
            "include_store": true,
            "raw": true,
            "synt": true,
            params: p
          });
        }

        this.getSelectionModel().selectRange(index, index);
        return 0;
      }
    }
  },
  getJson: function() {


    var msg = {
      "output_units": this.down("#output_combo").getValue(),
      "rotate_to_ZRT": this.down("#rotation_checkbox").getValue(),
      "data_processing": [],
      "synthetics_processing": []
    };

    $.each(this.store.getRange(), function(i, r) {
      if (r.data.raw == true) {
        var step = {
          "type": r.data.name
        };

        if (r.data.params != null) {
          step["parameters"] = {};

          $.each(r.data.params, function(i2, p) {
            if (p.array_name != null) {
              if (step["parameters"][p.array_name] == null) {
                step["parameters"][p.array_name] = new Array(p.array_size);
              }
              step["parameters"][p.array_name][p.array_pos] = p.value;
            } else {
              step["parameters"][p.name] = p.value;
            }
          });

        }
        msg["data_processing"].push(step);

        if (r.data.include_visu == true) {
          msg["data_processing"].push({
            "type": "plot_stream",
            "parameters": {
              "source": r.data.name,
              "tag": "data"
            }
          });
        }

        if (r.data.include_store == true) {
          msg["data_processing"].push({
            "type": "store_stream",
            "parameters": {
              "source": r.data.name,
              "tag": "data"
            }
          });
        }

      }
    });

    $.each(this.store.getRange(), function(i, r) {
      if (r.data.synt == true) {
        var step = {
          "type": r.data.name
        };

        if (r.data.params != null) {
          step["parameters"] = {};
          $.each(r.data.params, function(i2, p) {
            if (p.array_name != null) {
              if (step["parameters"][p.array_name] == null) { // array is not created yet
                step["parameters"][p.array_name] = new Array(p.array_size); // create it
              }
              step["parameters"][p.array_name][p.array_pos] = p.value;
            } else {
              step["parameters"][p.name] = p.value;
            }
          });
        }
        msg["synthetics_processing"].push(step);

        if (r.data.include_visu == true) {
          msg["synthetics_processing"].push({
            "type": "plot_stream",
            "parameters": {
              "source": r.data.name,
              "tag": "synt"
            }
          });
        }

        if (r.data.include_store == true) {
          msg["synthetics_processing"].push({
            "type": "store_stream",
            "parameters": {
              "source": r.data.name,
              "tag": "synt"
            }
          });
        }

      }
    });

    return msg;
  },
  dockedItems: [

    {
      xtype: 'toolbar',
      dock: 'bottom',
      items: [{
        xtype: 'button',
        text: 'remove selected step',
        handler: function() {
          var grid = this.up('grid');
          var selection = grid.getView().getSelectionModel().getSelection()[0];
          if (selection) {
            var store = selection.store;
            var index = store.indexOf(selection);
            store.remove(selection);

            // TODO if index out of range : get last record, + remove all selection if no records in store
            var records_left = store.data.items.length;
            if (records_left > index) {
              grid.getView().getSelectionModel().selectRange(index, index);
            } else if (records_left > 0) {
              grid.getView().getSelectionModel().selectRange(records_left - 1, records_left - 1);
            }
          }
        }
      }, {
        xtype: 'tbfill'
      }, {
        xtype: 'button',
        text: 'get values',

        handler: function() {

          var msg = this.up("panel").getJson();
          var str = JSON.stringify(msg, null, 2);
          console.log(str);
          alert(str);
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
        dataIndex: 'ui_name',
        sortable: false
      }, {
        text: 'visu',
        dataIndex: 'include_visu',
        xtype: 'checkcolumn'
      }, {
        text: 'store',
        dataIndex: 'include_store',
        xtype: 'checkcolumn'
      }, {
        text: 'raw',
        dataIndex: 'raw',
        xtype: 'checkcolumn'
      }, {
        text: 'synt',
        dataIndex: 'synt',
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
      id: 'processing',
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

Ext.define('CF.model.MisfitStation', {
  extend: 'Ext.data.Model',
  fields: [{
      name: 'network',
      type: 'string'
    }, {
      name: 'station',
      type: 'string'
    }, {
      name: 'count',
      type: 'integer'
    }, {
      name: 'net_sta',
      type: 'string'
    }, {
      name: 'selected',
      type: 'boolean'
    }
    /*
            {name: 'isFromDataStage',     type: 'boolean'},
            {name: 'isFromRawStage',     type: 'boolean'},
            {name: 'data_stagein_from',     type: 'array'},
            {name: 'raw_stagein_from',     type: 'array'},
            */
  ]
});

function updateSimulationStation(newStore) {
  var stationStore = Ext.getCmp("commonStations").getStore();

  var stationToRemove = Ext.create('Ext.data.Store', {
    model: 'CF.model.MisfitStation'
  });
  // 1) remove all station from simulation stage
  for (var i = 0; i < stationStore.getCount(); i++) {
    var d = stationStore.getAt(i);
    // all station are unselected
    d.data.selected = false;
    if (d.data.isFromDataStage == true) {
      if (d.data.isFromRawStage == true) {
        d.data.isFromDataStage = false;
        d.data.data_stagein_from = [];
      } else {
        stationToRemove.add(d);
      }
    }
  }

  for (var i = 0; i < stationToRemove.getCount(); i++) {
    var d = stationToRemove.getAt(i);
    stationStore.remove(d);
  }

  // now add station from newStore
  for (var i = 0; i < newStore.getCount(); i++) {
    var d = newStore.getAt(i);
    var content = d.content();
    var location = d.data.location;
    for (var j = 0; j < content.getCount(); j++) {
      var e = content.getAt(j);
      var sta = e.get("station");
      var net = e.get("network");
      if (sta != null && net != null && sta != "" && net != "") {
        var net_sta = net + "." + sta;
        var station = stationStore.findRecord('net_sta', net_sta);
        if (station == null) {
          data_stagein_from = [location];
          raw_stagein_from = [];
          stationStore.add({
            network: net,
            station: sta,
            net_sta: net_sta,
            selected: false,
            isFromDataStage: true,
            isFromRawStage: false,
            data_stagein_from: data_stagein_from,
            raw_stagein_from: raw_stagein_from
          });
        } else {
          // station already in array but we have to add location                       
          station.get("data_stagein_from").push(location);
          station.set("isFromDataStage", true);

        }

      }

    }
  }

}

function updateRawStation(newStore) {
  var stationStore = Ext.getCmp("commonStations").getStore();

  var stationToRemove = Ext.create('Ext.data.Store', {
    model: 'CF.model.MisfitStation'
  });
  // 1) remove all station from simulation stage
  for (var i = 0; i < stationStore.getCount(); i++) {
    var d = stationStore.getAt(i);
    d.data.selected = false;
    if (d.data.isFromRawStage == true) {
      if (d.data.isFromDataStage == true) {
        d.data.isFromRawStage = false;
        d.data.raw_stagein_from = [];
      } else {
        stationToRemove.add(d);
      }
    }
  }

  for (var i = 0; i < stationToRemove.getCount(); i++) {
    var d = stationToRemove.getAt(i);
    stationStore.remove(d);
  }

  // now add station from newStore
  for (var i = 0; i < newStore.getCount(); i++) {
    var d = newStore.getAt(i);
    var content = d.content();
    var location = d.data.location;
    for (var j = 0; j < content.getCount(); j++) {
      var e = content.getAt(j);
      var sta = e.get("station");
      var net = e.get("network");
      if (sta != null && net != null && sta != "" && net != "") {
        var net_sta = net + "." + sta;
        var station = stationStore.findRecord('net_sta', net_sta);
        if (station == null) {
          data_stagein_from = [];
          raw_stagein_from = [location];
          stationStore.add({
            network: net,
            station: sta,
            net_sta: net_sta,
            selected: false,
            isFromDataStage: false,
            isFromRawStage: true,
            data_stagein_from: data_stagein_from,
            raw_stagein_from: raw_stagein_from
          });
        } else {
          // station already in array but we have to add location                       
          station.get("raw_stagein_from").push(location);
          station.set("isFromRawStage", true);
        }
      }
    }
  }
}

Ext.define('CF.view.ProcessingSetup', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.processing_setup',

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
});

Ext.define('CF.model.RunId', {
  extend: 'Ext.data.Model',
  fields: [{
    name: 'workflowName', // workflowId?
    type: 'string'
  }, {
    name: '_id', // name
    type: 'string'
  }, {
    name: 'system_id', // full name (including date etc)
    type: 'string'
  }, {
    name: 'description', // desc
    type: 'string'
  }, {
    name: 'startTime', // starttime
    type: 'string'
  }]
});


Ext.define('CF.store.RunId', {
  extend: 'Ext.data.Store',
  model: 'CF.model.RunId',
  totalProperty: 'totalCount',

  leadingBufferZone: 30,
  purgePageCount: 0,
  autoLoad: true,

  proxy: {
    type: 'ajax',
    url: '/j2ep-1.0/prov/workflow',

    extraParams: {
      username: userSN,
    },
    reader: {
      type: 'json',
      rootProperty: 'runIds',
      totalProperty: 'totalCount'
    }
  }
});

Ext.define('CF.view.RunId', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.runid',

  initComponent: function() {
    this.store = Ext.create("CF.store.RunId", this.store);

    this.callParent(arguments);
  },

  title: 'list of RunID',
  columns: [{
    text: "RunID",
    dataIndex: '_id',
    flex: 2,
  }, {
    text: "Workflow name",
    dataIndex: 'workflowName',
    flex: 1,
  }, {
    text: "Description",
    dataIndex: 'description',
    flex: 2,
  }, {
    text: "Date",
    dataIndex: 'startTime',
    flex: 1,
  }],
  tools: [{
    type: 'refresh',
    tooltip: 'Refresh list',
    handler: function() {
      this.up('panel').getStore().removeAll();
      this.up('panel').getStore().load();
    },
  }],
  listeners: {
    rowclick: function(searchgrid, record, e) {
      var me = this;

      var st = new Ext.create("CF.store.Entity");
      st.getProxy().extraParams = this.rowExtraParams;
      st.getProxy().extraParams.runId = record.get('_id');


      st.on('load', function(newStore, records, successful, eOpts) {


        if (me.id == 'simulation_runs') {
          updateSimulationStation(newStore);
        } else {
          updateRawStation(newStore);
        }

        Ext.getCmp("commonStations").setLoading(false);

        Ext.getCmp("commonStations").getView().refresh();
      });
      Ext.getCmp("commonStations").setLoading(true);
      st.load();

    }
  },

});

Ext.define('CF.model.EntityParameters', {
  extend: 'Ext.data.Model',
  fields: [{
    name: 'val',
    type: 'string'
  }, {
    name: 'key',
    type: 'string'
  }]
});

Ext.define('CF.model.EntityContent', {
  extend: 'Ext.data.Model',
  fields: [{
    name: 'network',
    type: 'string'
  }, {
    name: 'longitude',
    type: 'float'
  }, {
    name: 'latitude',
    type: 'float'
  }, {
    name: 'npts',
    type: 'integer'
  }, {
    name: 'station',
    type: 'string'
  }, {
    name: 'location',
    type: 'string'
  }, {
    name: 'starttime',
    type: 'string'
  }, {
    name: 'delta',
    type: 'float'
  }, {
    name: 'calib',
    type: 'integer'
  }, {
    name: 'sampling_rate',
    type: 'integer'
  }, {
    name: 'endtime',
    type: 'string'
  }, {
    name: 'type',
    type: 'string'
  }, {
    name: 'id',
    type: 'string'
  }, {
    name: 'channel',
    type: 'string'
  }]
});

Ext.define('CF.model.Entity', {
  extend: 'Ext.data.Model',
  requires: [
    'CF.model.EntityParameters', 'CF.model.EntityContent'
  ],
  fields: [{
    name: 'id',
    type: 'string'
  }, {
    name: 'format',
    type: 'string'
  }, {
    name: 'runId',
    type: 'string'
  }, {
    name: 'port',
    type: 'string'
  }, {
    name: 'endTime',
    type: 'string'
  }],
  hasMany: [{
    model: 'CF.model.EntityParameters',
    name: 'parameters',
    associationKey: 'parameters'
  }, {
    model: 'CF.model.EntityContent',
    name: 'content',
    associationKey: 'content'
  }]
});

Ext.define('CF.store.Entity', {
  extend: 'Ext.data.Store',
  model: 'CF.model.Entity',
  proxy: {
    type: 'ajax',
    url: '/j2ep-1.0/prov/entities/values-range?mime-type=application/octet-stream',
    //url:'entities.json',
    extraParams: {
      runId: '',
      keys: "",
      maxvalues: "",
      minvalues: ""
    },
    reader: {
      type: 'json',
      rootProperty: 'entities',
      totalProperty: 'totalCount'
    }
  }
});

Ext.define('CF.store.EntityContent', {
  extend: 'Ext.data.Store',
  model: 'CF.model.EntityContent'
});

Ext.define('CF.view.StationGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.station_grid',
  initComponent: function() {
    this.store = Ext.create('Ext.data.Store', {
      model: 'CF.model.MisfitStation'
    });

    this.callParent(arguments);
  },

  title: 'commons stations',
  id: 'commonStations',

  getJson: function() {

    var networks = [];
    var stations = [];
    var data_stagein_from = [];
    var raw_stagein_from = [];

    $.each(this.getStore().getRange(), function(i, r) {
      if (r.data.selected) {
        networks.push(r.data.network);
        stations.push(r.data.station);
        data_stagein_from.push(r.data.data_stagein_from);
        raw_stagein_from.push(r.data.raw_stagein_from);
      }
    });
    var result = {
      "data": [{
        "input": {
          "data_dir": "run_id/data",
          "synt_dir": "run_id/synth",
          "events_dir": "./",
          "stations_dir": "run_id/stationxml",
          "output_dir": "run_id/output",
          "data_stagein_from": data_stagein_from,
          "raw_stagein_from": raw_stagein_from,
          "network": networks,
          "station": stations
        }


      }]
    };
    return result;
  },
  dockedItems: [{
    xtype: 'toolbar',
    dock: 'bottom',
    items: [{
      xtype: 'button',
      text: 'get json',
      handler: function() {
        var msg = this.up("grid").getJson();
        var str = JSON.stringify(msg, null, 2);
        console.log(str);
        alert(str);
      }
    }]
  }],

  columns: [{
    text: 'Selection',
    xtype: 'checkcolumn',
    dataIndex: 'selected',
    listeners: {
      checkchange: function(column, recordIndex, checked) {
        var record = this.up("grid").getStore().getAt(recordIndex);

        if (record.get("isFromDataStage") == false || record.get("isFromRawStage") == false) {
          record.set("selected", false);
        }

      }
    },
  }, {
    text: 'Network',
    dataIndex: 'network',
    flex: 1,
  }, {
    text: 'Station',
    dataIndex: 'station',
    flex: 1,
  }],

  listeners: {
    cellclick: function(thisRef, td, cellIndex, record, tr, rowIndex, e, eOpts) {


      if (record.get("isFromDataStage") == false || record.get("isFromRawStage") == false) {
        return;
      }
      if (cellIndex !== 0) { //Considering index 0 is checkbox column
        record.set("selected", !record.get("selected"));
      }
    }
  },
  viewConfig: {
    markDirty: false,
    getRowClass: function(record, index) {
      if (record.get("isFromDataStage") == false || record.get("isFromRawStage") == false) {
        return 'x-item-disabled';
      } else {
        return 'bold-cell';
      }
    }
  }
});

Ext.define('CF.view.DataSetup', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.data_setup',

  layout: 'border', // border
  height: "100%",
  title: 'Data Setup',
  bodyBorder: false,

  defaults: {
    collapsible: false,
    split: true,
    bodyPadding: 0
  },

  items: [{
    xtype: 'runid',
    region: 'center',
    id: 'simulation_runs',
    height: '30%',
    width: '50%',
    title: 'Simulation runs',
    rowExtraParams: {
      "mime-type": "application/octet-stream",
      keys: "type",
      maxvalues: "velocity",
      minvalues: "velocity",
      start: 0,
      limit: 100
    },
    store: {
      proxy: {
        extraParams: {
          activities: "specfemRunSolverMov"
        }
      }
    }
  }, {
    xtype: 'runid',
    region: 'east',
    id: 'raw_data_download_runs',
    height: '30%',
    width: '50%',
    title: 'raw-data download runs',
    rowExtraParams: {
      activities: "PE_waveform_reader"
    },
    store: {
      proxy: {
        extraParams: {
          activities: "downloadPE"
        }
      }
    }
  }, {
    xtype: 'station_grid',
    region: 'south',
    height: '70%',
  }]
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
    xtype: 'tabpanel',
    region: 'center',
    layout: 'fit',
    bodyBorder: false,

    items: [{
      xtype: 'data_setup',
    }, {
      xtype: 'processing_setup',
    }, {
      xtype: 'form',
      layout: 'fit',
      height: "100%",
      width: '100%',
      title: 'Submit',
      id: 'processing_submit',
      bodyBorder: false,

      defaults: {
        collapsible: false,
        // split: true,
        bodyPadding: 0
      },

      items: [{
        xtype: 'form',
        title: 'Submission review',
        layout: 'auto',
        height: '100%',
        bodyBorder: false,

        items: [{
          xtype: 'textareafield',
          id: 'processing_submit_stations',
          fieldLabel: 'Selected stations',
          disabled: true,
          disabledCls: '',
          width: '100%',
          height: '50%',
          value: 'QWEQWEQWE',
        }, {
          xtype: 'textareafield',
          id: 'processing_submit_pes',
          fieldLabel: 'PE pipeline',
          disabled: true,
          disabledCls: '',
          width: '100%',
          height: '50%',
          value: 'ASDASDASD',
        }],

        buttons: [{
          xtype: 'button',
          text: 'Submit',
          handler: function(button, event) {
            var url = submitProcessingWorkflowURL;

            if (processingWorkflow == null) {
              Ext.Msg.alert("No Workflow", "No workflow configured, cannot submit. Please contact an administrator.");
              return;
            }

            var params = {
              'workflowId': processingWorkflow.workflowId,
              'ownerId': processingWorkflow.ownerId,
              'workflowName': processingWorkflow.workflowName,
            };

            tabPanel = button.up('tabpanel');

            var simulation_runId = tabPanel.up().down('#simulation_runs').getSelectionModel().getSelection()[0].get('_id');
            var run_id = 'processing_' + simulation_runId.replace(/^simulation_/, '') + (new Date()).getTime();
            var download_runId = tabPanel.up().down('#raw_data_download_runs').getSelectionModel().getSelection()[0].get('_id');

            var stations = tabPanel.down('station_grid').getJson();

            if (stations.data[0].input.station.length <= 0) {
              Ext.Msg.alert('No stations', 'Please select one or more stations on the Data Setup tab.');
              return;
            }

            var PEs = tabPanel.down('processing_grid').getJson();

            if (PEs.data_processing.length <= 0 && PEs.synthetics_processing.length <= 0) {
              Ext.Msg.alert('No PEs', 'Please select one or more PEs on the Processing Setup tab.');
              return;
            }

            Ext.Ajax.request({
              url: '/j2ep-1.0/prov/workflow/' + runId,
              success: function(response, config) {
                var workflowProv = JSON.parse(response.responseText);
                var quakemlURL;
                var solver_conf;
                var vercepes;
                workflowProv.input.forEach(function(input) {
                  if (input.name === 'quakeml') {
                    quakemlURL = input.url;
                  } else if (input.name === 'solver_conf') {
                    solver_conf = input.url;
                  } else if (input.name === 'vercepes') {
                    vercepes = input.url;
                  }
                });

                params.input = [{
                    'name': 'quakeml',
                    'mime-type': 'application/xml',
                    'url': quakemlURL,
                  }, {
                    'url': '/j2ep-1.0/prov/workflow/' + runId,
                    'mime-type': 'text/json',
                    'name': 'simulation-workflow',
                  }, {
                    'url': '/j2ep-1.0/prov/workflow/' + download_runId,
                    'mime-type': 'text/json',
                    'name': 'download-workflow',
                  },
                  solver_conf,
                  vercepes,
                ];

                params.quakemlURL = quakemlURL;
                params.stations = Ext.encode(stations);
                params.PEs = Ext.encode(PEs);
                params.simulation_runId = simulation_runId;

                Ext.getCmp('viewport').setLoading(true);

                Ext.Ajax.request({
                  url: url,
                  params: params,
                  success: function(response, config) {
                    Ext.Msg.alert("Submission succeeded", "The processing workflow can now be monitored on the control panel.");
                    Ext.getCmp('viewport').setLoading(false);
                  },
                  failure: function(response, config) {
                    Ext.Msg.alert("Submission failed", response);
                    Ext.getCmp('viewport').setLoading(false);
                  },
                });

              },
              failure: function(response, config) {

              }
            });
          }
        }]
      }],
    }, {
      xtype: 'panel',
      title: 'Control',
      border: false,
      layout: 'fit',
      items: [{
        xtype: 'control',
        filters: [{
          property: 'prov:type',
          value: 'processing',
        }]
      }]
    }],

    listeners: {
      'tabchange': function(tabPanel, tab) {
        if (tab.id === 'processing_submit') {
          var stations = tabPanel.down('station_grid').getJson();
          var PEs = tabPanel.down('processing_grid').getJson();

          tabPanel.down('#processing_submit_stations').setValue(JSON.stringify(stations));
          tabPanel.down('#processing_submit_pes').setValue(JSON.stringify(PEs));
        }
      }
    }
  }],
});
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

Ext.define('pe_output_unit', {
	  extend: 'Ext.data.Model',
	  fields: ['output_unit']
	});
var output_unit_cartesian = Ext.create('Ext.data.Store', {
	 model: 'pe_output_unit',
    data: [["velocity"], ["displacement"], ["acceleration"]]
  });
var output_unit_globe = Ext.create('Ext.data.Store', {
    model: 'pe_output_unit',
    data: [["displacement"]]
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
  sortable: false,
  selType: 'rowmodel',
  tbar: [{
    xtype: "combo",
    itemId: "output_combo",
    id: "output_combo",
    editable: false,
    store: output_unit_cartesian,
    queryMode: 'local',
    displayField: 'output_unit',
    fieldLabel: 'output unit',
    value: "velocity"
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
            "include_visu": false,
            "include_store": false,
            "raw": true,
            "synt": true,
            params: p
          });
        } else {
          this.store.add({
            "name": d.name,
            "ui_name": d.ui_name,
            "include_visu": false,
            "include_store": false,
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
    var output_units = this.down("#output_combo").getValue();
    output_units = output_units != null ? output_units : "N/A";

    var msg = {
      "output_units": output_units,
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
              "tag": "data",
              "output_dir": "./output-images/"
            }
          });
        }

        if (r.data.include_store == true) {
          msg["data_processing"].push({
            "type": "store_stream",
            "parameters": {
              "source": r.data.name,
              "tag": "data",
              "output_dir": "./output-intermediate/"
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
              "tag": "synt",
              "output_dir": "./output-images/"
            }
          });
        }

        if (r.data.include_store == true) {
          msg["synthetics_processing"].push({
            "type": "store_stream",
            "parameters": {
              "source": r.data.name,
              "tag": "synt",
              "output_dir": "./output-intermediate/"
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
            {name: 'syn_stagein_from',     type: 'array'},
            {name: 'raw_stagein_from',     type: 'array'},
            */
  ]
}); 

function updateSimulationStation(newStore) {
  var stationGrid = Ext.getCmp("commonStations").getSelectionModel().deselectAll();

  var stationStore = Ext.getCmp("commonStations").getStore();
  stationStore.suspendEvents();

  var stationToRemove = [];
  // 1) remove all station from simulation stage
  for (var i = 0; i < stationStore.getCount(); i++) {
    var d = stationStore.getAt(i);
    // all station are unselected
    if (d.data.isFromDataStage == true) {
      if (d.data.isFromRawStage == true) {
        d.data.isFromDataStage = false;
        d.data.syn_stagein_from = [];
      } else {
        stationToRemove.push(d);
      }
    }
  }
  stationStore.remove(stationToRemove);

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
          stationStore.add({
            network: net,
            station: sta,
            net_sta: net_sta,
            selected: false,
            isFromDataStage: true,
            isFromRawStage: false,
            syn_stagein_from: [location],
            raw_stagein_from: [],
            stationxml_stagein_from: null
          });
        } else {
          // station already in array but we have to add location                       
          station.get("syn_stagein_from").push(location);
          station.set("isFromDataStage", true);
        }
      }
    }
  }

  stationStore.resumeEvents();
}

function updateRawStation(newStore) {
  var stationGrid = Ext.getCmp("commonStations").getSelectionModel().deselectAll();

  var stationStore = Ext.getCmp("commonStations").getStore();
  stationStore.suspendEvents();

  var stationToRemove = [];
  // 1) remove all station from simulation stage
  for (var i = 0; i < stationStore.getCount(); i++) {
    var d = stationStore.getAt(i);
    if (d.data.isFromRawStage == true) {
      if (d.data.isFromDataStage == true) {
        d.data.isFromRawStage = false;
        d.data.raw_stagein_from = [];
      } else {
        stationToRemove.push(d);
      }
    }
  }
  stationStore.remove(stationToRemove);

  // now add station from newStore
  for (var i = 0; i < newStore.getCount(); i++) {
    var d = newStore.getAt(i);
    var content = d.content();
    var location = d.data.location;
    // TODO replace with more robust extra call for data from provenance
    var stationxml_location = location.replace(/mseed\/([^.]*\.[^.]*)\.\.[^.]*\.mseed/g, "stationxml/$1.xml");
    for (var j = 0; j < content.getCount(); j++) {
      var e = content.getAt(j);
      var sta = e.get("station");
      var net = e.get("network");
      if (sta != null && net != null && sta != "" && net != "") {
        var net_sta = net + "." + sta;
        var station = stationStore.findRecord('net_sta', net_sta);
        if (station == null) {
          stationStore.add({
            network: net,
            station: sta,
            net_sta: net_sta,
            selected: false,
            isFromDataStage: false,
            isFromRawStage: true,
            syn_stagein_from: [],
            raw_stagein_from: [location],
            stationxml_stagein_from: stationxml_location
          });
        } else {
          // station already in array but we have to add location
          station.get("raw_stagein_from").push(location);
          station.set("stationxml_stagein_from", stationxml_location);
          station.set("isFromRawStage", true);
        }
      }
    }
  }

  stationStore.resumeEvents();
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
  extend: 'Ext.data.BufferedStore',
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
var selectedRunId ="";
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
    xtype: 'datecolumn',
    format: 'd - m - Y',
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
        	 if(record.get('workflowName').includes("GLOBE"))
             {	               
                 Ext.getCmp('output_combo').value= 'displacement';
                 Ext.getCmp('output_combo').bindStore(output_unit_globe);
   	          
             }
             else
             {  
                 Ext.getCmp('output_combo').value= 'velocity';
                 Ext.getCmp('output_combo').bindStore(output_unit_cartesian);
             }
        	Ext.getCmp("commonStations").getStore().removeAll();
            updateSimulationStation(newStore); 
            selectedRunId=record.get('_id').replace("simulation","download");
            Ext.getCmp("raw_data_download_runs").getView().refresh(); 
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

var scoreFn = function(record) {
  return (record.get("isFromDataStage") ? 2 : 0) + (record.get("isFromRawStage") ? 1 : 0);
};

Ext.define('CF.CheckboxModel', {
  extend: 'Ext.selection.CheckboxModel',
  alias: 'selection.customcheckboxmodel',

  /**
   * @private
   */
  updateHeaderState: function() {
    // check to see if all records are selected
    var me = this,
      store = me.store,
      storeCount = store.queryBy(function(record, id) {
        return record.get("isFromDataStage") && record.get("isFromRawStage");
      }).count(),
      views = me.views,
      hdSelectStatus = false,
      selectedCount = 0,
      selected, len, i;

    if (!store.isBufferedStore && storeCount > 0) {
      selected = me.selected;
      hdSelectStatus = true;
      for (i = 0, len = selected.getCount(); i < len; ++i) {
        if (store.indexOfId(selected.getAt(i).id) === -1) {
          break;
        }
        ++selectedCount;
      }
      hdSelectStatus = storeCount === selectedCount;
    }

    if (views && views.length) {
      me.toggleUiHeader(hdSelectStatus);
    }
  }
});

Ext.define('CF.view.StationGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.station_grid',
  requires: 'Ext.selection.CheckboxModel',
  initComponent: function() {
    this.store = Ext.create('Ext.data.Store', {
      model: 'CF.model.MisfitStation',
      sorters: [{
        sorterFn: function(record1, record2) {
          return scoreFn(record1) > scoreFn(record2) ? 1 : (scoreFn(record1) === scoreFn(record2) ? 0 : -1);
        },
        direction: 'DESC',
      }]
    });

    this.callParent(arguments);
  },

  title: 'commons stations',
  id: 'commonStations',

  getJson: function() {
    var output_unit = this.up('tabpanel').down('processing_grid').getJson().output_units.substr(0, 1);

    var networks = [];
    var stations = [];
    var syn_stagein_from = [];
    var raw_stagein_from = [];
    var stationxml_stagein_from = [];

    $.each(this.getStore().getRange(), function(i, r) {
      if (r.data.selected) {
        networks.push(r.data.network);
        stations.push(r.data.station);

        syn_stagein_from = syn_stagein_from.concat(Ext.Array.filter(r.data.syn_stagein_from, function(item) {
          return item.replace(/.*\.seed([adv])$/, "$1") == output_unit;
        }));
        raw_stagein_from = raw_stagein_from.concat(r.data.raw_stagein_from);
        stationxml_stagein_from.push(r.data.stationxml_stagein_from);
      }
    });

    var simulation_runId = 'N/A';
    var runId = 'N/A';
    var selected_simulations = this.up().down('#simulation_runs').getSelectionModel().getSelection();
    if (selected_simulations.length >= 1) {
      simulation_runId = this.up().down('#simulation_runs').getSelectionModel().getSelection()[0].get('_id');
      runId = 'processing_' + simulation_runId.replace(/^simulation_/, '') + '_<suffix set at submission time>';
      Ext.getCmp("processing_runid").setValue(runId);
    }

    var result = {
      "user_name": userSN,
      "runId": runId,
      'nproc': Ext.getCmp('processing_nproc').getValue(),
      "readJSONstgin": [{
        "input": {
          "data_dir": "./data",
          "synt_dir": "./synth",
          "events": "../../quakeml",
          "event_id": "<set upon submission>",
          "stations_dir": "./stationxml",
          "output_dir": "./output",
          "syn_stagein_from": syn_stagein_from,
          "raw_stagein_from": raw_stagein_from,
          "stationxml_stagein_from": stationxml_stagein_from,
          "network": networks,
          "station": stations
        }
      }],
      "readDataPE": [{
        "input": {
          "data_dir": "./data",
          "synt_dir": "./synth",
          "events": "../../quakeml",
          "event_id": "<set upon submission>",
          "stations_dir": "./stationxml",
          "output_dir": "./output",
          "syn_stagein_from": syn_stagein_from,
          "raw_stagein_from": raw_stagein_from,
          "stationxml_stagein_from": stationxml_stagein_from,
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

  selModel: {
    selType: 'customcheckboxmodel',
    listeners: {
      beforeSelect: function(grid, record, index, eOpts) {
        if (!(record.get("isFromDataStage") && record.get("isFromRawStage"))) {
          return false;
        }
        return true;
      },
      select: function(grid, record, index, eOpts) {
        record.set("selected", true);
      },
      deselect: function(grid, record, index, eOpts) {
        record.set("selected", false);
      }
    }
  },

  columns: [{
    text: 'Network',
    dataIndex: 'network',
    flex: 1,
  }, {
    text: 'Station',
    dataIndex: 'station',
    flex: 1,
  }, {
    text: 'Source',
    renderer: function(value, metaData, record, rowIdx, colIdx, store, view) {
      var sources = [];
      if (record.get("isFromDataStage")) {
        sources.push("syn");
      }
      if (record.get("isFromRawStage")) {
        sources.push("raw");
      }
      return sources.join(", ");
    },
    cls: 'source'
  }],

  viewConfig: {
    markDirty: false,
    getRowClass: function(record, index) {
      if (record.get("isFromRawStage") && record.get("isFromDataStage")) {
        return "bold-cell";
      } else {
        // TODO hack: added x-grid-row because it was missing after click simulation, click download, click simulation
        return "x-item-disabled x-grid-row";
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
    selModel: { 
        pruneRemoved: false
    },    
    height: '30%',
    width: '50%',
    title: 'Simulation runs',
    rowExtraParams: {
      "mime-type": "application/octet-stream",
      start: 0,
      limit: 99999
    },
    store: {
      proxy: {
        extraParams: {
          activities: "kmlGenerator_INGV"
        }
      }
    }
  }, {
    xtype: 'runid',
    region: 'east',
    id: 'raw_data_download_runs',
    selModel: { 
        pruneRemoved: false
    },
    height: '30%',
    width: '50%',
    title: 'raw-data download runs',
    rowExtraParams: {
      activities: "PE_waveform_reader",
      start: 0,
      limit: 99999
    },
    store: {
      proxy: {
        extraParams: {
          activities: "downloadPE"
        }
      }
    },viewConfig: {
	    markDirty: false,
	    getRowClass: function(record, index) {
	      if (selectedRunId=="" || record.get("_id").includes(selectedRunId)) {
	        return "";
	      } else {
	        // TODO hack: added x-grid-row because it was missing after click simulation, click download, click simulation
	        return "x-grid-row-body-hidden";
	      }
	    }
	  }

  }, {
    xtype: 'station_grid',
    region: 'south',
    height: '70%',
  }], 
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
        layout: {
          type: 'vbox',
          align: 'stretch',
        },
        height: '100%',
        bodyBorder: false,

        items: [{
          xtype: 'textarea',
          id: 'processing_submit_stations',
          fieldLabel: 'Selected stations',
          disabled: true,
          disabledCls: '',
          width: '100%',
          height: '50%',
          value: 'QWEQWEQWE',
          flex: 1,
        }, {
          xtype: 'textarea',
          id: 'processing_submit_pes',
          fieldLabel: 'PE pipeline',
          disabled: true,
          disabledCls: '',
          width: '100%',
          height: '50%',
          value: 'ASDASDASD',
          flex: 1,
        }, {
          xtype: 'fieldset',
          title: 'Submission settings',
          items: [{
            xtype: 'workflowcombo',
            id: 'processing_workflow',
            store: Ext.create('CF.store.ExportedWorkflow', {
              data: processingWorkflows
            }),
          }, {
            xtype: 'textfield',
            id: 'processing_runid',
            disabled: true,
            fieldLabel: 'Name:',
          }, {
            xtype: 'textfield',
            id: 'processing_description',
            fieldLabel: 'Description:',
          }, {
            xtype: 'numberfield',
            id: 'processing_nproc',
            fieldLabel: 'NPROC',
            value: '64',
            step: 1,
          }]
        }],

        buttons: [{
          xtype: 'button',
          text: 'Submit',
          handler: function(button, event) {
            var url = submitProcessingWorkflowURL;

            var processingWorkflow = Ext.getCmp("processing_workflow").findRecordByValue(Ext.getCmp("processing_workflow").getValue());
            if (processingWorkflow == null) {
              Ext.Msg.alert("No Workflow", "No workflow configured, cannot submit. Please contact an administrator.");
              return;
            }

            var params = {
              'workflowId': processingWorkflow.get('workflowId'),
              'ownerId': processingWorkflow.get('ownerId'),
              'workflowName': processingWorkflow.get('workflowName'),
            };

            tabPanel = button.up('tabpanel');

            var wfConfig = tabPanel.down('station_grid').getJson();

            if (wfConfig.readJSONstgin[0].input.station.length <= 0) {
              Ext.Msg.alert('No stations', 'Please select one or more stations on the Data Setup tab.');
              return;
            }

            var PEs = tabPanel.down('processing_grid').getJson();

            if (PEs.data_processing.length <= 0 && PEs.synthetics_processing.length <= 0) {
              Ext.Msg.alert('No PEs', 'Please select one or more PEs on the Processing Setup tab.');
              return;
            }

            if (PEs.output_units == null) {
              Ext.Msg.alert("Please choose an output unit");
              return;
            }

            var simulation_runId = tabPanel.up().down('#simulation_runs').getSelectionModel().getSelection()[0].get('_id');
            var download_runId = tabPanel.up().down('#raw_data_download_runs').getSelectionModel().getSelection()[0].get('_id');
            var runId = 'processing_' + simulation_runId.replace(/^simulation_/, '') + '_' + (new Date()).getTime();;

            getWorkflowAndSolverConf(simulation_runId, function(err, workflowProv, solverconf_json) {
              if (err != null) {
                Ext.Msg.alert("Run missing", "Run missing from provenance, please try again with a different run.");
              }
              wfConfig.event_id = solverconf_json['events'][0];
              wfConfig.readJSONstgin[0].input.event_id = solverconf_json['events'][0];
              wfConfig.readDataPE[0].input.event_id = solverconf_json['events'][0];
              wfConfig.runId = runId;

              params.input = Ext.encode([{
                'url': '/j2ep-1.0/prov/workflow/export/' + simulation_runId + '?all=true&format=w3c-prov-xml',
                'mime-type': 'application/octet-stream',
                'prov:type': 'wfrun',
                'name': 'simulation_workflow',
              }, {
                'url': '/j2ep-1.0/prov/workflow/export/' + download_runId + '?all=true&format=w3c-prov-xml',
                'mime-type': 'application/octet-stream',
                'prov:type': 'wfrun',
                'name': 'download_workflow',
              }, ]);

              params.config = Ext.encode(wfConfig);
              params.PEs = Ext.encode(PEs);
              params.description = Ext.getCmp('processing_description').getValue();
              params.quakemlURL = workflowProv.quakeml.url;

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

          tabPanel.down('#processing_submit_stations').setValue(JSON.stringify(stations, null, 2));
          tabPanel.down('#processing_submit_pes').setValue(JSON.stringify(PEs, null, 2));
        }
      }
    }
  }],
});


var wfStore = Ext.create('CF.store.Workflow', {
  proxy: {
    type: 'ajax',
    url: getWorkflowListURL,
    reader: {
      rootProperty: 'list'
    }
  },
  autoLoad: true
});

var config = null;
var params = null;

var handleSelect = function(grid, workflow, rowIndex, listeners) {
  var workflow = wfStore.getAt(rowIndex);
  var runId = workflow.get('name');

  config = {
    'simulationRunId': runId,
    'runId': 'download_' + runId,
    'downloadPE': [{
      'input': {
        // TODO handle multiple events
        'minimum_interstation_distance_in_m': 100,
        'channel_priorities': ['BH[E,N,Z]', 'EH[E,N,Z]'],
        'location_priorities': ['', '00', '10'],
        'mseed_path': 'mseed',
        'DT': null,
        'NSTEP': null,
        'stationxml_path': null,
      }
    }]
  };

  params = {
    // TODO
    'workflowId': downloadWorkflow.workflowId,
    'ownerId': downloadWorkflow.ownerId,
    'workflowName': downloadWorkflow.workflowName,
  };

  // get workflow from prov
  // && get solver configuration from liferay document store
  getWorkflowAndSolverConf(runId, function(err, prov_workflow, solver_conf) {
    if (err != null) {
      Ext.Msg.alert("Error", err);

      return;
    }

    // get the events
    var event_url = prov_workflow.quakeml.url.replace(/http:\/\/[^\/]*\//, '/');

    getEventData(event_url, function(err, events) {
      if (err != null) {
        Ext.Msg.alert("Error", err);

        return;
      }

      config.downloadPE[0].input.ORIGIN_TIME = events[0].startTime;
      config.downloadPE[0].input.DT = Ext.Array.findBy(solver_conf.fields, function(field) {
        return field.name == 'DT';
      }).value;
      config.downloadPE[0].input.NSTEP = Ext.Array.findBy(solver_conf.fields, function(field) {
        return field.name == 'NSTEP';
      }).value;
      config.downloadPE[0].input.stationxml_path = solver_conf.station_url;

      if (solver_conf.custom_mesh) {
        config.downloadPE[0].input.minlatitude = solver_conf.custom_mesh_boundaries.minlat;
        config.downloadPE[0].input.maxlatitude = solver_conf.custom_mesh_boundaries.maxlat;
        config.downloadPE[0].input.minlongitude = solver_conf.custom_mesh_boundaries.minlon;
        config.downloadPE[0].input.maxlongitude = solver_conf.custom_mesh_boundaries.maxlon;

        Ext.getCmp('download_submit_summary').setValue(JSON.stringify(config.downloadPE[0], null, 4));
        Ext.getCmp('download_submit_button').enable();
      } else {
        // get the meshes for the solver
        var solver_url = '/j2ep-1.0/prov/solver/' + solver_conf.solver;

        getMeshData(solver_url, solver_conf.mesh, function(err, mesh) {
          if (err != null) {
            Ext.Msg.alert("Error", err);

            return;
          }

          config.downloadPE[0].input.minlatitude = mesh.geo_minLat;
          config.downloadPE[0].input.maxlatitude = mesh.geo_maxLat;
          config.downloadPE[0].input.minlongitude = mesh.geo_minLon;
          config.downloadPE[0].input.maxlongitude = mesh.geo_maxLon;

          Ext.getCmp('download_submit_summary').setValue(JSON.stringify(config.downloadPE[0], null, 4));
          Ext.getCmp('download_submit_button').enable();
        });
      }
    });
  });
};

var doSubmitDownloadWorkflow = function(config, params) {
  var url = submitDownloadWorkflowURL;
  params.config = Ext.encode(config);

  Ext.getCmp('viewport').setLoading(true);

  Ext.Ajax.request({
    url: url,
    params: params,
    success: function(response, config) {
      Ext.Msg.alert("Submission succeeded", "The download workflow can now be monitored on the control panel.");
      Ext.getCmp('viewport').setLoading(false);
      wfStore.load();
    },
    failure: function(response, config) {
      Ext.Msg.alert("Submission failed", response);
      Ext.getCmp('viewport').setLoading(false);
    },
  });
};

Ext.define('CF.view.SimulationSelection', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.simulation_selection',
  store: wfStore,

  columns: [{
    text: 'Name',
    flex: 1,
    sortable: true,
    dataIndex: 'name'
  }, {
    text: 'Desc',
    flex: 1,
    sortable: true,
    dataIndex: 'desc',
    renderer: function(value, metaData, record, row, col, store, gridView) {
      if (value == null || value === '' || value === 'null') {
        return '-';
      }

      return value;
    }
  }, {
    text: 'Workflow',
    flex: 1,
    sortable: true,
    dataIndex: 'workflowName',
    renderer: function(value, metaData, record, row, col, store, gridView) {
      if (value == null || value === '' || value === 'null') {
        return 'n/a';
      }

      return value;
    }
  }, {
    text: 'Date',
    width: 90,
    sortable: true,
    renderer: Ext.util.Format.dateRenderer('d - m - Y'),
    dataIndex: 'date'
  }],
  flex: 1,
  initComponent: function() {
    this.callParent(arguments);
  },
  listeners: {
    select: handleSelect,
  }
});


Ext.define('CF.view.Download', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.download_panel',
  id: 'download_panel',
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
      title: 'Setup',
      bodyBorder: false,

      layout: 'fit',
      viewConfig: {
        style: {
          overflow: 'scroll',
          overflowX: 'hidden'
        }
      },
      dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        height: 35,
        items: ["->", {
          tooltip: 'Refresh list',
          handler: function() {
            wfStore.load();
          },
          style: {
            background: 'none',
            backgroundImage: 'url(' + localResourcesPath + '/img/refresh-icon.png)',
            backgroundSize: '90% 85%',
            backgroundRepeat: 'no-repeat',
            height: 32,
            width: 45,
            margin: 1,
            marginRight: '10px'
          },
          height: 35,
          width: 35
        }]
      }],
      items: [{
        xtype: 'form',
        layout: 'anchor',

        items: [{
          xtype: 'simulation_selection',
          anchor: '100% 50%',
        }, {
          xtype: 'textarea',
          id: 'download_submit_summary',
          disabled: true,
          disabledCls: '',
          anchor: '100% 50%',
        }],

        buttons: [{
          xtype: 'button',
          text: 'Submit',
          id: 'download_submit_button',
          disabled: true,
          handler: function() {
            doSubmitDownloadWorkflow(config, params);
          },
        }],
      }],
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
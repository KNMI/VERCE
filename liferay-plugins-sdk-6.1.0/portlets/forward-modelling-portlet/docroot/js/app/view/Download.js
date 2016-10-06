var handleSelect = function(grid, workflow, rowIndex, listeners) {
  Ext.getCmp('download_submit_button').enable();
};

var getDownloadJSON = function(runId, callback) {
  var config = {
    'simulationRunId': runId,
    'runId': 'download_' + runId.replace(/^simulation_/, '') + '_<suffix set at submission time>',
    'nproc': Ext.getCmp('download_nproc').getValue(),
    'downloadPE': [{
      'input': {
        // TODO handle multiple events
        'minimum_interstation_distance_in_m': 100,
        'channel_priorities': ['BH[E,N,Z]', 'EH[E,N,Z]'],
        'location_priorities': ['', '00', '10'],
        'mseed_path': './mseed',
        'stationxml_path': './stationxml',
        'DT': null,
        'NSTEP': null,
      }
    }]
  };

  var params = {};

  // get workflow from prov
  // && get solver configuration from liferay document store
  getWorkflowAndSolverConf(runId, function(err, prov_workflow, solver_conf, workflow_url) {
    if (err != null) {
      callback(err);
      return;
    }

    // get the events
    var event_url = prov_workflow.quakeml.url.replace(/http:\/\/[^\/]*\//, '/');

    getEventData(event_url, solver_conf.events, function(err, events) {
      if (err != null) {
        callback(err);
        return;
      }

      params.input = Ext.encode([{
        'url': '/j2ep-1.0/prov/workflow/export/' + runId + '?all=true&format=w3c-prov-xml',
        'mime-type': 'application/octet-stream',
        'prov:type': 'wfrun',
        'name': 'simulation_workflow',
      }]);

      params.description = Ext.getCmp('download_description').getValue();

      config.downloadPE[0].input.ORIGIN_TIME = events[0].startTime;
      config.downloadPE[0].input.DT = Ext.Array.findBy(solver_conf.fields, function(field) {
        return field.name == 'DT';
      }).value;
      config.downloadPE[0].input.NSTEP = Ext.Array.findBy(solver_conf.fields, function(field) {
        return field.name == 'NSTEP';
      }).value;

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
            callback(err);
            return;
          }

          config.downloadPE[0].input.minlatitude = mesh.geo_minLat;
          config.downloadPE[0].input.maxlatitude = mesh.geo_maxLat;
          config.downloadPE[0].input.minlongitude = mesh.geo_minLon;
          config.downloadPE[0].input.maxlongitude = mesh.geo_maxLon;

          callback(null, config, params);
        });
      }
    });
  });
}

var doSubmitDownloadWorkflow = function(config, params, callback) {
  var url = submitDownloadWorkflowURL;
  params.config = Ext.encode(config);

  var downloadWorkflow = Ext.getCmp('download_workflow').findRecordByValue(Ext.getCmp('download_workflow').getValue());
  if (downloadWorkflow == null) {
    Ext.Msg.alert("No Workflow", "No workflow configured, cannot submit. Please contact an administrator.");
    return;
  }

  params['workflowId'] = downloadWorkflow.get('workflowId');
  params['ownerId'] = downloadWorkflow.get('ownerId');
  params['workflowName'] = downloadWorkflow.get('workflowName');

  Ext.getCmp('viewport').setLoading(true);

  Ext.Ajax.request({
    url: url,
    params: params,
    success: function(response, config) {
      Ext.Msg.alert("Submission succeeded", "The download workflow can now be monitored on the control panel.");
      Ext.getCmp('viewport').setLoading(false);
      callback();
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

  columns: [{
    text: 'Name',
    flex: 1,
    sortable: true,
    dataIndex: '_id'
  }, {
    text: 'Desc',
    flex: 1,
    sortable: true,
    dataIndex: 'description',
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
    xtype: 'datecolumn',
    width: 90,
    sortable: true,
    format: 'd - m - Y',
    dataIndex: 'startTime'
  }],
  flex: 1,
  initComponent: function() {
    this.store = Ext.create('CF.store.ProvWorkflow', {
      proxy: {
        type: 'ajax',
        url: "/j2ep-1.0/prov/workflow",
        reader: {
          rootProperty: 'list'
        },
        api: {
          read: PROV_SERVICE_BASEURL + 'workflow?username=' + userSN + '&activities=PE_extractMesh',
        },
        reader: {
          rootProperty: 'runIds',
          totalProperty: 'totalCount'
        },
      },
      autoLoad: true,
    });

    this.callParent(arguments);
  },
  listeners: {
    select: handleSelect,
  }
});

Ext.define('CF.view.Download', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.download_panel',
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
      items: [{
        xtype: 'simulation_selection',
        tools: [{
          type: 'refresh',
          tooltip: 'Refresh list',
          handler: function() {
            this.up('panel').getStore().load();
          },
        }],
      }]
    }, {
      xtype: 'panel',
      layout: 'border', // border
      height: "100%",
      title: 'Submit',
      id: 'download_submit',
      bodyBorder: false,

      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      viewConfig: {
        style: {
          overflow: 'scroll',
          overflowX: 'hidden'
        }
      },
      items: [{
        xtype: 'textarea',
        id: 'download_submit_summary',
        disabled: true,
        disabledCls: '',
        flex: 1,
      }, {
        xtype: 'fieldset',
        title: 'Submission settings',
        items: [{
          xtype: 'workflowcombo',
          id: 'download_workflow',
          store: Ext.create('CF.store.ExportedWorkflow', {
            data: downloadWorkflows
          }),
        }, {
          xtype: 'textfield',
          id: 'download_runid',
          disabled: true,
          fieldLabel: 'Name:',
        }, {
          xtype: 'textfield',
          id: 'download_description',
          fieldLabel: 'Description:',
        }, {
          xtype: 'numberfield',
          id: 'download_nproc',
          fieldLabel: 'NPROC',
          value: '64',
          step: 1,
        }]
      }],

      buttons: [{
        xtype: 'button',
        text: 'Submit',
        id: 'download_submit_button',
        disabled: true,
        handler: function() {
          var self = this;
          var runId = this.up('tabpanel').down('simulation_selection').getSelection()[0].get('_id');
          getDownloadJSON(runId, function(err, config, params) {
            config.runId = 'download_' + runId.replace(/^simulation_/, '') + '_' + (new Date()).getTime();
            doSubmitDownloadWorkflow(config, params, function() {
              self.up('tabpanel').down('control').down('grid').getStore().reload();
            });
          });
        },
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
          value: 'download',
        }]
      }]
    }],
    listeners: {
      'beforetabchange': function(tabPanel, tab) {
        if (tab.id === 'download_submit') {
          if (this.up('panel').down('simulation_selection').getSelection().length === 0) {
            Ext.Msg.alert("No simulation run selected", "Please select a simulation run first.");
            return false;
          }
        }
      },
      'tabchange': function(tabPanel, tab) {
        if (tab.id === 'download_submit') {
          var runId = this.up('panel').down('simulation_selection').getSelection()[0].get('_id');
          Ext.getCmp('download_runid').setValue('download_' + runId.replace(/^simulation_/, '') + '_<suffix set at submission time>');
          Ext.getCmp('download_submit_summary').setLoading(true);
          getDownloadJSON(runId, function(err, config, params) {
            Ext.getCmp('download_submit_summary').setValue(JSON.stringify(config, null, 2));
            Ext.getCmp('download_submit_summary').setLoading(false);
          });
        }
      }
    }
  }],
});
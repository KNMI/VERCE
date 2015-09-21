var handleSelect = function(grid, workflow, rowIndex, listeners) {
  var runId = this.getSelection()[0].get('_id');
  this.up('tabpanel').down('#misfit_runid').setValue(runId + '_<suffix set at submission time>');
};

var getMisfitJSON = function(runId, callback) {
  // get workflow from prov
  // && get solver configuration from liferay document store
  getWorkflowAndSolverConf(runId, function(err, prov_workflow, solver_conf, workflow_url) {
    if (err != null) {
      Ext.Msg.alert("Error", err);

      return;
    }

    // get the events
    var event_url = prov_workflow.quakeml.url.replace(/http:\/\/[^\/]*\//, '/');

    Ext.Ajax.request({
      method: "GET",
      url: "/j2ep-1.0/prov/entities/values-range",
      params: {
        "activity": "StoreStream",
        "mime-type": "application/octet-stream",
        "keys": "prov:type",
        "minvalues": "observed-waveform",
        "maxvalues": "observed-waveform",
        "runId": runId,
        "start": 0,
        "limit": 1000
      },
      success: function(response, config) {
        var observed = JSON.parse(response.responseText);

        Ext.Ajax.request({
          method: "GET",
          url: "/j2ep-1.0/prov/entities/values-range",
          params: {
            "activity": "StoreStream",
            "mime-type": "application/octet-stream",
            "keys": "prov:type",
            "minvalues": "synthetic-waveform",
            "maxvalues": "synthetic-waveform",
            "runId": runId,
            "start": 0,
            "limit": 1000
          },
          success: function(response, config) {
            var synthetics = JSON.parse(response.responseText);

            Ext.Ajax.request({
              method: "GET",
              url: "/j2ep-1.0/prov/entities/values-range",
              params: {
                "mime-type": "application/xml",
                "runId": runId,
                "start": 0,
                "limit": 1000
              },
              success: function(response, config) {
                var stations = JSON.parse(response.responseText);

                // "file://wn1//home/aspinuso/concrete_misfit_preproc2/output/"
                var data_path = observed.entities[0].location.replace(/[^.\/]*.[^.\/]*.[^.\/]*.observed.seed$/, "");
                // "file://wn1//home/aspinuso/concrete_misfit_preproc2/stationxml/"
                var station_path = stations.entities[0].location[0].replace(/[^.\/]*.[^.\/]*.xml$/, "");

                var misfitConfStore = Ext.getCmp('misfit_conf').getStore();
                var parameters = {};
                for (var ii = 0; ii < misfitConfStore.data.items.length; ++ii) {
                  parameters[misfitConfStore.data.items[ii].get('name')] = misfitConfStore.data.items[ii].get('value');
                }
                parameters.misfit_type = Ext.getCmp('misfit_type').getRawValue();

                var streamProducers = {};
                for (var ii = 0; ii < stations.entities.length; ++ii) {
                  var station = stations.entities[ii];
                  var station_file = station.location[0].replace(station_path, "");
                  var resultStation = {
                    "input": {
                      "quakeml": "../../quakeml",
                      "stationxml": "./stationxml/" + station_file,
                      "event_id": solver_conf.events[0], // "smi:webservices.rm.ingv.it/fdsnws/event/1/query?eventId=1744261",
                      "synthetics": [
                        // "./IV.SGG.HXZ.synthetic.seed",
                      ],
                      "data": [
                        // "./IV.SGG.BHZ.observed.seed",
                      ],
                      "output_folder": "./output/",
                      "parameters": parameters,
                    }
                  };

                  var network_dot_name = station.location[0].replace(station_path, "").split(".").slice(0, -1).join(".");
                  streamProducers[network_dot_name] = resultStation;
                }

                // Add synthetics
                for (var ii = 0; ii < synthetics.entities.length; ++ii) {
                  var network_dot_name = synthetics.entities[ii].location.replace(data_path, "").split(".").slice(0, -3).join(".");
                  streamProducers[network_dot_name].input.synthetics.push(synthetics.entities[ii].location.replace(data_path, ""));
                }

                // Add observations
                for (var ii = 0; ii < observed.entities.length; ++ii) {
                  var network_dot_name = observed.entities[ii].location.replace(data_path, "").split(".").slice(0, -3).join(".");
                  streamProducers[network_dot_name].input.data.push(observed.entities[ii].location.replace(data_path, ""));
                }

                var config = {
                  "user_name": userSN,
                  'processingRunId': runId,
                  'runId': Ext.getCmp('misfit_runid').getValue(),
                  'nproc': Ext.getCmp('misfit_nproc').getValue(),
                  "readJSONstgin": [{
                    "input": {
                      "data_dir": "./",
                      "synt_dir": "./",
                      "events": "../../quakeml",
                      // TODO multiple events
                      "event_id": solver_conf.events[0], // "smi:webservices.rm.ingv.it/fdsnws/event/1/query?eventId=1744261"
                      "stations_dir": "./stationxml/",
                      "output_dir": "./output/",
                      // TODO why an array?
                      "data_stagein_from": [
                        data_path
                      ],
                      "stationxml_stagein_from": [
                        station_path
                      ]
                    }
                  }],
                  "streamProducer": Ext.Object.getValues(streamProducers),
                };

                var params = {};

                params.config = config;
                params.description = Ext.getCmp('misfit_description').getValue();
                params.quakemlURL = prov_workflow.quakeml.url;

                params.input = Ext.encode([
                  prov_workflow.simulation_workflow,
                  prov_workflow.download_workflow, {
                    'url': '/j2ep-1.0/prov/workflow/' + runId,
                    'mime-type': 'text/json',
                    'name': 'processing_workflow',
                  }
                ]);

                callback(null, config, params);
                return;
              },
              failure: function(response, config) {
                callback("Failed to get synthetic-waveform provenance");
              },
            });
          },
          failure: function(response, config) {
            callback("Failed to get observed-waveform provenance");
          },
        });
      },
      failure: function(response, config) {
        callback("Failed to get observed-waveform provenance");
      },
    });
  });
};

var doSubmitMisfitWorkflow = function(config, params, callback) {
  var url = submitMisfitWorkflowURL;
  params.config = Ext.encode(config);

  var misfitWorkflow = Ext.getCmp('misfit_workflow').findRecordByValue(Ext.getCmp('misfit_workflow').getValue());
  if (misfitWorkflow == null) {
    Ext.Msg.alert("No Workflow", "No workflow configured, cannot submit. Please contact an administrator.");
    return;
  }

  params['workflowId'] = misfitWorkflow.get('workflowId');
  params['ownerId'] = misfitWorkflow.get('ownerId');
  params['workflowName'] = misfitWorkflow.get('workflowName');

  Ext.getCmp('viewport').setLoading(true);

  Ext.Ajax.request({
    url: url,
    params: params,
    success: function(response, config) {
      Ext.Msg.alert("Submission succeeded", "The misfit workflow can now be monitored on the control panel.");
      Ext.getCmp('viewport').setLoading(false);
      callback();
    },
    failure: function(response, config) {
      Ext.Msg.alert("Submission failed", response);
      Ext.getCmp('viewport').setLoading(false);
    },
  });
};

Ext.define('CF.view.PreprocessingSelection', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.preprocessing_selection',

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
    format: 'd - m - Y',
    width: 90,
    sortable: true,
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
          read: PROV_SERVICE_BASEURL + 'workflow?username=' + userSN + '&activities=StreamMapper,readJSONstgin,StoreStreamChannel',
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

Ext.define('CF.view.Misfit', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.misfit_panel',
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
    height: "100%",
    bodyBorder: false,

    items: [{
      xtype: 'panel',
      height: "100%",
      title: 'Setup',
      bodyBorder: false,

      defaults: {
        collapsible: false,
        split: true,
        bodyPadding: 0
      },

      items: [{
        xtype: 'preprocessing_selection',
        height: 250,
        tools: [{
          type: 'refresh',
          tooltip: 'Refresh list',
          handler: function() {
            this.up('panel').getStore().load();
          },
        }],
      }, {
        xtype: 'combobox',
        fieldLabel: 'Misfit type:',
        id: 'misfit_type',
        queryMode: 'local',
        displayField: 'name',
        valueField: 'parameters',
        allowBlank: false,
        store: Ext.create("CF.store.MisfitType"),
        listeners: {
          change: function(f, e) {
            var conf = this.up('panel').down('conf');
            conf.getStore().loadData(this.getValue());
            conf.enable();
          }
        }
      }, {
        xtype: 'conf',
        height: 300,
        store: Ext.create('CF.store.MisfitConf'),
        features: [{
          id: 'grouping',
          ftype: 'grouping',
          startCollapsed: false
        }],
        id: 'misfit_conf',
      }],
    }, {
      xtype: 'panel',
      title: 'Submit',
      id: 'misfit_submit',
      border: false,
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: [{
        xtype: 'textarea',
        title: 'Configuration Summary',
        id: 'misfit_submit_summary',
        disabled: true,
        disabledCls: '',
        flex: 2,
      }, {
        xtype: 'fieldset',
        title: 'Submission settings',
        items: [{
          xtype: 'workflowcombo',
          id: 'misfit_workflow',
          store: Ext.create('CF.store.ExportedWorkflow', {
            data: misfitWorkflows
          }),
        }, {
          xtype: 'textfield',
          id: 'misfit_runid',
          disabled: true,
          fieldLabel: 'Name:',
        }, {
          xtype: 'textfield',
          id: 'misfit_description',
          fieldLabel: 'Description:',
        }, {
          xtype: 'numberfield',
          id: 'misfit_nproc',
          fieldLabel: 'NPROC',
          value: '64',
          step: 1,
        }]
      }],

      buttons: [{
        xtype: 'button',
        text: 'Submit',
        id: 'misfit_submit_button',
        handler: function() {
          var self = this;

          var processing_runId = this.up('tabpanel').down('preprocessing_selection').getSelection()[0].get('_id');
          var runId = 'misfit_' + processing_runId.replace(/^processing_/, '') + '_' + (new Date()).getTime();

          getMisfitJSON(processing_runId, function(err, config, params) {
            config.runId = runId;
            doSubmitMisfitWorkflow(config, params, function() {
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
          value: 'misfit',
        }]
      }]
    }],
    listeners: {
      'beforetabchange': function(tabPanel, tab) {
        var processing_run = this.up('panel').down('preprocessing_selection').getSelection()[0];
        if (processing_run == null) {
          Ext.Msg.alert("No processing run selected", "Please select a processing run first");
          return false;
        }
      },
      'tabchange': function(tabPanel, tab) {
        if (tab.id === 'misfit_submit') {
          var processing_run = this.up('panel').down('preprocessing_selection').getSelection()[0];
          var runId = processing_run.get('_id');
          Ext.getCmp('misfit_submit_summary').setLoading(true);
          getMisfitJSON(runId, function(err, config, params) {
            Ext.getCmp('misfit_submit_summary').setValue(JSON.stringify(config, null, 2));
            Ext.getCmp('misfit_submit_summary').setLoading(false);
          });
        }
      }
    }
  }],
});
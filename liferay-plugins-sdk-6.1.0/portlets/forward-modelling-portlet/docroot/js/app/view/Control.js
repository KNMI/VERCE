var reuse_mesh=null;
var handleDownloadLogfiles = function(grid, rowIndex, colIndex) {
var rec = grid.getStore().getAt(rowIndex);
  window.open(downloadWorkflowOutputURL + '&workflowId=' + rec.get('workflowId'), '_self');
};

var handleViewResults = function(grid, rowIndex, colIndex) {
  var record = grid.getStore().getAt(rowIndex);

  var activityStore = Ext.data.StoreManager.lookup('activityStore');
  var artifactStore = Ext.data.StoreManager.lookup('artifactStore');

  activityStore.setProxy({
    type: 'ajax',
    url: PROV_SERVICE_BASEURL + 'workflowexecutions/' + encodeURIComponent(record.get("name"))+'showactivity',
    reader: {
      rootProperty: '@graph',
      totalProperty: 'totalCount'
    },
    simpleSortMode: true
  });
  sys.prune();
  artifactStore.removeAll();
  activityStore.removeAll();
  activityStore.load({
    callback: function() {
      currentRun = record.get("name")
      Ext.getCmp('filtercurrent').enable();
      Ext.getCmp('searchartifacts').enable();
      Ext.getCmp('downloadscript').enable();
    }
  });

  activityStore.on('load', onStoreLoad, this, {
    single: true
  });
  currentRun = record.get("name");
  owner = userSN;

  this.up('viewport > #viewport_tabpanel').setActiveTab('resultstab');
};

var getSolverConf = function(solverconf, callback) {
  Ext.Ajax.request({
    url: solverconf.url.replace(/http:\/\/[^\/]*\//, '/'),
    success: function(response, config) {
      var solver_conf = JSON.parse(response.responseText);
      if (solver_conf === null) {
        Ext.Msg.alert("Failed to get workflow settings");
        Ext.getCmp('viewport').setLoading(false);
        return;
      }

      // callback without error
      callback(null, solver_conf);
    },
    failure: function(response, config) {
      // error callback
      callback("Failed to get workflow settings!");
    }
  });
}

var getWorkflowAndSolverConf = function(runId, callback) {
  var url = PROV_SERVICE_BASEURL+"workflowexecutions/" + encodeURIComponent(runId);

  Ext.Ajax.request({
    url: url,
    params: {},
    method: 'GET',
    success: function(response, config) {
      var prov_workflow = JSON.parse(response.responseText);

      if (prov_workflow == null) {
        Ext.getCmp('viewport').setLoading(true);
        Ext.Msg.alert("Error", "Workflow missing from provenance repository. Please contact support and list the workflow name and username.");
        return;
      }

      prov_workflow.input.forEach(function(item) {
        prov_workflow[item.name] = item;
      });

      if (prov_workflow.solverconf != null) {
        getSolverConf(prov_workflow.solverconf, function(err, solverconf) {
          callback(err, prov_workflow, solverconf, url);
        });
      } else {
        Ext.Ajax.request({
          url: prov_workflow.simulation_workflow.url.replace(/\/export\//, '/').replace(/\?.*$/, ''),
          success: function(response, config) {
            var simulation_workflow = JSON.parse(response.responseText);
            simulation_workflow.input.forEach(function(item) {
              simulation_workflow[item.name] = item;
            });
            getSolverConf(simulation_workflow.solverconf, function(err, solverconf) {
              callback(err, prov_workflow, solverconf, url);
            });
          },
          failure: function(response, config) {
            // error callback
            callback("Failed to get workflow settings!");
          }
        });
      }
    },
    failure: function(response, config) {
      // error callback
      callback("Failed to get workflow from provenance api!");
    }
  });
}

var handleReuse = function(grid, rowIndex, colIndex) {
  var self = this;

  var rec = grid.getStore().getAt(rowIndex);

  Ext.getCmp('viewport').setLoading(true);
  // number of asynchronous calls remaining
  var numRemaining = 3;

  getWorkflowAndSolverConf(rec.get('name'), function(err, prov_workflow, solver_conf) {
    if (err != null) {
      Ext.Msg.alert("Error", err);
      Ext.getCmp('viewport').setLoading(false);

      return;
    }

    // reuse solver
    var solverType = Ext.getCmp('solvertype');
    var solver = solverType.store.findRecord('name', solver_conf.solver);
    if (solver != null) {
      solverType.clearValue();
      solverType.setValue(solver.get('abbr'));
    } else {
      // TODO fix partial reuse when solver unavailable
      Ext.Msg.alert("Solver from old run now unavailable. Please select another one on the Solver tab.");
      Ext.getCmp('viewport').setLoading(false);
      return;
    }

    self.up('viewport > #viewport_tabpanel').setActiveTab('simulationtab');
 
    // Reuse bespoke type meshes
    if(solver_conf.bespoke_mesh_boundaries)
    {
    	reuse_mesh = {data: solver_conf.bespoke_mesh_boundaries};
    }
    // reuse velocity when velocity model store finishes loading
    var velocityCombo = Ext.getCmp('velocity');
    velocityCombo.store.addListener('refresh', function() {
      velocityCombo.setValue(solver_conf.velocity_model);

      if (solver_conf.custom_mesh) {
        velocityCombo.up('form').getForm().findField('minlat').setValue(solver_conf.custom_mesh_boundaries.minlat);
        velocityCombo.up('form').getForm().findField('maxlat').setValue(solver_conf.custom_mesh_boundaries.maxlat);
        velocityCombo.up('form').getForm().findField('minlon').setValue(solver_conf.custom_mesh_boundaries.minlon);
        velocityCombo.up('form').getForm().findField('maxlon').setValue(solver_conf.custom_mesh_boundaries.maxlon);
      }

      CF.app.getController('Map').getStore('SolverConf').loadData(solver_conf.fields);

      // HACK ensure correct event binding order by binding here
      var eventLayer = CF.app.getController('Map').mapPanel.map.getLayersByName('Events')[0];
      CF.app.getController('Map').getStore('Event').bind(eventLayer);

      eventLayer.events.on({
        featureadded: function(event) {},
        featuresadded: function(event) {
          event.features.forEach(function(feature) {
            if (solver_conf.events.indexOf(feature.data.eventId) >= 0) {
              CF.app.getController('Map').mapPanel.map.getControl('dragselect').select(feature);
            } else {
              CF.app.getController('Map').mapPanel.map.getControl('dragselect').unselect(feature);
            }
          });
          eventLayer.events.un(this);
          if (--numRemaining === 0) {
            Ext.getCmp('viewport').setLoading(false);
          }
        },
        scope: this
      });

      // reuse events
      CF.app.getController('Map').getEvents(CF.app.getController('Map'), prov_workflow.quakeml.url.replace(/http:\/\/[^\/]*\//, '/'));

      var stationFileType = prov_workflow.stations['mime-type'] === 'application/xml' ? STXML_TYPE : STPOINTS_TYPE;
      var record = Ext.getCmp('station-filetype').getStore().findRecord('abbr', stationFileType);
      Ext.getCmp('station-filetype').select(stationFileType);

      // HACK ensure correct event binding order by binding here
      var stationLayer = CF.app.getController('Map').mapPanel.map.getLayersByName('Stations')[0];
      CF.app.getController('Map').getStore('Station').bind(stationLayer);

      stationLayer.events.on({
        featureadded: function(event) {},
        featuresadded: function(event) {
          event.features.forEach(function(feature) {
            if (solver_conf.stations.indexOf(feature.data.network + '.' + feature.data.station) >= 0) {
              CF.app.getController('Map').mapPanel.map.getControl('dragselect').select(feature);
            } else {
              CF.app.getController('Map').mapPanel.map.getControl('dragselect').unselect(feature);
            }
          });
          stationLayer.events.un(this);
          if (--numRemaining === 0) {
            Ext.getCmp('viewport').setLoading(false);
          }
        },
        scope: this
      });

      // reuse stations
      CF.app.getController('Map').getStations(CF.app.getController('Map'), prov_workflow.stations.url.replace(/http:\/\/[^\/]*\//, '/'), stationFileType);

      // Only set old workflow if it's still available
      if (prov_workflow.workflowId != null) {
        var workflowDropdown = Ext.getCmp('wfSelection');
        if (workflowDropdown.store.findRecord('workflowId', prov_workflow.workflowId) == null) {
          Ext.Msg.alert("Error", "Workflow used in old run not available anymore. Select a new workflow in the Submit tab.");
          workflowDropdown.clearValue();
        } else {
          workflowDropdown.setValue(prov_workflow.workflowId);
        }
      }

      Ext.getCmp('submitName').setValue(prov_workflow._id.slice(0, -14)); // remove runid
      Ext.getCmp('submitMessage').setValue(prov_workflow.description);
    }, this, {
      single: true
    });

    // set mesh when solverconfstore finishes loading
    CF.app.getController('Map').getStore('SolverConf').addListener('refresh', function() {
      // reuse mesh and trigger velocity store reload
      Ext.getCmp('meshes').setValue(solver_conf.mesh);
      if (--numRemaining === 0) {
        Ext.getCmp('viewport').setLoading(false);
      }
    }, this, {
      single: true
    });
  });
};

var handleDeleteInstance = function(grid, rowIndex, colIndex) {
  var encryptedIrodsSession = CF.app.getController('Map').encryptedIrodsSession;
  //TO BE HANDLED WITH THE NEW IRODS CLOUD BROWSER
  //if (encryptedIrodsSession == null) {
  //  Ext.Msg.alert('Error', 'Cannot remove run. Please log out from and back into iRods and try again.');
  //  return;
  //}

  var rec = grid.getStore().getAt(rowIndex);
  Ext.Msg.confirm('Warning', 'Are you sure that you want to delete ' + rec.get('name') + "?",
    function(btn) {
      if (btn === 'yes') {
        Ext.Ajax.request({
          url: deleteWorkflowURL,
          params: {
            "workflowId": rec.get('workflowId'),
            "encryptedIrodsSession": encryptedIrodsSession,
          },
          waitTitle: 'Deleting from data base',
          success: function(response, config) {
            grid.getStore().load();

            Ext.Ajax.request({ //delete from provenance
              url: PROV_SERVICE_BASEURL + "workflow/delete/" + rec.get('name'),
              method: 'POST',
              waitTitle: 'Deleting from provenance',
              waitMsg: 'Sending data...',
              failure: function() {
                Ext.Msg.alert("Error", "The workflow has been deleted from the data base but couldn't be deleted from the provenance");
              }
            });
          },
          failure: function(response, config) {
            Ext.Msg.alert("Error", "Delete failed!");
          }
        });
      }
    });
};

var getEventData = function(event_url, publicIds, callback) {
  Ext.Ajax.request({
    url: event_url,
    method: 'GET',
    params: {},
    success: function(response, config) {
      var quakeml = OpenLayers.Format.XML.prototype.read.apply(this, [response.responseText]);
      var eventsXML = quakeml.getElementsByTagName('event');

      var events = [];
      Array.prototype.forEach.call(eventsXML, function(eventXML) {
        var origin;
        
        if ($.inArray(eventXML.getAttribute('publicID'), publicIds)!=-1)
        {
        // Origin
        var prefOrigin = eventXML.getElementsByTagName('preferredOriginID')[0];
        var origins = eventXML.getElementsByTagName('origin');
        if (prefOrigin) {
          prefOrigin = prefOrigin.childNodes[0].nodeValue;
          for (var o = 0; o < origins.length; o++) {
            origin = origins[o];
            if (origin.getAttribute('publicID') == prefOrigin) break;
          }
        } else {
          if (origins.length > 0) origin = origins[0];
        }

        var timeElem = origin.getElementsByTagName('time')[0];
        var time = timeElem.getElementsByTagName('value')[0].firstChild.data;

        events.push({
          'startTime': time
        });
        }
      });

      // callback without error
      callback(null, events);
    },
    failure: function(response, config) {
      // error callback
      callback(response);
    }
  });
};

var getMeshData = function(solver_url, mesh_name, callback) {
  Ext.Ajax.request({
    url: solver_url,
    method: 'GET',
    params: {},
    success: function(response, config) {
      var solver = JSON.parse(response.responseText);

      var mesh;
      solver.meshes.forEach(function(_mesh) {
        if (_mesh.name === mesh_name) {
          mesh = _mesh;
        }
      });

      // callback without error
      callback(null, mesh);
    },
    failure: function(response, config) {
      // error callback
      callback(response);
    }
  });

};

Ext.define('CF.view.WfGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.wfgrid',
  viewConfig: {
    enableTextSelection: true,
  },

  loadMask: true,
  selModel: { 
      pruneRemoved: false
  }, 
  columns: [{
    text: 'Name',
    flex: 1,
    sortable: false,
    dataIndex: 'name'
  }, {
    text: 'Desc',
    flex: 1,
    sortable: false,
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
    sortable: false,
    dataIndex: 'workflowName',
    renderer: function(value, metaData, record, row, col, store, gridView) {
      if (value == null || value === '' || value === 'null') {
        return 'n/a';
      }

      return value;
    }
  }, {
    text: 'Grid',
    flex: 1,
    sortable: false,
    dataIndex: 'grid',
    renderer: function(value, metaData, record, row, col, store, gridView) {
      if (value == null || value === '' || value === 'null') {
        return 'n/a';
      }

      return value;
    }
  }, {
    text: 'Status',
    width: 75,
    sortable: false,
    renderer: statusRenderer,
    dataIndex: 'status'
  }, {
    xtype: 'datecolumn',
    format: 'd - m - Y',
    text: 'Date',
    width: 90,
    sortable: false,
    dataIndex: 'date'
  }, {
    xtype: 'actioncolumn',
    width: 55,
    items: []
  }],
  flex: 1,
  initComponent: function() {
    this.store = Ext.create('CF.store.Workflow', {
      proxy: {
        type: 'ajax',
        url: getWorkflowListURL,
        reader: {
          rootProperty: 'list'
        },
      },
      autoLoad: false,
      filters: this.config.filters,
      remoteFilter: true,
    });

    var actioncolumn;
    this.columns.forEach(function(column) {
      if (column.xtype === 'actioncolumn') {
        actioncolumn = column;
      }
    });

    actioncolumn.items = [{
      icon: localResourcesPath + '/img/Farm-Fresh_page_white_text.png',
      tooltip: 'Download logfiles',
      handler: handleDownloadLogfiles,
    }, {
      icon: localResourcesPath + '/img/eye-3-256.png',
      tooltip: 'View results',
      handler: handleViewResults,
    }, {
      icon: localResourcesPath + '/img/delete-icon.png',
      tooltip: 'Delete instance',
      handler: handleDeleteInstance,
    }];
    actioncolumn.width = 55;

    if (this.config.reuse != null) {
      actioncolumn.items.splice(2, 0, {
        icon: localResourcesPath + '/img/Farm-Fresh_arrow_rotate_clockwise.png',
        tooltip: 'Reuse',
        handler: handleReuse,
      });
      actioncolumn.width = 70;
    }

    this.callParent(arguments);
  }
});

Ext.define('CF.view.Control', {
  extend: 'Ext.form.Panel',
  alias: 'widget.control',
  layout: 'fit',
  viewConfig: {
    style: {
      overflow: 'scroll',
      overflowX: 'hidden'
    }
  },
  title: 'Submitted workflows',
  tools: [{
    type: 'refresh',
    tooltip: 'Refresh list',
    handler: function() {
      this.up('panel').down('grid').getStore().removeAll();
      this.up('panel').down('grid').getStore().load();
    },
  }, {
    type: 'custom',
    tooltip: 'Go to Document Library<br>(open in a new win)',
    handler: function() {
      openInNewTab('file-manager');
    },
    baseCls: 'x-tool-dl',
    style: {
      backgroundImage: 'url(' + localResourcesPath + '/img/folder-icon.png)',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      height: 16,
      width: 16,
      top: 0,
      margin: 1,
      cursor: 'pointer',
    }
  }],
  initComponent: function() {
    this.items = [{
      xtype: 'wfgrid',
      filters: this.filters,
      reuse: this.reuse,
    }];

    var self = this;

    var tab = this.up('#viewport_tabpanel > panel') || this.id === 'controltab' && this;

    if (tab != null) {
      tab.on('activate', function() {
        var store = self.down('grid').getStore();

        store.load();
      });
    }

    this.callParent(arguments);
  },
});

function statusRenderer(val) {
  if (val === 'INIT' || val === 'RUNNING') {
    return '<span style="color:green;">' + val + '</span>';
  } else if (val === 'ERROR') {
    return '<span style="color:red;">' + val + '</span>';
  }
  return val;
}

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}
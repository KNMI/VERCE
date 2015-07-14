var wfStore = Ext.create('CF.store.Workflow', {});

var handleDownloadLogfiles = function(grid, rowIndex, colIndex) {
  var rec = wfStore.getAt(rowIndex);

  window.open(downloadWorkflowOutputURL + '&workflowId=' + rec.get('workflowId'), '_self');
};

var handleViewResults = function(grid, rowIndex, colIndex) {
  var record = wfStore.getAt(rowIndex);

  var activityStore = Ext.data.StoreManager.lookup('activityStore');
  var artifactStore = Ext.data.StoreManager.lookup('artifactStore');

  activityStore.setProxy({
    type: 'ajax',
    url: PROV_SERVICE_BASEURL + 'activities/' + encodeURIComponent(record.get("name")),
    reader: {
      rootProperty: 'activities',
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

  this.up('viewport').getComponent('viewport_tabpanel').setActiveTab('resultstab');
};

var handleReuse = function(grid, rowIndex, colIndex) {
  var self = this;

  var rec = wfStore.getAt(rowIndex);

  Ext.getCmp('viewport').setLoading(true);
  // number of asynchronous calls remaining
  var numRemaining = 3;

  Ext.Ajax.request({
    url: "/j2ep-1.0/prov/workflow/" + encodeURIComponent(rec.get('name')),
    params: {},
    method: 'GET',
    success: function(response) {
      var prov_object = JSON.parse(response.responseText);

      if (prov_object == null) {
        Ext.getCmp('viewport').setLoading(true);
        Ext.Msg.alert("Error", "Workflow missing from provenance repository. Please contact support and list the workflow name and username.");
        return;
      }

      prov_object.input.forEach(function(item) {
        prov_object[item.name] = item;
      });
      delete prov_object.input;

      Ext.Ajax.request({
        url: prov_object.solverconf.url.replace(/http:\/\/[^\/]*\//, '/'),
        success: function(response) {
          var object = JSON.parse(response.responseText);
          if (object === null) {
            Ext.Msg.alert("Failed to get workflow settings");
            Ext.getCmp('viewport').setLoading(false);
            return;
          }

          // reuse solver
          var solverType = Ext.getCmp('solvertype');
          var solver = solverType.store.findRecord('name', object.solver);
          if (solver != null) {
            solverType.clearValue();
            solverType.setValue(solver.get('abbr'));
          } else {
            // TODO fix partial reuse when solver unavailable
            Ext.Msg.alert("Solver from old run now unavailable. Please select another one on the Solver tab.");
            Ext.getCmp('viewport').setLoading(false);
            return;
          }

          self.up('viewport').getComponent('viewport_tabpanel').setActiveTab('simulationtab');

          // reuse velocity when velocity model store finishes loading
          var velocityCombo = Ext.getCmp('velocity');
          velocityCombo.store.addListener('refresh', function() {
            velocityCombo.setValue(object.velocity_model);

            if (object.custom_mesh) {
              velocityCombo.up('form').getForm().findField('minlat').setValue(object.custom_mesh_boundaries.minlat);
              velocityCombo.up('form').getForm().findField('maxlat').setValue(object.custom_mesh_boundaries.maxlat);
              velocityCombo.up('form').getForm().findField('minlon').setValue(object.custom_mesh_boundaries.minlon);
              velocityCombo.up('form').getForm().findField('maxlon').setValue(object.custom_mesh_boundaries.maxlon);
            }

            CF.app.getController('Map').getStore('SolverConf').loadData(object.fields);

            // HACK ensure correct event binding order by binding here
            var eventLayer = CF.app.getController('Map').mapPanel.map.getLayersByName('Events')[0];
            CF.app.getController('Map').getStore('Event').bind(eventLayer);

            eventLayer.events.on({
              featureadded: function(event) {},
              featuresadded: function(event) {
                event.features.forEach(function(feature) {
                  if (object.events.indexOf(feature.data.eventId) >= 0) {
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
            CF.app.getController('Map').getEvents(CF.app.getController('Map'), prov_object.quakeml.url.replace(/http:\/\/[^\/]*\//, '/'));

            var stationFileType = prov_object.stations['mime-type'] === 'application/xml' ? STXML_TYPE : STPOINTS_TYPE;
            var record = Ext.getCmp('station-filetype').getStore().findRecord('abbr', stationFileType);
            Ext.getCmp('station-filetype').select(stationFileType);

            // HACK ensure correct event binding order by binding here
            var stationLayer = CF.app.getController('Map').mapPanel.map.getLayersByName('Stations')[0];
            CF.app.getController('Map').getStore('Station').bind(stationLayer);

            stationLayer.events.on({
              featureadded: function(event) {},
              featuresadded: function(event) {
                event.features.forEach(function(feature) {
                  if (object.stations.indexOf(feature.data.network + '.' + feature.data.station) >= 0) {
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
            CF.app.getController('Map').getStations(CF.app.getController('Map'), prov_object.stations.url.replace(/http:\/\/[^\/]*\//, '/'), stationFileType);

            // Only set old workflow if it's still available
            if (prov_object.workflowId != null) {
              var workflowDropdown = Ext.getCmp('wfSelection');
              if (workflowDropdown.store.findRecord('workflowId', prov_object.workflowId) == null) {
                Ext.Msg.alert("Error", "Workflow used in old run not available anymore. Select a new workflow in the Submit tab.");
                workflowDropdown.clearValue();
              } else {
                workflowDropdown.setValue(prov_object.workflowId);
              }
            }

            Ext.getCmp('submitName').setValue(prov_object._id.slice(0, -14)); // remove runid
            Ext.getCmp('submitMessage').setValue(prov_object.description);
          }, this, {
            single: true
          });

          // set mesh when solverconfstore finishes loading
          CF.app.getController('Map').getStore('SolverConf').addListener('refresh', function() {
            // reuse mesh and trigger velocity store reload
            Ext.getCmp('meshes').setValue(object.mesh);
            if (--numRemaining === 0) {
              Ext.getCmp('viewport').setLoading(false);
            }
          }, this, {
            single: true
          });
        },
        failure: function(response) {
          Ext.Msg.alert("Error", "Failed to get workflow settings!");
          Ext.getCmp('viewport').setLoading(false);
        }
      })
    },
    failure: function(response) {
      Ext.Msg.alert("Error", "Failed to get workflow from provenance api!");
      Ext.getCmp('viewport').setLoading(false);
    }
  });
};

var handleDeleteInstance = function(grid, rowIndex, colIndex) {
  var encryptedIrodsSession = CF.app.getController('Map').encryptedIrodsSession;
  if (encryptedIrodsSession == null) {
    Ext.Msg.alert('Error', 'Cannot remove run. Please log out from and back into iRods and try again.');
    return;
  }

  var rec = wfStore.getAt(rowIndex);
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
          success: function(response) {
            wfStore.load();

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
          failure: function(response) {
            Ext.Msg.alert("Error", "Delete failed!");
          }
        });
      }
    });
};

Ext.define('CF.view.WfGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.WfGrid',
  store: wfStore,
  id: 'wfGrid',

  viewConfig: {
    enableTextSelection: true,
  },

  loadMask: true,

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
    text: 'Date',
    width: 90,
    sortable: false,
    renderer: Ext.util.Format.dateRenderer('d - m - Y'),
    dataIndex: 'date'
  }, {
    xtype: 'actioncolumn',
    width: 70,
    items: [{
      icon: localResourcesPath + '/img/Farm-Fresh_page_white_text.png',
      tooltip: 'Download logfiles',
      handler: handleDownloadLogfiles,
    }, {
      icon: localResourcesPath + '/img/eye-3-256.png',
      tooltip: 'View results',
      handler: handleViewResults,
    }, {
      icon: localResourcesPath + '/img/Farm-Fresh_arrow_rotate_clockwise.png',
      tooltip: 'Reuse',
      handler: handleReuse,
    }, {
      icon: localResourcesPath + '/img/delete-icon.png',
      tooltip: 'Delete instance',
      handler: handleDeleteInstance,
    }]
  }],
  flex: 1,
  initComponent: function() {
    this.callParent(arguments);
  }
});

var refreshMenuControl = [{
    html: '<strong style="color: #416DA3; position: relative; font-size: 12px; top: -1px;">Submitted workflows</strong>'
  },
  "->", {
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
  }, {
    tooltip: 'Go to Document Library<br>(open in a new win)',
    height: 32,
    width: 32,
    handler: function() {
      openInNewTab('file-manager');
    },
    style: {
      background: 'none',
      backgroundImage: 'url(' + localResourcesPath + '/img/folder-icon.png)',
      backgroundSize: '90% 90%',
      backgroundRepeat: 'no-repeat',
      height: 32,
      width: 32,
      top: 0,
      margin: 1,
      marginRight: '10px'
    },
    height: 32,
    width: 32
  }
];

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
  dockedItems: [{
    xtype: 'toolbar',
    dock: 'top',
    height: 35,
    items: refreshMenuControl
  }],
  items: [{
    xtype: 'WfGrid'
  }]
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
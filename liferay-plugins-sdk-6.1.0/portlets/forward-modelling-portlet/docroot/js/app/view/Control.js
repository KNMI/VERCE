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

Ext.define('CF.view.WfGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.WfGrid',
  initComponent: function() {
    var controller = this.getController();

    Ext.apply(this, {
      store: wfStore,
      id: 'wfGrid',
      // selType: 'cellmodel',
      viewConfig: {
        enableTextSelection: true,
      },
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
        // }, {
        //   text: 'Workflow',
        //   width: 120,
        //   sortable: true,
        //   dataIndex: 'workflowId'
      }, {
        text: 'Status',
        width: 75,
        sortable: true,
        renderer: statusRenderer,
        dataIndex: 'status'
      }, {
        text: 'Date',
        width: 90,
        sortable: true,
        renderer: Ext.util.Format.dateRenderer('d - m - Y'),
        dataIndex: 'date'
      }, {
        xtype: 'actioncolumn',
        width: 55,
        items: [{
          icon: localResourcesPath + '/img/Farm-Fresh_page_white_text.png',
          tooltip: 'Download logfiles',
          handler: function(grid, rowIndex, colIndex) {
            var rec = wfStore.getAt(rowIndex);

            window.open(downloadWorkflowOutputURL + '&workflowId=' + rec.get('workflowId'), '_self');
          }
        }, {
          icon: localResourcesPath + '/img/Farm-Fresh_arrow_rotate_clockwise.png',
          tooltip: 'Reuse',
          handler: function(grid, rowIndex, colIndex) {
            var rec = wfStore.getAt(rowIndex);

            Ext.Ajax.request({
              url: "/j2ep-1.0/prov/workflow/" + encodeURIComponent(rec.get('name')),
              params: {},
              method: 'GET',
              success: function(response) {
                var prov_object = JSON.parse(response.responseText);

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
                      return;
                    }

                    // reuse solver
                    var solverType = Ext.getCmp('solvertype');
                    var solver = solverType.store.findRecord('name', object.solver);
                    solverType.clearValue();
                    solverType.setValue(solver.get('abbr'));

                    // reuse velocity when velocity model store finishes loading
                    var velocityCombo = Ext.getCmp('velocity');
                    velocityCombo.store.addListener('refresh', function() {
                      velocityCombo.setValue(object.velocity_model);

                      solverConfStore.loadData(object.fields);

                      // HACK ensure correct event binding order by binding here
                      var eventLayer = map.getLayersByName('Events')[0];
                      controller.eventstore.bind(eventLayer);

                      eventLayer.events.on({
                        featureadded: function(event) {},
                        featuresadded: function(event) {
                          event.features.forEach(function(feature) {
                            object.events.every(function(eventId) {
                              if (eventId === feature.data.eventId) {
                                map.getControl('clickselect').select(feature);
                                return false;
                              }
                              map.getControl('clickselect').unselect(feature);
                              return true;
                            });
                          });
                          eventLayer.events.un(this);
                        },
                        scope: this
                      });

                      // reuse events
                      getEvents(controller, prov_object.quakeml.url.replace(/http:\/\/[^\/]*\//, '/'));

                      var stationFileType = prov_object.stations['mime-type'] === 'application/xml' ? STXML_TYPE : STPOINTS_TYPE;
                      var record = Ext.getCmp('station-filetype').getStore().findRecord('abbr', stationFileType);
                      Ext.getCmp('station-filetype').select(stationFileType);

                      // HACK ensure correct event binding order by binding here
                      var stationLayer = map.getLayersByName('Stations')[0];
                      controller.stationstore.bind(stationLayer);

                      stationLayer.events.on({
                        featureadded: function(event) {},
                        featuresadded: function(event) {
                          event.features.forEach(function(feature) {
                            object.stations.every(function(stationId) {
                              if (stationId === (feature.data.network + '.' + feature.data.station)) {
                                map.getControl('dragselect').select(feature);
                                return false;
                              }
                              map.getControl('dragselect').unselect(feature);
                              return true;
                            });
                          })
                          stationLayer.events.un(this);
                        },
                        scope: this
                      });

                      // reuse stations
                      getStations(controller, prov_object.stations.url.replace(/http:\/\/[^\/]*\//, '/'), stationFileType);

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
                    solverConfStore.addListener('refresh', function() {
                      // reuse mesh and trigger velocity store reload
                      Ext.getCmp('meshes').setValue(object.mesh);
                    }, this, {
                      single: true
                    });
                  },
                  failure: function(response) {
                    Ext.Msg.alert("Error", "Failed to get workflow settings!");
                  }
                })
              },
              failure: function(response) {
                Ext.Msg.alert("Error", "Failed to get workflow from provenance api!");
              }
            })
          }
        }, {
          icon: localResourcesPath + '/img/delete-icon.png',
          tooltip: 'Delete instance',
          handler: function(grid, rowIndex, colIndex) {
            var rec = wfStore.getAt(rowIndex);
            Ext.Msg.confirm('Warning', 'Are you sure that you want to delete ' + rec.get('name') + "?",
              function(btn) {
                if (btn === 'yes') {
                  Ext.Ajax.request({
                    url: deleteWorkflowURL,
                    params: {
                      "workflowId": rec.get('workflowId')
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
          }
        }]
      }],
      flex: 1
    });
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
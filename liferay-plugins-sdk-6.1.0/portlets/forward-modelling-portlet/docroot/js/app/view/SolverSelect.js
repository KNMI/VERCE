var solverstore = Ext.create('CF.store.Solver', {});
var meshesstore = Ext.create('CF.store.Mesh', {});
var velocitystore = Ext.create('CF.store.Velocity', {});

// ComboBox with multiple selection enabled
var solvercombo = Ext.create('Ext.form.field.ComboBox', {
  fieldLabel: 'Solvers',
  name: 'solvertype',
  id: 'solvertype',
  displayField: 'abbr',
  store: solverstore,
  queryMode: 'local',
  flex: 1,
  getInnerTpl: function() {
    return '<div data-qtip="{abbr}">{abbr} {name}</div>';
  },
  listeners: {
    scope: this,
    'beforeselect': function(combo, record, index) {
      if (gl_mesh != null) {
        Ext.Msg.confirm('Alert!', 'You will lose the introduced data for ' + combo.getValue() + ', do you want to continue?',
          function(btn) {
            if (btn === 'no') {
              return false;
            }
          });
      } else {
        selectSolver(record.get('abbr'));
        return true;
      }
    },
    'change': function(combo, newValue, oldValue, eOpts) {
      // inconsistent use of name and abbr
      var record = combo.store.findRecord('abbr', newValue);

      clearMap();
      meshescombo.clearValue();
      meshescombo.store.removeAll();

      if (record == null) {
        Ext.getCmp('solver_doc_button').setDisabled(true);
        return;
      }
      //Load meshescombo, load conf form
      selectSolver(record.get('abbr'));

      Ext.getCmp('solver_doc_button').setDisabled(false);
    }
  }
});

var meshescombo = Ext.create('Ext.form.field.ComboBox', {
  fieldLabel: 'Meshes',
  name: 'meshes',
  id: 'meshes',
  displayField: 'name',
  flex: 1,
  store: meshesstore,
  queryMode: 'local',
  listeners: {
    scope: this,
    'load': function(combo) {},
    'change': function(combo) {
      gl_mesh = combo.getValue();
      if (gl_mesh == null) {
        Ext.getCmp('mesh_doc_button').setDisabled(true);
        return;
      }

      clearMap();
      var meshModel = combo.store.findRecord('name', gl_mesh);

      //Update the solver values
      updateSolverValues(meshModel.get('values'));

      //Populate the VelocityModel Combo
      velocitycombo.clearValue();
      velocitycombo.store.loadData(meshModel.get('velmod'));

      //Render the bounding box in the map and center it
      gl_minLat = meshModel.get('geo_minLat');
      gl_maxLat = meshModel.get('geo_maxLat');
      gl_minLon = meshModel.get('geo_minLon');
      gl_maxLon = meshModel.get('geo_maxLon');

      if (ctrl.mapPanel.map.getLayersByName("Boxes") != "")
        ctrl.mapPanel.map.removeLayer(ctrl.mapPanel.map.getLayersByName("Boxes")[0]);
      var layers = [];
      var boxes = new OpenLayers.Layer.Boxes("Boxes");
      var coord = [gl_minLon, gl_minLat, gl_maxLon, gl_maxLat];
      bounds = OpenLayers.Bounds.fromArray(coord);
      box = new OpenLayers.Marker.Box(bounds);
      box.setBorder("black");
      //box.events.register("click", box, function (e) {this.setBorder("yellow"); });
      boxes.addMarker(box);
      layers.push(boxes);
      ctrl.mapPanel.map.addLayers(layers);

      var centLon = gl_minLon + (gl_maxLon - gl_minLon) / 2;
      var centLat = gl_minLat + (gl_maxLat - gl_minLat) / 2;
      ctrl.mapPanel.map.setCenter([centLon, centLat]);
      ctrl.mapPanel.map.zoomToExtent(bounds);

      Ext.getCmp('mesh_doc_button').setDisabled(false);
    }
  }
});

var velocitycombo = Ext.create('Ext.form.field.ComboBox', {
  fieldLabel: 'Velocity Model',
  name: 'velocity',
  id: 'velocity',
  displayField: 'name',
  flex: 1,
  valueField: 'name',
  store: velocitystore,
  queryMode: 'local',
  listeners: {
    scope: this,
    'change': function(combo) {
      gl_velmod = combo.getValue();
      if (gl_velmod == null) {
        Ext.getCmp('velocitymodel_doc_button').setDisabled(true);
      }
      Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(false);
      Ext.getCmp('tabpanel_principal').down('#earthquakes').enable();
      Ext.getCmp('solver_but').enable();
      Ext.getCmp('velocitymodel_doc_button').setDisabled(false);
    }
  }
});

var formSolverSelect = Ext.create('Ext.form.Panel', {
  extend: 'Ext.form.Panel',
  alias: 'widget.solverselect',
  requires: ['CF.view.LinkButton'],
  width: 500,
  frame: false,
  border: false,
  bodyPadding: '10 10 0 10',
  defaults: {
    anchor: '100%',
    allowBlank: false,
    msgTarget: 'side',
    labelWidth: 70
  },
  items: [{
    xtype: 'container',
    width: '100%',
    margin: '5 0',
    items: [
      solvercombo, {
        xtype: 'button',
        id: 'solver_doc_button',
        icon: localResourcesPath + '/img/download-icon.png',
        margin: '0 0 0 5',
        tabIndex: 99,
        disabled: true,
        handler: function() {
          window.open(solvercombo.store.findRecord('abbr', solvercombo.getValue()).get('doc'), '_self');
        }
      }
    ],
    layout: {
      type: 'hbox'
    },
  }, {
    xtype: 'container',
    width: '100%',
    margin: '5 0',
    items: [
      meshescombo, {
        xtype: 'button',
        id: 'mesh_doc_button',
        icon: localResourcesPath + '/img/download-icon.png',
        margin: '0 0 0 5',
        tabIndex: 99,
        disabled: true,
        handler: function() {
          window.open(downloadMeshDetailsURL + '&solver=' + solvercombo.getValue() + '&meshName=' + meshescombo.getValue(), '_self');
        }
      }
    ],
    layout: {
      type: 'hbox'
    },
  }, {
    xtype: 'container',
    width: '100%',
    margin: '5 0',
    items: [
      velocitycombo, {
        xtype: 'button',
        id: 'velocitymodel_doc_button',
        icon: localResourcesPath + '/img/download-icon.png',
        margin: '0 0 0 5',
        tabIndex: 99,
        disabled: true,
        handler: function() {
          window.open(downloadVelocityModelDetailsURL + '&solver=' + solvercombo.getValue() + '&meshName=' + meshescombo.getValue() + '&velocityModelName=' + velocitycombo.getValue(), '_self');
        }
      }
    ],
    layout: {
      type: 'hbox'
    },
  }, {
    xtype: 'LinkButton',
    text: 'Click here to submit a new mesh and velocity model',
    handler: function(e) {
      e.stopEvent();
      meshSolverPopup();
    }
  }, {
    xtype: 'hidden',
    id: 'solver-filetype',
    name: 'filetype',
    value: SOLVER_TYPE
  }],
  buttons: [{
    itemId: 'solver_but',
    id: 'solver_but',
    text: 'Solver File',
    disabled: true,
    tooltip: 'Download solver input file',
    handler: function() {
      var solverConfStore = Ext.data.StoreManager.lookup('solverConfStore');
      solverConfStore.commitChanges();
      solverConfStore.save();
      var jsonString = '{"fields" :' + Ext.encode(Ext.pluck(solverConfStore.data.items, 'data')) + "}";
      var wsSolverUrl = '/j2ep-1.0/odc/verce-scig-api/solver/par-file/' + encodeURIComponent(gl_solver.toLowerCase());
      postRequest(wsSolverUrl, "jsondata", jsonString); // makes a call to the WS that, the user receives a file back  
    }
  }]
});

var meshSolverPopup = function() {
  var win = Ext.widget('window', {
    title: 'Submit a new mesh and velocity model',
    closeAction: 'destroy',
    width: 600,
    height: 550,
    layout: 'fit',
    modal: true,
    autoScroll: true,
    resizable: false,
    items: [{
      xtype: 'form',
      frame: false,
      border: false,
      bodyPadding: '10 10 0 10',
      items: [{
        xtype: 'displayfield',
        value: 'You can submit a new mesh and velocity model here. Currently we will check your submission by hand before adding them to the list of available meshes and models.'
      }, {
        xtype: 'fieldset',
        title: 'Mesh',
        items: [{
          xtype: 'filefield',
          fieldLabel: 'Upload a file...',
          name: 'mesh-file',
          id: 'mesh-file',
          msgTarget: 'side'
        }, {
          xtype: 'textfield',
          fieldLabel: '...or paste a link',
          name: 'mesh-link',
          id: 'mesh-link',
          msgTarget: 'side'
        }]
      }, {
        xtype: 'fieldset',
        title: 'Mesh Bounds',
        items: [{
          xtype: 'fieldcontainer',
          layout: 'hbox',
          items: [{
            xtype: 'textfield',
            fieldLabel: 'Minimum latitude',
            name: 'min_lat',
            id: 'min_lat',
            msgTarget: 'side',
            width: 200
          }, {
            xtype: 'textfield',
            fieldLabel: 'Maximum latitude',
            name: 'max_lat',
            id: 'max_lat',
            msgTarget: 'side',
            width: 200
          }]
        }, {
          xtype: 'fieldcontainer',
          layout: 'hbox',
          items: [{
            xtype: 'textfield',
            fieldLabel: 'Minimum longitude',
            name: 'min_lon',
            id: 'min_lon',
            msgTarget: 'side',
            width: 200
          }, {
            xtype: 'textfield',
            fieldLabel: 'Maximum longitude',
            name: 'max_lon',
            id: 'max_lon',
            msgTarget: 'side',
            width: 200
          }]
        }]
      }, {
        xtype: 'fieldset',
        title: 'Velocity Model',
        items: [{
          xtype: 'filefield',
          fieldLabel: 'Upload a file...',
          name: 'velocity-model-file',
          id: 'velocity-model-file',
          msgTarget: 'side'
        }, {
          xtype: 'textfield',
          fieldLabel: '...or paste a link',
          name: 'velocity-model-link',
          id: 'velocity-model-link',
          msgTarget: 'side'
        }]
      }, {
        xtype: 'fieldset',
        // title: 'Velocity Model',
        items: [{
          xtype: 'textareafield',
          fieldLabel: 'note',
          height: 120,
          width: 'auto',
          name: 'note',
          msgTarget: 'side'
        }]
      }],
      buttons: [{
        text: 'Submit',
        handler: function(button, event) {
          button.up('form').getForm().submit({
            url: meshVelocityModelUploadURL,
            waitMsg: 'Please wait while your submission is saved.',
            success: function(form, action) {
              Ext.Msg.alert('Success', 'Your mesh and velocity model have been submitted. We will keep you informed via email.', function() {
                form.owner.up('window').close();
              });
            },
            failure: function(form, action) {
              if (action.failureType === Ext.form.action.Action.CLIENT_INVALID) {} else if (action.failureType === Ext.form.action.Action.CONNECT_FAILURE) {
                Ext.Msg.alert('Connection Error', 'There was an error connecting to the server. Please try again.');
              } else if (action.failureType === Ext.form.action.Action.SERVER_INVALID) {
                // Ext.Msg.alert('Error', 'There was an error submitting your mesh and velocity model:\n' + action.result.message);
              }
            }
          });
        }
      }, {
        text: 'Cancel',
        handler: function(e) {
          this.up('window').close();
        }
      }]
    }]
  });
  win.show();
}

Ext.define('CF.view.SolverSelect', {
  extend: 'Ext.form.Panel',
  bodyPadding: '0 0 10 0',
  items: [formSolverSelect]
});

function updateSolverValues(newValues) {
  var solverConfStore = Ext.data.StoreManager.lookup('solverConfStore');
  for (var i = 0; i < newValues.length; i++) {
    //alert(JSON.stringify(newValues[i]));
    for (var propertyName in newValues[i]) {
      var record = solverConfStore.findRecord("name", propertyName);
      record.set("value", newValues[i][propertyName]);
    }
  }
  Ext.getCmp('SolverConfPanel').setDisabled(false);
}

function selectSolver(selectedSolver) {
  gl_solver = selectedSolver;
  var solverConfStore = Ext.data.StoreManager.lookup('solverConfStore');

  // Start with only the first group expanded
  solverConfStore.addListener('load', function() {
    Ext.getCmp('SolverConfPanel').getView().getFeature('grouping').collapseAll();
    // TODO how to do this correctly in ExtJS 5?
    Ext.getCmp('SolverConfPanel').getView().getFeature('grouping').expand(Object.keys(solverConfStore.getGroups().map)[0], false);
  }, {
    single: true
  });

  solverConfStore.setProxy({
    type: 'ajax',
    url: '/j2ep-1.0/prov/solver/' + selectedSolver,
    extraParams: {
      'userId': userId
    },
    reader: {
      type: 'json',
      rootProperty: 'fields'
    }
  });
  solverConfStore.load();

  meshescombo.clearValue();
  meshescombo.store.removeAll();
  meshesstore.setProxy({
    type: 'ajax',
    url: '/j2ep-1.0/prov/solver/' + selectedSolver,
    extraParams: {
      'userId': userId
    },
    reader: {
      type: 'json',
      rootProperty: 'meshes'
    }
  });
  meshesstore.load();
}

function postRequest(path, paramName, paramValue) {
  var form = document.createElement("form");
  form.setAttribute("method", "post");
  form.setAttribute("target", "_blank");
  form.setAttribute("action", path);

  var hiddenField = document.createElement("input");
  hiddenField.setAttribute("type", "hidden");
  hiddenField.setAttribute("name", paramName);
  hiddenField.setAttribute("value", paramValue);
  form.appendChild(hiddenField);

  document.body.appendChild(form);
  form.submit();
}

//Clear map, clear velocityCombo and disable tabs for stations and events
function clearMap() {
  ctrl.eventstore.removeAll();
  ctrl.stationstore.removeAll();
  hideEventInfo();
  hideStationInfo();
  velocitycombo.clearValue();
  velocitycombo.store.removeAll();
  Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(true);
  Ext.getCmp('tabpanel_principal').down('#earthquakes').setDisabled(true);
}
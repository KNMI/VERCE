var solverstore = Ext.create('CF.store.Solver', {});
var meshesstore = Ext.create('CF.store.Mesh', {});
var velocitystore = Ext.create('CF.store.Velocity', {});

// ComboBox with multiple selection enabled
Ext.define('CF.view.SolverCombo', {
  extend: 'Ext.form.field.ComboBox',
  alias: 'widget.solvercombo',
  fieldLabel: 'Solvers',
  name: 'solvertype',
  id: 'solvertype',
  displayField: 'abbr',
  store: solverstore,
  queryMode: 'local',
  flex: 1,
  forceSelection: true,
  getInnerTpl: function() {
    return '<div data-qtip="{abbr}">{abbr} {name}</div>';
  },
  listeners: {
    scope: this,
    'beforeselect': function(combo, record, index) {
      if (Ext.getCmp('meshes').getSelectedRecord() != null) {
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
      var meshescombo = Ext.getCmp('meshes');
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

var customMesh = Ext.create(meshesstore.getModel(), {
  values: [],
  geo_minLat: 14.24658203125,
  geo_minLon: -12.974609375,
  geo_maxLat: 66.71728515625,
  geo_maxLon: 39.583984375,
  custom: true
});

Ext.define('CF.view.MeshesCombo', {
  extend: 'Ext.form.field.ComboBox',
  alias: 'widget.meshescombo',
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
      // No mesh selected and no text entered
      if (combo.getValue() == null || combo.getValue() === '') {
        Ext.getCmp('mesh_doc_button').setDisabled(true);
        Ext.getCmp('solverselectform').down('#mesh-boundaries').setVisible(false);
        return;
      }

      clearMap();

      var mesh = combo.getSelectedRecord();

      var velocitycombo = Ext.getCmp('velocity');
      velocitycombo.clearValue();

      if (mesh == null || mesh === customMesh) {
        Ext.getCmp('mesh_doc_button').setDisabled(true);
        Ext.getCmp('solverselectform').down('#mesh-boundaries').setVisible(true);

        if (mesh == null) {
          combo.getStore().add(customMesh);
          mesh = customMesh;
        }

        mesh.set('name', combo.getValue());
        mesh.set('velmod', [{
          name: combo.getValue(),
        }]);
      } else {
        Ext.getCmp('solverselectform').down('#mesh-boundaries').setVisible(false);

        if (mesh !== customMesh) {
          combo.getStore().remove(customMesh);

          Ext.getCmp('mesh_doc_button').setDisabled(false);
        }
      }

      createBoundariesLayer(mesh);

      //Update the solver values
      updateSolverValues(mesh.get('values'));

      velocitycombo.store.loadData(mesh.get('velmod'));
    }
  }
});

var createBoundariesLayer = function(mesh) {
  var controller = CF.app.getController('Map');
  if (controller.mapPanel.map.getLayersByName("Boxes") != "") {
    controller.mapPanel.map.removeLayer(controller.mapPanel.map.getLayersByName("Boxes")[0]);
  }
  var layers = [];
  var boxes = new OpenLayers.Layer.Boxes("Boxes");
  var coord = [mesh.get('geo_minLon'), mesh.get('geo_minLat'), mesh.get('geo_maxLon'), mesh.get('geo_maxLat')];
  bounds = OpenLayers.Bounds.fromArray(coord);
  box = new OpenLayers.Marker.Box(bounds);
  box.setBorder("black");
  //box.events.register("click", box, function (e) {this.setBorder("yellow"); });
  boxes.addMarker(box);
  layers.push(boxes);
  controller.mapPanel.map.addLayers(layers);

  var centLon = mesh.get('geo_minLon') + (mesh.get('geo_maxLon') - mesh.get('geo_minLon')) / 2;
  var centLat = mesh.get('geo_minLat') + (mesh.get('geo_maxLat') - mesh.get('geo_minLat')) / 2;
  controller.mapPanel.map.setCenter([centLon, centLat]);
  controller.mapPanel.map.zoomToExtent(bounds);
};

var customVelocityModel = Ext.create(velocitystore.getModel(), {
  custom: true
});

Ext.define('CF.view.VelocityCombo', {
  extend: 'Ext.form.field.ComboBox',
  alias: 'widget.velocitycombo',
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
      if (combo.getValue() == null || combo.getValue() === '') {
        Ext.getCmp('velocitymodel_doc_button').setDisabled(true);
        Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(true);
        Ext.getCmp('tabpanel_principal').down('#earthquakes').setDisabled(true);
        Ext.getCmp('solver_but').setDisabled(true);

        return;
      }

      var velocityModel = combo.getSelectedRecord();

      if (velocityModel == null || velocityModel === customVelocityModel) {
        if (velocityModel == null) {
          combo.getStore().add(customVelocityModel)[0];
          velocityModel = customVelocityModel;
        }

        customVelocityModel.set('name', combo.getValue());
      } else {
        if (velocityModel !== customVelocityModel) {
          combo.getStore().remove(customVelocityModel);

          Ext.getCmp('velocitymodel_doc_button').setDisabled(false);
        }

        Ext.getCmp('tabpanel_principal').down('#earthquakes').enable();
        Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(false);
        Ext.getCmp('solver_but').enable();
      }
    }
  }
});

Ext.define('CF.view.SolverSelectForm', {
  extend: 'Ext.form.Panel',
  alias: 'widget.solverselectform',
  requires: ['CF.view.LinkButton'],
  id: 'solverselectform',
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
    items: [{
      xtype: 'solvercombo'
    }, {
      xtype: 'button',
      id: 'solver_doc_button',
      icon: localResourcesPath + '/img/download-icon.png',
      margin: '0 0 0 5',
      tabIndex: 99,
      disabled: true,
      handler: function() {
        window.open(Ext.getCmp('solvertype').store.findRecord('abbr', Ext.getCmp('solvertype').getValue()).get('doc'), '_self');
      }
    }],
    layout: {
      type: 'hbox'
    },
  }, {
    xtype: 'container',
    width: '100%',
    margin: '5 0',
    items: [{
      xtype: 'meshescombo'
    }, {
      xtype: 'button',
      id: 'mesh_doc_button',
      icon: localResourcesPath + '/img/download-icon.png',
      margin: '0 0 0 5',
      tabIndex: 99,
      disabled: true,
      handler: function() {
        window.open(downloadMeshDetailsURL + '&solver=' + Ext.getCmp('solvertype').getValue() + '&meshName=' + Ext.getCmp('meshes').getValue(), '_self');
      }
    }],
    layout: {
      type: 'hbox'
    },
  }, {
    xtype: 'fieldset',
    title: 'Mesh Bounds',
    hidden: true,
    id: 'mesh-boundaries',
    items: [{
      xtype: 'displayfield',
      value: 'Please enter the mesh boundaries.',
      cls: 'form-description'
    }, {
      xtype: 'fieldcontainer',
      layout: 'hbox',
      defaults: {
        listeners: {
          change: function(field, newValue, oldValue) {
            var form = field.up('form').getForm();

            var mesh = Ext.getCmp('meshes').getSelectedRecord();
            mesh.set('geo_minLon', form.findField('minlon').getValue());
            mesh.set('geo_minLat', form.findField('minlat').getValue());
            mesh.set('geo_maxLon', form.findField('maxlon').getValue());
            mesh.set('geo_maxLat', form.findField('maxlat').getValue());

            if (form.findField('minlon').isValid() &&
              form.findField('minlat').isValid() &&
              form.findField('maxlon').isValid() &&
              form.findField('maxlat').isValid()
            ) {
              createBoundariesLayer(mesh);
            }
          }
        }
      },
      items: [{
        xtype: 'numberfield',
        fieldLabel: 'Minimum latitude',
        name: 'minlat',
        msgTarget: 'side',
        width: 200,
        minValue: -90,
        maxValue: 90,
        allowBlank: false,
        value: 14.24658203125
      }, {
        xtype: 'numberfield',
        fieldLabel: 'Maximum latitude',
        name: 'maxlat',
        msgTarget: 'side',
        width: 200,
        minValue: -90,
        maxValue: 90,
        allowBlank: false,
        value: 66.71728515625
      }]
    }, {
      xtype: 'fieldcontainer',
      layout: 'hbox',
      defaults: {
        listeners: {
          change: function(field, newValue, oldValue) {
            var form = field.up('form').getForm();

            var mesh = Ext.getCmp('meshes').getSelectedRecord();
            mesh.set('geo_minLon', form.findField('minlon').getValue());
            mesh.set('geo_minLat', form.findField('minlat').getValue());
            mesh.set('geo_maxLon', form.findField('maxlon').getValue());
            mesh.set('geo_maxLat', form.findField('maxlat').getValue());

            if (form.findField('minlon').isValid() &&
              form.findField('minlat').isValid() &&
              form.findField('maxlon').isValid() &&
              form.findField('maxlat').isValid()
            ) {
              createBoundariesLayer(mesh);
            }
          }
        }
      },
      items: [{
        xtype: 'numberfield',
        fieldLabel: 'Minimum longitude',
        name: 'minlon',
        msgTarget: 'side',
        width: 200,
        minValue: -180,
        maxValue: 180,
        allowBlank: false,
        value: -12.974609375
      }, {
        xtype: 'numberfield',
        fieldLabel: 'Maximum longitude',
        name: 'maxlon',
        msgTarget: 'side',
        width: 200,
        minValue: -180,
        maxValue: 180,
        allowBlank: false,
        value: 39.583984375
      }]
    }]
  }, {
    xtype: 'container',
    width: '100%',
    margin: '5 0',
    items: [{
      xtype: 'velocitycombo'
    }, {
      xtype: 'button',
      id: 'velocitymodel_doc_button',
      icon: localResourcesPath + '/img/download-icon.png',
      margin: '0 0 0 5',
      tabIndex: 99,
      disabled: true,
      handler: function() {
        window.open(downloadVelocityModelDetailsURL + '&solver=' + Ext.getCmp('solvertype').getValue() + '&meshName=' + Ext.getCmp('meshes').getValue() + '&velocityModelName=' + Ext.getCmp('velocity').getValue(), '_self');
      }
    }],
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
      var solverConfStore = CF.app.getController('Map').getStore('SolverConf');
      solverConfStore.commitChanges();
      solverConfStore.save();
      var jsonString = '{"fields" :' + Ext.encode(Ext.pluck(solverConfStore.data.items, 'data')) + "}";
      var wsSolverUrl = '/j2ep-1.0/odc/verce-scig-api/solver/par-file/' + encodeURIComponent(Ext.getCmp('solvertype').getValue().toLowerCase());
      postRequest(wsSolverUrl, "jsondata", jsonString); // makes a call to the WS that, the user receives a file back  
    }
  }]
});

var win = Ext.widget('window', {
  title: 'Submit a new mesh and velocity model',
  closeAction: 'hide',
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
      value: 'You can submit a new mesh and velocity model here. Currently we will check your submission by hand before adding them to the list of available meshes and models.',
      cls: 'form-description'
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
          name: 'minlat',
          msgTarget: 'side',
          width: 200
        }, {
          xtype: 'textfield',
          fieldLabel: 'Maximum latitude',
          name: 'maxlat',
          msgTarget: 'side',
          width: 200
        }]
      }, {
        xtype: 'fieldcontainer',
        layout: 'hbox',
        items: [{
          xtype: 'textfield',
          fieldLabel: 'Minimum longitude',
          name: 'minlon',
          msgTarget: 'side',
          width: 200
        }, {
          xtype: 'textfield',
          fieldLabel: 'Maximum longitude',
          name: 'maxlon',
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
var meshSolverPopup = function() {
  win.show();
}

Ext.define('CF.view.SolverSelect', {
  extend: 'Ext.form.Panel',
  alias: 'widget.solverselect',
  bodyPadding: '0 0 10 0',
  items: [{
    xtype: 'solverselectform'
  }]
});

function updateSolverValues(newValues) {
  var solverConfStore = CF.app.getController('Map').getStore('SolverConf');
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
  var solverConfStore = CF.app.getController('Map').getStore('SolverConf');

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

  var meshescombo = Ext.getCmp('meshes');
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
  var controller = CF.app.getController('Map');
  controller.getStore('Event').removeAll();
  controller.getStore('Station').removeAll();
  controller.hideEventInfo();
  controller.hideStationInfo();
  var velocitycombo = Ext.getCmp('velocity');
  velocitycombo.clearValue();
  velocitycombo.store.removeAll();
  Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(true);
  Ext.getCmp('tabpanel_principal').down('#earthquakes').setDisabled(true);
}
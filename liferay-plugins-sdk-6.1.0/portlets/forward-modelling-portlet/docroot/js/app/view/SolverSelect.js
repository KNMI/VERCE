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
      // Note: findRecordByValue returns object or false
      if (Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue())) {
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

var meshes_combo_has_changed = false;

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
  enableKeyEvents: true,
  listeners: {
    scope: this,
    'keyup': function(combo) {
      if (!meshes_combo_has_changed) {
        combo.fireEvent('change', combo);
      }
      meshes_combo_has_changed = false;
    },
    'change': function(combo) {
      meshes_combo_has_changed = true;
      clearMap();

      if (combo.inputEl.getValue() === '' && (combo.getValue() == null || combo.getValue().length <= 1)) {
        Ext.getCmp('tabpanel_principal').down('#earthquakes').setDisabled(true);
        Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(true);
        Ext.getCmp('solver_but').setDisabled(true);
        Ext.getCmp('solverselectform').down('#custom-mesh-velocity').setVisible(false);

        combo.getStore().remove(customMesh);

        return;
      }

      // WARNING strange ExtJS function returns object or *false*
      var mesh = combo.findRecordByValue(combo.getValue()) || undefined;

      var velocitycombo = Ext.getCmp('velocity');
      velocitycombo.clearValue();

      if (mesh == null) {
        combo.getStore().remove(customMesh);
        combo.getStore().add(customMesh);
        mesh = customMesh;
      }

      if (mesh === customMesh) {
        Ext.getCmp('mesh_doc_button').setDisabled(true);
        Ext.getCmp('solverselectform').down('#custom-mesh-velocity').setVisible(true);

        mesh.set('name', combo.getValue());
        mesh.set('velmod', [{
          name: combo.getValue(),
          custom: true,
        }]);
      } else {
        Ext.getCmp('solverselectform').down('#custom-mesh-velocity').setVisible(false);

        if (mesh !== customMesh) {
          combo.getStore().remove(customMesh);

          Ext.getCmp('mesh_doc_button').setDisabled(false);
        }
      }

      createBoundariesLayer(mesh);

      //Update the solver values
      updateSolverValues(mesh.get('values'));

      velocitycombo.store.loadData(mesh.get('velmod'));
    },
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

var velocitymodel_combo_has_changed = false;

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
  enableKeyEvents: true,
  listeners: {
    scope: this,
    'keyup': function(combo) {
      if (!velocitymodel_combo_has_changed) {
        combo.fireEvent('change', combo);
      }
      velocitymodel_combo_has_changed = false;
    },
    'change': function(combo) {
      velocitymodel_combo_has_changed = true;
      if (combo.inputEl.getValue() === '' && (combo.getValue() == null || combo.getValue().length <= 1)) {
        Ext.getCmp('velocitymodel_doc_button').setDisabled(true);
        Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(true);
        Ext.getCmp('tabpanel_principal').down('#earthquakes').setDisabled(true);
        Ext.getCmp('solver_but').setDisabled(true);

        combo.getStore().remove(customVelocityModel);

        return;
      }

      // WARNING strange ExtJS function returns object or *false*
      var velocityModel = combo.findRecordByValue(combo.getValue()) || undefined;

      if (velocityModel == null) {
        combo.getStore().remove(customVelocityModel);
        combo.getStore().add(customVelocityModel);
        velocityModel = customVelocityModel;
      }

      if (velocityModel === customVelocityModel) {
        Ext.getCmp('velocitymodel_doc_button').setDisabled(true);

        customVelocityModel.set('name', combo.getValue());
      } else {
        combo.getStore().remove(customVelocityModel);

        Ext.getCmp('velocitymodel_doc_button').setDisabled(false);
      }

      Ext.getCmp('tabpanel_principal').down('#earthquakes').setDisabled(false);
      Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(false);
      Ext.getCmp('solver_but').setDisabled(false);
    },
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
      xtype: 'image',
      id: 'mesh_help_icon',
      src: localResourcesPath + '/img/help.png',
      margin: '3 3 0 3',
      height: '16px',
      width: '16px',
      listeners: {
        'render': function(component) {
          Ext.create('Ext.tip.ToolTip', {
            target: component.getEl(),
            html: '<div style="width: 250px"><p>Here you find a selection of meshes and models which are ready for you to use. To use your custom mesh and model, just type in their name in the form below.</p><p>Remember that your mesh and velocity model need to be stored in your iRods account in the folder "specfem" as mesh_<name>.zip and velocity_<name>.zip files. These zip files have to contain respectively the folders mesh_<name> and velocity_<name>.</p></div>',
          });
        },
      },
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
    id: 'custom-mesh-velocity',
    xtype: 'container',
    hidden: true,
    width: '100%',
    margin: '5 0',
    items: [{
      xtype: 'fieldset',
      title: 'Mesh Bounds',
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

              var mesh = Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
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

              var mesh = Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
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
      xtype: 'displayfield',
      value: 'To use a custom mesh and velocity model, these need to be stored in your iRods account in the folder "specfem" as mesh_&lt;name&gt;.zip and velocity_&lt;name&gt;.zip.',
      cls: 'form-description alert',
    }]
  }, {
    xtype: 'container',
    width: '100%',
    margin: '5 0',
    items: [{
      xtype: 'velocitycombo'
    }, {
      xtype: 'image',
      id: 'velocitymodel_help_icon',
      src: localResourcesPath + '/img/help.png',
      margin: '3 3 0 3',
      height: '16px',
      width: '16px',
      listeners: {
        'render': function(component) {
          Ext.create('Ext.tip.ToolTip', {
            target: component.getEl(),
            html: '<div style="width: 250px"><p>Here you find a selection of meshes and models which are ready for you to use. To use your custom mesh and model, just type in their name in the form below.</p><p>Remember that your mesh and velocity model need to be stored in your iRods account in the folder "specfem" as mesh_<name>.zip and velocity_<name>.zip files. These zip files have to contain respectively the folders mesh_<name> and velocity_<name>.</p></div>',
          });
        },
      },
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
    text: 'Submit a mesh and velocity model for review',
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
            if (action.failureType === Ext.form.action.Action.CLIENT_INVALID) {

            } else if (action.failureType === Ext.form.action.Action.CONNECT_FAILURE) {
              Ext.Msg.alert('Connection Error', 'There was an error connecting to the server. Please try again.');
            } else if (action.failureType === Ext.form.action.Action.SERVER_INVALID) {
              var errors = "";
              for (error in action.result.errors) {
                errors += error + ': "' + action.result.errors[error] + '", '
              }
              errors.slice(0, -2);
              Ext.Msg.alert('Error', 'There was an error submitting your mesh and velocity model.\n' + errors);
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
    if (newValues[i].name != null) {
      var record = solverConfStore.findRecord("name", newValues[i].name);
      for (propertyName in newValues[i]) {
        record.set(propertyName, newValues[i][propertyName]);
      }
    } else {
      for (var configrationName in newValues[i]) {
        var record = solverConfStore.findRecord("name", configrationName);
        record.set("value", newValues[i][configrationName]);
      }
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
var runId = new Array();

var reposWorkflowsStore = Ext.create('CF.store.ExportedWorkflow', {});

Ext.define('CF.view.WorkflowCombo', {
  extend: 'Ext.form.field.ComboBox',
  alias: 'widget.workflowcombo',
  fieldLabel: 'Workflow',
  id: 'wfSelection',
  name: 'wfSelection',
  queryMode: 'local',
  width: 350,
  listWidth: 400,
  store: reposWorkflowsStore,
  displayField: 'workflowName',
  valueField: 'workflowId',
  allowBlank: false,
  listeners: {
    change: function(f, e) {
      $("div#submit_overview div#workflow").html(e);
    }
  }
});

Ext.define('CF.view.SubmitFormPanel', {
  extend: 'Ext.form.Panel',
  alias: 'widget.submitformpanel',
  frame: false,
  border: false,
  bodyPadding: '10 10 0 10',
  items: [{
    xtype: 'workflowcombo'
  }, {
    xtype: 'textfield',
    id: 'submitName',
    name: 'submitName',
    width: 350,
    fieldLabel: 'Name',
    allowBlank: false,
    listeners: {
      change: function(f, e) {
        $("div#submit_overview div#submitname").html(e);
      }
    }
  }, {
    xtype: 'textfield',
    id: 'submitMessage',
    name: 'submitMessage',
    width: 350,
    fieldLabel: 'Description',
    listeners: {
      change: function(f, e) {
        $("div#submit_overview div#submitdesc").html(e);
      }
    }
  }, {
    xtype: 'fieldcontainer',
    defaultType: 'checkboxfield',
    items: [{
      boxLabel: 'Process the events in parallel',
      name: 'nsubmit',
      disabled: true,
      id: 'checkboxNSubmit'
    }]
  }],
  buttons: [{
    text: 'Submit',
    id: 'submitbutton',
    handler: function(button, event) {
      var submitName = 'simulation_' + Ext.getCmp('submitName').getValue().split(" ").join("_"); //replace ' ' by '_'
      var submitMessage = Ext.getCmp('submitMessage').getValue();
      var wfcombo = Ext.getCmp('wfSelection');
      var wfModel = wfcombo.store.findRecord('workflowId', wfcombo.getValue());
      var checkboxNSubmit = Ext.getCmp('checkboxNSubmit').getValue() && !Ext.getCmp('checkboxNSubmit').isDisabled();

      if (!wfModel) {
        Ext.Msg.alert("Warning", "Workflow cannot be empty");
        Ext.getCmp('submitName').focus();
        return;
      }
      if (submitName.length < 1) {
        Ext.Msg.alert("Warning", "Name cannot be empty");
        Ext.getCmp('submitName').focus();
        return;
      }
      if (submitName.length > (20 + 11)) {
        Ext.Msg.alert("Warning", "Name cannot be longer than 20 characters");
        Ext.getCmp('submitName').focus();
        return;
      }
      if (submitMessage.length > 100) {
        Ext.Msg.alert("Alert", "Description cannot be longer than 100 characters");
        Ext.getCmp('submitMessage').focus(false, 200);
        return;
      }

      var solverConfStore = CF.app.getController('Map').getStore('SolverConf');
      solverConfStore.commitChanges();
      solverConfStore.save();

      var submitObjectArray = createSubmitObject(submitName, checkboxNSubmit);

      var jsonStrings = [];
      var runIds = [];
      submitObjectArray.forEach(function(submitObject) {
        jsonStrings.push(Ext.encode(submitObject));
        runIds.push(submitObject.runId);
      });

      if (jsonStrings.length > 0) {
        Ext.getCmp('submitbutton').disable();
        Ext.getCmp('viewport').setLoading(true);
        var workflowId = wfModel.get('workflowId');
        var ownerId = wfModel.get('ownerId');
        var workflowName = wfModel.get('workflowName');

        var r = solverConfStore.findRecord("name", "NPROC");
        var nProc = r.get("value");

        Ext.Ajax.request({
          url: submitSolverURL,
          params: {
            "solver": Ext.getCmp('solvertype').getValue(),
            "jsonObject": jsonStrings,
            "submitMessage": submitMessage,
            "workflowId": workflowId,
            "workflowName": workflowName,
            "ownerId": ownerId,
            "stationUrl": gl_stationUrl,
            "eventUrl": gl_eventUrl,
            "stationType": gl_stationFormat,
            "nProc": nProc,
            "runId": runIds
          },
          success: function(response) {
            var successMsg = "The information has been submitted";
            if (checkboxNSubmit)
              successMsg = Ext.getCmp('eventgrid').getSelectionModel().selected.length + " processes have been submitted";
            Ext.Msg.alert("Success", successMsg);
            Ext.getCmp('submitbutton').enable();
            Ext.getCmp('viewport').setLoading(false);
            // TODO FIX
            // wfStore.load();
          },
          failure: function(response) {
            //alert("response.status (f): "+response.status);
            if (response.status == "401") //credentials
              Ext.Msg.alert("Error", "Submission failed! Check your credentials");
            else if (response.status == "0") //timeout
              Ext.Msg.alert("Alert", "Your submission is being processed. Please, check the status in the Control tab");
            else
              Ext.Msg.alert("Error", "Submission failed!");
            Ext.getCmp('submitbutton').enable();
            Ext.getCmp('viewport').setLoading(false);
            // TODO FIX
            // wfStore.load();
          }
        });
      }
    }
  }]
});

Ext.define('CF.view.SubmitForm', {
  extend: 'Ext.form.Panel',
  alias: 'widget.submitform',
  bodyPadding: '0 0 10 0',
  items: [{
    xtype: 'submitformpanel'
  }]
});

//TODO! Nicer style
var submitInformation = "<div id='submit_overview'>" +
  "<strong>Submit name:</strong> <div id='submitname'><br></div>" +
  "<strong>Submit description:</strong> <div id='submitdesc'><br></div>" +
  "<strong>Selected workflow:</strong> <div id='workflow'><br></div>" +
  "<strong>Solver:</strong> <div id='solver'><br></div>" +
  "<strong>Mesh:</strong> <div id='mesh'><br></div>" +
  "<strong>Velocity Model:</strong> <div id='velmodel'><br></div>" +
  "<strong>Earthquakes Url:</strong> <div id='eurl'><br></div>" +
  "<strong>Selected earthquakes:</strong> <div id='esel'><br></div>" +
  "<strong>Station Url:</strong> <div id='surl'><br></div>" +
  "<strong>Selected stations:</strong> <div id='ssel'><br></div>" +
  "<br><br><br></div>";

Ext.define('CF.view.Submit', {
  extend: 'Ext.form.Panel',
  alias: 'widget.submit',
  border: false,
  layout: {
    type: 'vbox', // Arrange child items vertically
    align: 'stretch', // Each takes up full width
  },
  items: [{
    xtype: 'submitform',
    flex: 0,
  }, {
    id: "wflist",
    xtype: 'panel',
    html: submitInformation,
    bodyPadding: '10 10 0 10',
    border: false,
    frame: false,
    autoScroll: true,
    flex: 1,
  }]
});

/*
 * Creates a jsonString containing the information of the solverGrid
 * and two lists of the selected stations and events
 */
function createSubmitObject(submitName, multipleSubmits) {
  var selectedStations = Ext.getCmp('stationgrid').getSelectionModel().selected;
  var selectedEvents = Ext.getCmp('eventgrid').getSelectionModel().selected;

  if (selectedStations.length < 1) {
    Ext.Msg.alert("Alert!", "You must select at least one station");
    return null;
  }
  if (selectedEvents.length < 1) {
    Ext.Msg.alert("Alert!", "You must select at least one event");
    return null;
  }
  if (selectedEvents.length > GL_EVENTSLIMIT) {
    Ext.Msg.alert("Alert!", "You cannot select more than " + GL_EVENTSLIMIT + " events.");
    return null;
  }

  var results = [];
  var numberOfSubmits = multipleSubmits ? selectedEvents.length : 1;

  var stations = [];
  selectedStations.each(function(item, ind, l) {
    stations.push(item.get('network') + '.' + item.get('station'));
  });

  var events = [];
  selectedEvents.each(function(item, ind, l) {
    events.push(item.get('eventId'));
  });

  var mesh = Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());

  for (i = 0; i < numberOfSubmits; i++) {
    results[i] = {
      fields: Ext.pluck(CF.app.getController('Map').getStore('SolverConf').data.items, 'data'),
      stations: stations,
      events: multipleSubmits ? [events[i]] : events,
      runId: submitName + i + (new Date()).getTime(),
      user_name: userSN,
      user_id: userId,
      station_url: gl_stationUrl,
      station_format: gl_stationFormat === STPOINTS_TYPE ? 'points' : 'stationXML',
      event_url: gl_eventUrl,
      solver: Ext.getCmp('solvertype').getValue(),
      mesh: mesh.get('name'),
      velocity_model: Ext.getCmp('velocity').getValue(),
      custom_mesh: mesh.get('custom'),
      custom_mesh_boundaries: mesh.get('custom') ? {
        minlon: mesh.get('geo_minLon'),
        minlat: mesh.get('geo_minLat'),
        maxlon: mesh.get('geo_maxLon'),
        maxlat: mesh.get('geo_maxLat')
      } : null,
      custom_velocity_model: Ext.getCmp('velocity').findRecordByValue(Ext.getCmp('velocity').getValue()).get('custom')
    };
  }
  return results;
}
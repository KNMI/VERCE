var runId = new Array();

var reposWorkflowsStore = Ext.create('CF.store.ExportedWorkflow', {});

var wfcombo = Ext.create('Ext.form.field.ComboBox', {
  fieldLabel: 'Workflow',
  id: 'wfSelection',
  name: 'wfSelection',
  queryMode: 'local',
  width: 350,
  listWidth: 400,
  store: reposWorkflowsStore, //defined in init.jsp
  displayField: 'workflowName',
  valueField: 'workflowId',
  allowBlank: false,
  listeners: {
    change: function(f, e) {
      $("div#submit_overview div#workflow").html(e);
    }
  }
});

var formSubmit = Ext.create('Ext.form.Panel', {
  height: '100%',
  frame: false,
  border: false,
  bodyPadding: '10 10 0 10',
  items: [
    wfcombo, {
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
    }
  ],
  buttons: [{
    text: 'Submit',
    id: 'submitbutton',
    handler: function() {
      var submitName = Ext.getCmp('submitName').getValue().split(" ").join("_"); //replace ' ' by '_'
      var submitMessage = Ext.getCmp('submitMessage').getValue();
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
      if (submitName.length > 20) {
        Ext.Msg.alert("Warning", "Name cannot be longer than 20 characters");
        Ext.getCmp('submitName').focus();
        return;
      }
      if (submitMessage.length > 100) {
        Ext.Msg.alert("Alert", "Description cannot be longer than 100 characters");
        Ext.getCmp('submitMessage').focus(false, 200);
        return;
      }

      solverConfStore.commitChanges();
      solverConfStore.save();

      var jsonString = createJsonString(submitName, checkboxNSubmit);

      if (jsonString != null) {
        Ext.getCmp('submitbutton').disable();
        Ext.getCmp('viewport').setLoading(true);
        var workflowId = wfModel.get('workflowId');
        var ownerId = wfModel.get('ownerId');
        var workflowName = wfModel.get('workflowName');

        var scs = Ext.data.StoreManager.lookup('solverConfStore');
        var r = scs.findRecord("name", "NPROC");
        var nProc = r.get("value");

        Ext.Ajax.request({
          url: submitSolverURL,
          params: {
            "solver": gl_solver,
            "jsonObject": jsonString,
            "submitMessage": submitMessage,
            "workflowId": workflowId,
            "workflowName": workflowName,
            "ownerId": ownerId,
            "stationUrl": gl_stationUrl,
            "eventUrl": gl_eventUrl,
            "stationType": gl_stationFormat,
            "nProc": nProc,
            "runId": runId
          },
          success: function(response) {
            var successMsg = "The information has been submited";
            if (checkboxNSubmit)
              successMsg = Ext.getCmp('gridEvents').getSelectionModel().selected.length + " processes have been submited";
            Ext.Msg.alert("Success", successMsg);
            Ext.getCmp('submitbutton').enable();
            Ext.getCmp('viewport').setLoading(false);
            wfStore.load();
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
            wfStore.load();
          }
        });
      }
    }
  }]
});

Ext.define('CF.view.SubmitForm', {
  extend: 'Ext.form.Panel',
  bodyPadding: '0 0 10 0',
  height: '100%',
  items: [formSubmit]
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
  border: false,
  items: [
    Ext.create('CF.view.SubmitForm'), {
      id: "wflist",
      xtype: 'panel',
      html: submitInformation,
      bodyPadding: '10 10 0 10',
      border: false,
      frame: false,
      autoScroll: true
      //TODO: length of the div
    }
  ]
});

/*
 * Creates a jsonString containing the information of the solverGrid
 * and two lists of the selected stations and events
 */
function createJsonString(submitName, multipleSubmits) {
  var selectedStations = Ext.getCmp('gridStations').getSelectionModel().selected;
  var selectedEvents = Ext.getCmp('gridEvents').getSelectionModel().selected;

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

  var aJsonString = new Array();
  var limit = 1;
  if (multipleSubmits) limit = selectedEvents.length;

  for (i = 0; i < limit; i++) {
    //Add the solver information
    var jsonString = '{"fields" :' + Ext.encode(Ext.pluck(solverConfStore.data.items, 'data')) + ",";

    //Add the stations Ids
    jsonString += '"stations" :[';
    selectedStations.each(function(item, ind, l) {
      if (ind > 0) jsonString += ', ';
      jsonString += '"' + item.get('network') + '.' + item.get('station') + '"';
    });
    jsonString += '],';

    //Add the events Ids
    jsonString += '"events" :[';
    if (multipleSubmits) //we put only one event in each jsonString
    {
      jsonString += '"' + selectedEvents.items[i].get('eventId') + '"';
    } else //we put all the events in the jsonString
    {
      selectedEvents.each(function(item, ind, l) {
        if (ind > 0) jsonString += ', ';
        jsonString += '"' + item.get('eventId') + '"';
      });
    }
    jsonString += '],';

    runId[i] = submitName + i + (new Date()).getTime();
    //Add the runId, user, stationUrl, eventUrl, solver and mesh
    jsonString += '"runId" :"' + runId[i] + '",';
    jsonString += '"user_name" :"' + userSN + '",';
    jsonString += '"user_id" :"' + userId + '",';
    jsonString += '"station_url" :"' + gl_stationUrl + '",';
    jsonString += '"event_url" :"' + gl_eventUrl + '",';
    if (gl_stationFormat === STXML_TYPE) var auxFormat = "stationXML";
    else if (gl_stationFormat === STPOINTS_TYPE) var auxFormat = "points";
    jsonString += '"station_format" :"' + auxFormat + '",';
    jsonString += '"solver" :"' + gl_solver + '",';
    jsonString += '"mesh" :"' + gl_mesh + '",';
    jsonString += '"velocity_model" :"' + gl_velmod + '"}';

    aJsonString[i] = jsonString;
  }
  return aJsonString;
}
var runId = "";

Ext.define("ExportedWorkflowModel", {
	extend: "Ext.data.Model",
    fields: [
             {type: 'string', name: 'workflowName'},
             {type: 'string', name: 'workflowId'},
             {type: 'string', name: 'ownerId'}
         ]});

var reposWorkflowsStore = Ext.create('Ext.data.Store', {
    model: 'ExportedWorkflowModel',
    data: reposWorkflows
});	

var wfcombo = Ext.create('Ext.form.field.ComboBox', {
    fieldLabel: 'Workflow',
    id: 'wfSelection',
    name: 'wfSelection',
    queryMode: 'local',
    width: 350,
    listWidth: 400,
	store:  reposWorkflowsStore,		//defined in init.jsp
    displayField: 'workflowName',
    valueField: 'workflowId',
    listeners : {
        change : function (f, e){
            $("div#submit_overview div#workflow").html(e);
        }
    }
});

var formSubmit = Ext.create('Ext.form.Panel', {   
	height:'100%',
    frame: false,
    border: false,
    bodyPadding: '10 10 0 10',
    items: 
	    [
	     	wfcombo,
		    {
		        xtype: 'textfield',
		        id: 'submitName',
		        name: 'submitName',
		        width: 350,
		        fieldLabel: 'Name',
		        listeners : {
		            change : function (f, e){
		                $("div#submit_overview div#submitname").html(e);
		            }
		        }
		    },
		    {
		        xtype: 'textfield',
		        id: 'submitMessage',
		        name: 'submitMessage',
		        width: 350,
		        fieldLabel: 'Description',
		        listeners : {
		            change : function (f, e){
		                $("div#submit_overview div#submitdesc").html(e);
		            }
		        }
		    }
		],
		buttons: [
               {
                  text: 'Submit',
                  id: 'submitbutton',
                  handler: function() 
                  {
                	solverConfStore.commitChanges();
              		solverConfStore.save();
              		
              		var jsonString = createJsonString();
              		
              		if(jsonString!=null)
              		{
              			Ext.getCmp('submitbutton').disable();
  	    				Ext.getCmp('viewport').setLoading(true);
              			var wfModel = wfcombo.store.findRecord('workflowId', wfcombo.getValue());
              			var workflowId = wfModel.get('workflowId');   	 
              			var ownerId = wfModel.get('ownerId');  
              			var workflowName = wfModel.get('workflowName');  
              			var submitName = Ext.getCmp('submitName').getValue().split(" ").join("_");	//replace ' ' by '_'
              			
          	    		Ext.Ajax.request({
          	    			url: submitSolverURL,
          	    			params: {
          	    				"solver": gl_solver,
          	    				"jsonObject": jsonString,
          	    				"submitMessage": Ext.getCmp('submitMessage').getValue(),
          	    				"submitName": submitName,
          	    				"workflowId": workflowId,
          	    				"workflowName": workflowName,
          	    				"ownerId": ownerId,
          	    				"stationUrl": gl_stationUrl,
          	    				"eventUrl": gl_eventUrl,
          	    				"stationType": gl_stFileType,
          	    				"runId": runId
          	    			},
          	    			success: function(response){
          	    				Ext.Msg.alert("Success", "The information has been submited");
          	    				Ext.getCmp('submitbutton').enable();
          	    				Ext.getCmp('viewport').setLoading(false);
          	    				wfStore.load();
          	    			},
          	    			failure: function(response) {
          	    				Ext.Msg.alert("Error", "Submition failed!");
          	    				Ext.getCmp('submitbutton').enable();
          	    				Ext.getCmp('viewport').setLoading(false);
          	    				wfStore.load();
          	                }
          	    		});
              		}
              		else
              		{
              			Ext.Msg.alert("Alert!", "You must select at least one event and one station");
              		}
                  }
                }
              ]
});

Ext.define('CF.view.SubmitForm', {
	  extend:'Ext.form.Panel',
	  bodyPadding: '0 0 10 0',
	  height:'100%',
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
	  extend:'Ext.form.Panel',
	    border: false,
	  items: 
		    [
		     	Ext.create('CF.view.SubmitForm'),
		     	{  
		     		id: "wflist",
			       xtype: 'panel',
			       html:submitInformation,
				    bodyPadding: '10 10 0 10',
				    border: false,
				    frame: false,
				    autoScroll:true
				    	//TODO: length of the div
				}
			]
	});

/*
 * Creates a jsonString containing the information of the solverGrid
 * and two lists of the selected stations and events
 */
function createJsonString()
{
	var selectedStations = Ext.getCmp('gridStations').getSelectionModel().selected;
	var selectedEvents = Ext.getCmp('gridEvents').getSelectionModel().selected;
	if(selectedStations.length<1 || selectedEvents.length<1)	return null;

	//Add the solver information
	var jsonString = '{"fields" :' + Ext.encode(Ext.pluck(solverConfStore.data.items, 'data')) + ",";
	
	//Add the stations Ids
	jsonString += '"stations" :[';
	selectedStations.each(function(item, ind, l)
		{
			if(ind>0)	jsonString+= ', ';
			jsonString+= '"'+item.get('network')+'.'+item.get('station')+'"';
		});
	jsonString += '],';
	
	//Add the events Ids
	jsonString += '"events" :[';
	selectedEvents.each(function(item, ind, l)
		{
			if(ind>0)	jsonString+= ', ';
			jsonString+= '"'+item.get('eventId')+'"';
		});
	jsonString += '],';	
	
	runId = userSN + (new Date()).getTime(),
	//Add the runId, user, stationUrl, eventUrl, solver and mesh
	jsonString += '"runId" :"'+runId+'",';
	jsonString += '"user_name" :"'+userSN+'",';
	jsonString += '"user_id" :"'+userId+'",';
	jsonString += '"station_url" :"'+gl_stationUrl+'",';
	jsonString += '"event_url" :"'+gl_eventUrl+'",';
	if(gl_stationFormat===STXML_TYPE)			var auxFormat = "stationXML";
	else if(gl_stationFormat===STPOINTS_TYPE)	var auxFormat = "points";
	jsonString += '"station_format" :"'+auxFormat+'",';
	jsonString += '"solver" :"'+gl_solver+'",';
	jsonString += '"mesh" :"'+gl_mesh+'",';
	jsonString += '"velocity_model" :"'+gl_velmod+'"}';
	
	return jsonString;
}

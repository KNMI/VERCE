var runId = "";

Ext.regModel('ExportedWorkflowModel', {
    fields: [
        {type: 'string', name: 'workflowName'},
        {type: 'string', name: 'workflowId'},
        {type: 'string', name: 'ownerId'}
    ]
});
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

Ext.define('CF.view.SubmitForm', {
	  extend:'Ext.form.Panel',
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
	                  handler: function() 
	                  {
	                	solverConfStore.commitChanges();
	              		solverConfStore.save();
	              		
	              		var jsonString = createJsonString();
	              		
	              		if(jsonString!=null)
	              		{
	              			var wfModel = wfcombo.store.findRecord('workflowId', wfcombo.getValue());
	              			var workflowId = wfModel.get('workflowId');   	 
	              			var ownerId = wfModel.get('ownerId');   
	              			
	          	    		Ext.Ajax.request({
	          	    			url: submitSolverURL,
	          	    			params: {
	          	    				"solver": gl_solver,
	          	    				"jsonObject": jsonString,
	          	    				"submitMessage": Ext.getCmp('submitMessage').getValue(),
	          	    				"submitName": Ext.getCmp('submitName').getValue(),
	          	    				"workflowId": workflowId,
	          	    				"ownerId": ownerId,
	          	    				"stationUrl": gl_stationUrl,
	          	    				"eventUrl": gl_eventUrl,
	          	    				"stationType": gl_stFileType,
	          	    				"runId": runId
	          	    			},
	          	    			success: function(response){
	          	    				Ext.Msg.alert("Success", "The information has been submited");
	          	    			}
	          	    		});
	              		}
	              		else
	              		{
	              			Ext.Msg.alert("Alert!", "You must select at least one event and one station");
	              		}
	              		setInterval("getSubmitedWorkflows()",10000);
	                  }
	                }
	              ]
	});



var submitInformation = "<div id='submit_overview'>" +
"<strong>Submit name:</strong> <div id='submitname'>" + "</div>" + 
"<strong>Submit description:</strong> <div id='submitdesc'>" + "</div>" + 
"<strong>Selected workflow:</strong> <div id='workflow'>" + "</div>" + 
"<strong>Solver:</strong> <div id='solver'>" + "</div>" + 
"<strong>Mesh:</strong> <div id='mesh'>" + "</div>" + 
"<strong>Velocity Model:</strong> <div id='velmodel'>" + "</div>" + 
"<strong>Earthquakes Url:</strong> <div id='eurl'>" + "</div>" + 
"<strong>Selected earthquakes:</strong> <div id='esel'>" + "</div>" + 
"<strong>Station Url:</strong> <div id='surl'>" + "</div>" + 
"<strong>Selected stations:</strong> <div id='ssel'>" + "</div>" + 
"</div>";

Ext.define('CF.view.Submit', {
	  extend:'Ext.form.Panel',
	  items: 
		    [
		     	Ext.create('CF.view.SubmitForm'),
		     	{  
		     		id: "wflist",
			       xtype: 'panel',
			       html:submitInformation
				},
				
			]
	});

getSubmitedWorkflows();
//TODO
function getSubmitedWorkflows() {
	Ext.Ajax.request({
		url: getSubmitedWorkflowsURL,
		params: {
			userId: "res"
		},
		success: function(response){
			Ext.create('Ext.form.Panel', {
		       renderTo: Ext.Element.get('wflist'),
		       html: response.responseText
			});
		}
	});
}	

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

var solvers = [
        {"abbr":"seissol","name":"seisol"},
        {"abbr":"SPECFEM3D_CARTESIAN_21447","name":"SPECFEM3D_CARTESIAN_21447"},
    ];

Ext.define("SolversCombo", {
	extend: "Ext.data.Model",
    fields: [
             {type: 'string', name: 'abbr'},
             {type: 'string', name: 'name'}
         ]});

Ext.define("MeshesModel", {
	extend: "Ext.data.Model",
	fields: [
	         {type: 'string', name: 'name'},
	         {type: 'long', name: 'geo_minLat'},
	         {type: 'long', name: 'geo_maxLat'},
	         {type: 'long', name: 'geo_minLon'},
	         {type: 'long', name: 'geo_maxLon'},
	         {type: 'string', name: 'geo_proj'},
	         {type: 'array', name: 'velmod'}
	     ]});

var solverstore = Ext.create('Ext.data.Store', {
    model: 'SolversCombo',
    data: solvers
});

var meshesstore = Ext.create('Ext.data.Store', {
    model: 'MeshesModel',
});

var velocitystore = Ext.create('Ext.data.Store', {
	 fields: ['name']
});

// ComboBox with multiple selection enabled
var solvercombo = Ext.create('Ext.form.field.ComboBox', {
    fieldLabel: 'Solvers',
    name: 'solvertype',
    displayField: 'abbr',
    store: solverstore,
    queryMode: 'local',
    getInnerTpl: function() {
        return '<div data-qtip="{abbr}">{abbr} {name}</div>';
    },
    listeners:{
         scope: this,
         'beforeselect': function(combo, record, index)
         {   
        	if(gl_mesh!=null){        	
	     		Ext.Msg.confirm('Alert!', 'You will lose the introduced data for '+combo.getValue()+', do you want to continue?', 
	                  function(btn) {
	                  	if(btn === 'yes')
	                  	{	
	                  		clearMap();
	                  		meshescombo.clearValue();
	                 		meshescombo.store.removeAll();
	                   	 	//Load meshescombo, load conf form
	                    	selectSolver(record.get('abbr'));
	                 		solvercombo.setValue(record.get('name'));
	                  	}
	            });
        	}
        	else
        	{
            	selectSolver(record.get('abbr'));
            	return true;
        	}
        	return false;
     	 },
    }
});

var meshescombo = Ext.create('Ext.form.field.ComboBox', {
    fieldLabel: 'Meshes',
    name: 'meshes',
    displayField: 'name',
    store: meshesstore,
    queryMode: 'local',
    listeners:{
         scope: this,
         'load' : function(combo){},
         'change': function(combo)
         {   
        	 gl_mesh = combo.getValue();
        	 if(gl_mesh!=null)
        	 {
        		 clearMap();
	        	 var meshModel = combo.store.findRecord('name', gl_mesh);
	        	 	        	 
	        	 //Populate the VelocityModel Combo
	        	 velocitycombo.store.add(meshModel.get('velmod'));	
	        	 
	        	 //Render the bounding box in the map and center it
	        	 gl_minLat = meshModel.get('geo_minLat');
	        	 gl_maxLat = meshModel.get('geo_maxLat');
	        	 gl_minLon = meshModel.get('geo_minLon');
	        	 gl_maxLon = meshModel.get('geo_maxLon');
	        	 
	        	 if (ctrl.mapPanel.map.getLayersByName("Boxes")!="")
	        		ctrl.mapPanel.map.removeLayer(ctrl.mapPanel.map.getLayersByName("Boxes")[0]);
	        	 var layers=[];
	        	 var boxes  = new OpenLayers.Layer.Boxes("Boxes");
	        	 var coord = [gl_minLon, gl_minLat, gl_maxLon, gl_maxLat];
	        	 bounds = OpenLayers.Bounds.fromArray(coord);
	        	 box = new OpenLayers.Marker.Box(bounds);
	        	 box.setBorder("black");
	        	 //box.events.register("click", box, function (e) {this.setBorder("yellow"); });
	        	 boxes.addMarker(box);
	             layers.push(boxes);        	        	 
	        	 ctrl.mapPanel.map.addLayers(layers);
	        	 
	        	 var centLon = gl_minLon + (gl_maxLon-gl_minLon)/2;
	        	 var centLat = gl_minLat + (gl_maxLat-gl_minLat)/2;
	        	 ctrl.mapPanel.map.setCenter([centLon, centLat]);        	
	        	 ctrl.mapPanel.map.zoomToExtent(bounds);
        	 }
     	 }
	}
});

var velocitycombo = Ext.create('Ext.form.field.ComboBox', {
    fieldLabel: 'Velocity Model',
    name: 'velocity',
    displayField: 'name',
    valueField: 'name',
    store: velocitystore,
    queryMode: 'local',
    listeners:{
         scope: this,
         'change': function(combo)
         {   
        	 gl_velmod = combo.getValue();
        	 Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(false);
        	 Ext.getCmp('tabpanel_principal').down('#earthquakes').enable();
        	 Ext.getCmp('solver_but').enable();
     	 }
	}
});

var formSolverSelect = Ext.create('Ext.form.Panel', {
     extend:'Ext.form.Panel',
     alias: 'widget.solverselect',
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
    defaultType:'numberfield',
    items: [
    solvercombo,
    meshescombo,
    velocitycombo,
    {
    	xtype: 'hidden',
    	id: 'solver-filetype',
    	name: 'filetype',
    	value: SOLVER_TYPE
     }],
     buttons: [
        {
          	itemId: 'solver_but',
          	id: 'solver_but',
              text: 'Solver File',
        	  disabled: true,
              tooltip: 'Download solver input file',
              handler: function() 
              {
                solverConfStore.commitChanges();
            	solverConfStore.save();
          		var jsonString = '{"fields" :' + Ext.encode(Ext.pluck(solverConfStore.data.items, 'data')) + "}";
          		var wsSolverUrl = '/j2ep-1.0/odc/verce-scig-api/solver/par-file/'+encodeURIComponent(gl_solver.toLowerCase());
          		postRequest(wsSolverUrl, "jsondata", jsonString);	// makes a call to the WS that, the user receives a file back  
              }
         }
      ]
});

Ext.define('CF.view.SolverSelect', {
	  extend:'Ext.form.Panel',
	    bodyPadding: '0 0 10 0',
	  items: [formSolverSelect]
	});


function selectSolver(selectedSolver)
{
	gl_solver = selectedSolver;
	solverConfStore = Ext.data.StoreManager.lookup('solverConfStore');
	solverConfStore.setProxy({
       type : 'ajax',
       url : localResourcesPath+'/js/solvers/'+selectedSolver+'.json',
       reader : {
                type : 'json',
                root : 'fields'
	         }
	});
	solverConfStore.load();	
	
	meshescombo.clearValue();
	meshescombo.store.removeAll();
	meshesstore.setProxy({
		type : 'ajax',
		url : localResourcesPath+'/js/solvers/'+selectedSolver+'.json',
		reader : {
                type : 'json',
                root : 'meshes'
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
function clearMap()
{
	ctrl.eventstore.removeAll();
	ctrl.stationstore.removeAll();
	hideEventInfo();
	hideStationInfo();
	velocitycombo.clearValue();
 	velocitycombo.store.removeAll();
	Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(true);
 	Ext.getCmp('tabpanel_principal').down('#earthquakes').setDisabled(true);
}

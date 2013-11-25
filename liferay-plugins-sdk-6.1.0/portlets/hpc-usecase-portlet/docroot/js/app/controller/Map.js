/**
 * Map controller
 * Used to manage map layers and showing their related views
 */
//alert("Map6.js");


var eventStore = Ext.create('CF.store.EventStore');

var QuakeMLFormat = OpenLayers.Class(OpenLayers.Format.JSON, {
    read: function(response)    
    {
        // We're going to read JSON
         
        if(typeof response == "string") {
            jsonDoc = OpenLayers.Format.JSON.prototype.read.apply(this, [response]);
        }
  
 var unids=jsonDoc.unids;
  
  var features = [];
         	 	for(var i=0; i<unids.length; i++)
        		{
        			
        			
        		 	var attributes ={description: unids[i].flynn_region, datetime: unids[i].datetime, magnitude: unids[i].mag, depth: unids[i].depth, longitude: unids[i].lon, latitude: unids[i].lat};
				   
        			feature = new OpenLayers.Feature.Vector(
    						new OpenLayers.Geometry.Point(unids[i].lon,unids[i].lat),
    						attributes
    					);
				    features.push(feature);
				   }
 // alert(features);
  return features;
}
});


var QuakeMLprotocol=new OpenLayers.Protocol.HTTP({
            format: new QuakeMLFormat()
            });

   var eventcontext = {
   			getRadius: function(feature) { 
                return feature.attributes.magnitude*1.5;
            },
            getColor: function(feature) { 
                if (feature.attributes.depth < 20) {
                    return 'green';
                }
                if (feature.attributes.depth < 50) {
                    return 'orange';
                }
                return 'red';
            }
        };
        var eventtemplate = {
            cursor: "pointer",
            fillOpacity: 0.5,
            fillColor: "${getColor}",
            pointRadius: "${getRadius}",
            strokeWidth: 1,
            strokeOpacity: 1,
            strokeColor: "${getColor}"
           
             
        };
        eventrenderer =  OpenLayers.Layer.Vector.prototype.renderers;
           
        var eventstyle = new OpenLayers.Style(eventtemplate, {context: eventcontext});
       


var stationStore = Ext.create('CF.store.StationStore');

var StationXMLFormat = OpenLayers.Class(OpenLayers.Format.XML, {
    read: function(response)    
    {
        // We're going to read XML
         var xmlDoc=response;
        if(typeof response == "string") {
            xmlDoc = OpenLayers.Format.XML.prototype.read.apply(this, [response]);
        }
 //
  
  var features = [];
  var lats = xmlDoc.getElementsByTagName("Latitude");
        		var longs = xmlDoc.getElementsByTagName("Longitude");
        		var elevs = xmlDoc.getElementsByTagName("Elevation");
        		var stations = xmlDoc.getElementsByTagName("Station");        		
        		for(var i=0; i<lats.length; i++)
        		{
        			var lat = lats[i].childNodes[0].nodeValue;
        			var long = longs[i].childNodes[0].nodeValue;
        			var station = stations[i].getAttribute("code");
        			
        			stations[i].setAttribute("network",stations[i].parentNode.getAttribute("code"));
        			var network = stations[i].getAttribute("network");
        			 
        			var elev = elevs[i].childNodes[0].nodeValue;
        			var attributes ={station: station, network: network, elevation: elev, longitude: long, latitude: lat};
				   
        			feature = new OpenLayers.Feature.Vector(
    						new OpenLayers.Geometry.Point(long,lat),
    						attributes
    					);
				    features.push(feature);
				   }
 // alert(features);
  return features;
}
});


var protocol=new OpenLayers.Protocol.HTTP({
            format: new StationXMLFormat()
            });

   var stationcontext = {
            getColor: function(feature) { 
                if (feature.attributes.elevation < 2000) {
                    return 'blue';
                }
                if (feature.attributes.elevation < 2300) {
                    return 'orange';
                }
                return 'red';
            }
        };
        var stationtemplate = {
            cursor: "pointer",
            fillOpacity: 0.5,
            fillColor: "${getColor}",
            pointRadius: 5,
            strokeWidth: 1,
            strokeOpacity: 1,
            strokeColor: "${getColor}",
            graphicName: "triangle"
        };
        stationrenderer =  OpenLayers.Layer.Vector.prototype.renderers;
           
        var stationstyle = new OpenLayers.Style(stationtemplate, {context: stationcontext});
       
 


Ext.define('CF.controller.Map', {
    extend: 'Ext.app.Controller',

    models: ['CF.model.Station'],
  //  stores: ['StationStore'],


	refs: [
        
        {ref: 'stationsGrid', selector: 'stationsgrid'},
        {ref: 'eventSearch', selector: 'eventsearch'},
        {ref: 'eventsGrid', selector: 'eventsgrid'},
        {ref: 'commons', selector: 'commons'}
    ],
   

    init: function() {
        var me = this;
		this.stationstore=stationStore
		//this.getStore('StationStore');
        this.stationstore.on({
            scope: me,
            'datachanged' : me.onStationStoreLoad
        });
        this.eventstore=eventStore
		//this.getStore('StationStore');
        this.eventstore.on({
            scope: me,
            'datachanged' : me.onEventStoreLoad
        });
      
        this.control({
            'cf_mappanel': {
                'beforerender': this.onMapPanelBeforeRender,
                'afterrender': this.onMapPanelAfterRender
            },
            'button[itemId=station_cl_but]':{
				click:function(button) {
				  
				  
				 if (this.mapPanel.map.getLayersByName("Stations")!="")
         			this.mapPanel.map.removeLayer(this.mapPanel.map.getLayersByName("Stations")[0]);
      
				 this.stationstore.removeAll();
				
				}
				
			},
			'button[itemId=event_cl_but]':{
				click:function(button) {
				  
				  
				 if (this.mapPanel.map.getLayersByName("Events")!="")
         			this.mapPanel.map.removeLayer(this.mapPanel.map.getLayersByName("Events")[0]);
      
				 this.eventstore.removeAll();
				
				}
				
			},
            'button[itemId=station_but]':{
				click:function(button) { 
			
		   
		   map.removeControl(this.selector);
	       this.stationstore.removeAll();
		   this.getStationsGrid().setLoading(true);
            // The getForm() method returns the Ext.form.Basic instance:
            var form = button.up('form').getForm();
            
           if (form.isValid()) {
           
           commonsValues=this.getCommons().getForm().getValues(true);
		   
           
     
       var layers=[];
        
        this.stationLayer = new OpenLayers.Layer.Vector("Stations", {
                styleMap: new OpenLayers.StyleMap(stationstyle),
                protocol: new OpenLayers.Protocol.HTTP({
             //   url:'/hpc-usecase-portlet/data/stations.xml',
               url : '/j2ep-1.0/iris/fdsnws/station/1/query?loc=00&cha=LH?,BH*&level=station&format=xml&nodata=404&'+form.getValues(true)+"&"+commonsValues,
				
               format: new StationXMLFormat()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()],
            renderers: stationrenderer});
             
              layers.push(this.stationLayer);
    
      if (this.mapPanel.map.getLayersByName("Stations")!="")
         	this.mapPanel.map.removeLayer(this.mapPanel.map.getLayersByName("Stations")[0]);
        
       

        
	  
		this.stationLayer.events.on({
				 
			    
 			   'featureselected': function(evt){  
                var feature = evt.feature;
                var popup = new OpenLayers.Popup.FramedCloud("popup",
                    OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
                    null,
                    "<div style='font-size:.8em'><br>Station: " + feature.attributes.station+"</div>",
                    null,
                    true
                );
                feature.popup = popup;
                map.addPopup(popup);
},
		       'featureunselected': function(evt){
                var feature = evt.feature;
                map.removePopup(feature.popup);
                feature.popup.destroy();
                feature.popup = null;
            }
    			 
		});

       this.mapPanel.map.addLayers(layers);
   
     
        // manually bind stationstore to layer
       this.stationstore.unbind();
       this.stationstore.bind(this.stationLayer);
       this.getStationsGrid().getSelectionModel().unbind();
       this.getStationsGrid().getSelectionModel().bind(this.stationstore.layer);
       
        this.selectControl = new OpenLayers.Control.SelectFeature(this.stationLayer);
        this.selector = new OpenLayers.Control.SelectFeature(this.stationLayer,{
        click:true,
        autoActivate:true
        });

    map.addControl(this.selector);
	   
								}
            
       				 }
        		},
        		
        		
        		
        		
        'button[itemId=event_but]':{
				click: this.onEventSearch
        		}
        		
        }, this);
    },

    onMapPanelBeforeRender: function(mapPanel, options) {
        var me = this;

        var layers = [];

        // OpenLayers object creating
        var wms = new OpenLayers.Layer.WMS(
            "World Base Layer (KNMI)",
            "http://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?",
            {layers: 'world_raster'}
        );
     
        
         layers.push(wms);
        
         
         
 	     
      

        mapPanel.map.addLayers(layers);
        
    

        // for dev purpose
        //map = mapPanel.map;
        this.mapPanel = mapPanel;
        
     },
    
    onMapPanelAfterRender: function(mapPanel, options) {
    
      
   	this.onEventSearch(this.getEventSearch().down("#event_but"));
   	 
   	},

    onLaunch: function() {
        var me = this;

        // for dev purpose
        ctrl = this;
    },

    onStationStoreLoad: function(store, records) {
        // do custom stuff on summits load if you want, for example here we
        // zoom to summits extent\
         
		 this.getStationsGrid().setLoading(false);
    },
    
    onEventStoreLoad: function(store, records) {
        // do custom stuff on summits load if you want, for example here we
        // zoom to summits extent\
         
		 this.getEventsGrid().setLoading(false);
    },
    
    
    onEventSearch: function(button) {  
			
		   
		   map.removeControl(this.evselector);
	       this.eventstore.removeAll();
		   this.getEventsGrid().setLoading(true);
            // The getForm() method returns the Ext.form.Basic instance:
            var form = button.up('form').getForm();
            
           if (form.isValid()) {
           
           commonsValues=this.getCommons().getForm().getValues(true);
		   commonsValues=  commonsValues.replace("starttime","dateMin");
		   commonsValues=  commonsValues.replace("endtime","dateMax");
           
       var layers=[];
        
        this.eventLayer = new OpenLayers.Layer.Vector("Events", {
                styleMap: new OpenLayers.StyleMap(eventstyle),
                protocol: new OpenLayers.Protocol.HTTP({
             //   url:'/hpc-usecase-portlet/data/stations.xml',
               url : '/j2ep-1.0/edp/services/event/search?limit=1000&format=json&'+form.getValues(true)+"&"+commonsValues,
				
               format: new QuakeMLFormat()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()],
            renderers: eventrenderer});
             
              layers.push(this.eventLayer);
    
      if (this.mapPanel.map.getLayersByName("Events")!="")
         	this.mapPanel.map.removeLayer(this.mapPanel.map.getLayersByName("Events")[0]);
        
       

        
	  
		this.eventLayer.events.on({
				 
			    
 			   'featureselected': function(evt){  
                var feature = evt.feature;
                var popup = new OpenLayers.Popup.FramedCloud("popup",
                    OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
                    null,
                    "<div style='font-size:.8em'><br>Description: " + feature.attributes.description+"</div>",
                    null,
                    true
                );
                feature.popup = popup;
                map.addPopup(popup);
},
		       'featureunselected': function(evt){
                var feature = evt.feature;
                map.removePopup(feature.popup);
                feature.popup.destroy();
                feature.popup = null;
            }
    			 
		});

       this.mapPanel.map.addLayers(layers);
   
     
        // manually bind stationstore to layer
       this.eventstore.unbind();
       this.eventstore.bind(this.eventLayer);
       this.getEventsGrid().getSelectionModel().unbind();
       this.getEventsGrid().getSelectionModel().bind(this.eventstore.layer);
       
        this.evselectControl = new OpenLayers.Control.SelectFeature(this.eventLayer);
        this.evselector = new OpenLayers.Control.SelectFeature(this.eventLayer,{
        click:true,
        autoActivate:true
        });

    map.addControl(this.evselector);
	   
								}
            
       				 }
        		
});

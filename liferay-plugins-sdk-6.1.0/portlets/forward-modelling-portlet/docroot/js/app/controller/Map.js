  /**
   * Map controller
   * Used to manage map layers and showing their related views
   */
  //Global variables
  var gl_stationUrl;
  var gl_eventUrl;
  var gl_stationFormat;
  var GL_EVENTSLIMIT = 30;
  var contours =null;
  var g_eventLayer = null;
  var g_eventStore=null;
  var g_stationLayer= null;
  var g_stationStore=null;
  var bespoke_mesh = null;
  var mesh = null;
  var PointsListFormat = function(response, callback) {
          var isBespoke = Ext.getCmp('meshes').getValue() == "Bespoke";
          var isGlobe = Ext.getCmp('meshes').getValue() == "Globe";
          var lines = response.replace(/\r\n/g, "\n").split("\n");
          var features = [];
          var sFeatures = [];
          for (var l = 1; l < lines.length; l++) {
              var tokens = lines[l].split(" ");
              if (tokens.length > 3) {
                  var mesh = Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
                  lat=tokens[3];
                  lon=tokens[2];
                  var valid = isGlobe ? true : (isBespoke ? containsPoint(contours,lat,lon) : validate_geo_location(mesh, lon, lat));
                  //if (tokens[2] >= mesh.get('geo_minLon') && tokens[2] <= mesh.get('geo_maxLon') && tokens[3] >= mesh.get('geo_minLat') && tokens[3] <= mesh.get('geo_maxLat')) //Check if it is inside the bounding box
                  if (valid) {
                      //alert("station: "+tokens[0]+", network: "+tokens[1]+", elevation: '', longitude: "+tokens[2]+", latitude: "+tokens[3]);
                      var attributes = {
                          net_station_code: tokens[1]+"."+tokens[0],
                          station: tokens[0],
                          network: tokens[1],
                          elevation: "",
                          longitude: lon,
                          latitude: lat
                      };
                      g_stationStore.add(attributes);
                      Ext.create('CF.view.globe.StationPlaceMark',{layer: g_stationLayer, position : {lat:latitude, lon:longitude, altitude:0}, attributes : attributes});
                  }
              }
          }
          Ext.getCmp("stationgrid").setLoading(false);
          g_stationLayer.refresh();
          wwd.redraw()
          if(callback)
          {
            callback();
          }
      };

  var QuakeMLXMLFormat = function(response,callback) {
      var xmlDoc = response;
      var events = xmlDoc.getElementsByTagName("event");
      for (var e = 0; e < events.length; e++) {
          var event = events[e];
          var mrr = "",
              mtt = "",
              mpp = "",
              mrt = "",
              mtp = "";
          var valid = true;
          try {
              //ID
              var eventId = event.getAttribute("publicID");

              // Description
              var descElem = event.getElementsByTagName("description")[0];
              if (descElem) desc = descElem.getElementsByTagName("text")[0].firstChild.data;
              else valid = false;

              // Origin
              var prefOrigin = event.getElementsByTagName("preferredOriginID")[0];
              var origins = event.getElementsByTagName("origin");
              if (prefOrigin) {
                  prefOrigin = prefOrigin.childNodes[0].nodeValue;
                  for (var o = 0; o < origins.length; o++) {
                      origin = origins[o];
                      if (origin.getAttribute("publicID") == prefOrigin) break;
                  }
              } else {
                  if (origins.length > 0) origin = origins[0];
              }

              // Magnitude
              var prefMagnitude = event.getElementsByTagName("preferredMagnitudeID")[0];
              var magnitudes = event.getElementsByTagName("magnitude");
              if (prefMagnitude) {
                  prefMagnitude = prefMagnitude.childNodes[0].nodeValue;
                  for (var m = 0; m < origins.length; m++) {
                      magnitude = magnitudes[m];
                      if (magnitude.getAttribute("publicID") == prefMagnitude) break;
                  }
              } else {
                  if (magnitudes.length > 0) magnitude = magnitudes[0];
              }

              // Focal Mechanism
              var tensorElem = event.getElementsByTagName("tensor")[0];
              if (tensorElem) {
                  mrr = tensorElem.getElementsByTagName("Mrr")[0].getElementsByTagName("value")[0].firstChild.data;
                  mtt = tensorElem.getElementsByTagName("Mtt")[0].getElementsByTagName("value")[0].firstChild.data;
                  mpp = tensorElem.getElementsByTagName("Mpp")[0].getElementsByTagName("value")[0].firstChild.data;
                  mrt = tensorElem.getElementsByTagName("Mrt")[0].getElementsByTagName("value")[0].firstChild.data;
                  mrp = tensorElem.getElementsByTagName("Mrp")[0].getElementsByTagName("value")[0].firstChild.data;
                  mtp = tensorElem.getElementsByTagName("Mtp")[0].getElementsByTagName("value")[0].firstChild.data;

              } else valid = false;

              // Time
              var timeElem = origin.getElementsByTagName("time")[0];
              if (timeElem) time = timeElem.getElementsByTagName("value")[0].firstChild.data;
              else valid = false;

              // Magnitude
              var magElem = magnitude.getElementsByTagName("mag")[0];
              if (magElem) mag = magElem.getElementsByTagName("value")[0].firstChild.data;
              else valid = false;

              // Depth
              var depthElem = origin.getElementsByTagName("depth")[0];
              if (depthElem) depth = depthElem.getElementsByTagName("value")[0].firstChild.data;
              else valid = false;

              // Longitude
              var longElem = origin.getElementsByTagName("longitude")[0];
              if (longElem) lon = longElem.getElementsByTagName("value")[0].firstChild.data;
              else valid = false;

              // Latitude
              var latElem = origin.getElementsByTagName("latitude")[0];
              if (latElem) lat = latElem.getElementsByTagName("value")[0].firstChild.data;
              else valid = false;

              //alert("id: "+eventId+", description: "+desc+", datetime: "+time+", magnitude: "+mag+", depth: "+depth+
              //  ", longitude: "+lon+", latitude: "+lat+", tensor: "+mrr+", "+mtt+", "+mpp+", "+mrt+", "+mtp+". Valid event: "+valid);

              //var mesh = Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
              var mesh = (Ext.getCmp('meshes').getValue() == "Bespoke") ? bespoke_mesh : Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
          } catch (e) {
              valid = false;
          }

          if (valid) {
          //if (valid &&  containsPoint(contours,lat,lon)){//validate_geo_location(mesh, lon, lat) ){
              var isPointValid = false;
              if(Ext.getCmp('meshes').getValue() == "Globe")
              {
                isPointValid =true;
              }
              else if(Ext.getCmp('meshes').getValue() == "Bespoke")
              {
                isPointValid= containsPoint(contours,lat,lon);
              }
              else
              {
                isPointValid = validate_geo_location(mesh, lon, lat);
              }
              if (isPointValid) {
                  var attributes = {
                      eventId: eventId,
                      description: desc,
                      date: time,
                      magnitude: mag,
                      depth: depth,
                      longitude: lon,
                      latitude: lat,
                      tensor_mrr: mrr,
                      tensor_mtt: mtt,
                      tensor_mpp: mpp,
                      tensor_mrt: mrt,
                      tensor_mrp: mrp,
                      tensor_mtp: mtp
                  };
                  g_eventStore.add(attributes);//latitude: "43.25", longitude: "41.57",
                  Ext.create('CF.view.globe.EventPlaceMark',{layer: g_eventLayer, position : {lat:lat, lon:lon, altitude:0}, attributes : attributes});

              }
          }
      }
      g_eventLayer.refresh();
      wwd.redraw();
      Ext.getCmp("eventgrid").setLoading(false);
      if(callback)
      {
        callback();
      }
  };

  var StationXMLFormat = function(response,callback) {
          // We're going to read XML
      var xmlDoc = response;
      var isBespoke = Ext.getCmp('meshes').getValue() == "Bespoke";
      var isGlobe = Ext.getCmp('meshes').getValue() == "Globe";
      var latitudes = xmlDoc.getElementsByTagName("Latitude");
      var longitudes = xmlDoc.getElementsByTagName("Longitude");
      var elevs = xmlDoc.getElementsByTagName("Elevation");
      var stations = xmlDoc.getElementsByTagName("Station");
      for (var i = 0; i < latitudes.length; i++) {
          var latitude = latitudes[i].childNodes[0].nodeValue;
          var longitude = longitudes[i].childNodes[0].nodeValue;
          var mesh = Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
          var valid = isGlobe ? true : (isBespoke ? containsPoint(contours,latitude,longitude) : validate_geo_location(mesh, longitude, latitude));
          if (valid) { //(longitude >= mesh.get('geo_minLon') && longitude <= mesh.get('geo_maxLon') && latitude >= mesh.get('geo_minLat') && latitude <= mesh.get('geo_maxLat')) {
              var station = stations[i].getAttribute("code");
              stations[i].setAttribute("network", stations[i].parentNode.getAttribute("code"));
              var network = stations[i].getAttribute("network");
              var elev = elevs[i].childNodes[0].nodeValue;
              var attributes = {
                  net_station_code: network+"."+station,
                  station: station,
                  network: network,
                  elevation: elev,
                  longitude: longitude,
                  latitude: latitude
              };
              g_stationStore.add(attributes);//latitude: "43.25", longitude: "41.57",
              Ext.create('CF.view.globe.StationPlaceMark',{layer: g_stationLayer, position : {lat:latitude, lon:longitude, altitude:elev}, attributes : attributes});
          }
      }
      Ext.getCmp("stationgrid").setLoading(false);
      g_stationLayer.refresh();
      wwd.redraw();
      if(callback)
      {
        callback();
      }

  }; 

  Ext.define('CF.controller.Map', {
      extend: 'Ext.app.Controller',
      refs: [{
          ref: 'stationGrid',
          selector: 'stationgrid'
      }, {
          ref: 'eventSearch',
          selector: 'eventsearch'
      }, {
          ref: 'eventGrid',
          selector: 'eventgrid'
      }, {
          ref: 'commons',
          selector: 'commons'
      }],
      views: ['LinkButton','CF.view.globe.EventPlaceMark','CF.view.globe.StationPlaceMark'],
      stores: ['CF.store.SolverConf', 'CF.store.Event', 'CF.store.Station'],
      init: function() {
          this.getStore('stationStore').on({
              scope: this,
              'datachanged': this.onStationStoreLoad
          });
          this.getStore('eventStore').on({
              scope: this,
              'datachanged': this.onEventStoreLoad
          });
          this.control({
              'button[itemId=station_cl_btn]': {
                  click: function(button) {
                      this.getStore('stationStore').removeAll();
                      this.getLayersByName("Stations").removeAllRenderables();
                      this.getLayersByName("StationInfo").removeAllRenderables();
                      Ext.getCmp('stationSelColumn').setText("0/0");
                  }
              },
              'button[itemId=event_cl_but]': {
                  click: function(button) {
                      this.getStore('eventStore').removeAll();
                      this.getLayersByName("Events").removeAllRenderables();
                      this.getLayersByName("eventInfo").removeAllRenderables();
                      Ext.getCmp('eventSelColumn').setText("0/0");
                  }
              },
              'button[itemId=station_btn]': {
                  click: this.onStationSearch
              },
              'button[itemId=event_but]': {
                  click: this.onEventSearch
              }
          }, this);

          var self = this;
          window.addEventListener('message', function(message) {
              self.encryptedIrodsSession = message.data;
          }, false);
      },
      onStationStoreLoad: function(store, records) {
          //if the solver, the stations and the events are selected, enable the submit button
          if (this.getStore('eventStore').count() > 0 && this.getStore('stationStore').count() > 0 && this.getStore('solverConfStore').count() > 0) {
              Ext.getCmp('tabpanel_principal').down('#submit').setDisabled(false);
          }
          //Set the number of stations in the grid (shown as header of selected colum)
          Ext.getCmp('stationSelColumn').setText("0/" + store.data.length);
      },
      onEventStoreLoad: function(store, records) {
          //if the solver, the stations and the events are selected, enable the submit button
          if (this.getStore('eventStore').count() > 0 && this.getStore('stationStore').count() > 0 && this.getStore('solverConfStore').count() > 0) {
              Ext.getCmp('tabpanel_principal').down('#submit').setDisabled(false);
          }
          //Set the number of events in the grid (shown as header of selected colum)
          Ext.getCmp('eventSelColumn').setText("0/" + store.data.length);
      },
      onEventSearch: function(button) {
          var form = button.up('form').getForm();
          if (form.isValid()) {
              var provider = Ext.getCmp('event_catalog').findRecordByValue(Ext.getCmp('event_catalog').getValue());
              var baseUrl = provider.get('url') + '/fdsnws/event/1/query?';
              var mesh = (Ext.getCmp('meshes').getValue() == "Bespoke") ? bespoke_mesh : Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
             // var mesh = Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
              var polygonsLayer = this.getLayersByName('Polygons').renderables[0];
              var mesh = (Ext.getCmp('meshes').getValue() == "Bespoke") ? bespoke_mesh : Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
              latLonValues=computeMinMaxLatLonValues(mesh,polygonsLayer);
              minLat= latLonValues[0];
              maxLat = latLonValues[1];
              minLon = latLonValues[2];
              maxLon = latLonValues[3];
              var bbox = "&maxlat=" + maxLat + "&minlon=" + minLon + "&maxlon=" + maxLon + "&minlat=" + minLat;
              var formValues = form.getValues();
              var formValuesString = "";
              for (key in formValues) {
                  if (!formValues.hasOwnProperty(key) || key === 'catalog') { // remove catalog and inherited properties
                      continue;
                  };
                  formValuesString += (formValuesString === "" ? "" : "&") + key + "=" + formValues[key];
              };
              var extraParams = provider.get('extraParams') != null ? provider.get('extraParams') : "";
              this.getEvents(baseUrl + formValuesString + bbox + extraParams);
          }
      },
      onEventClick: function(record, selectEvent) {

        updateEventsLayer(record.data.eventId,selectEvent);
      },
      onStationClick: function(record, selectStation) {
        net_station_code=record.data.network +"."+record.data.station;
        updateStationsLayer(net_station_code,selectStation);
      },
      onStationSearch: function(button) {
          var form = button.up('form').getForm();
          if (form.isValid()) {
              var provider = Ext.getCmp('station_catalog').findRecordByValue(Ext.getCmp('station_catalog').getValue());
              var baseUrl = provider.get('url') + '/fdsnws/station/1/query?level=station&';
              //var mesh = (Ext.getCmp('meshes').getValue() == "Bespoke") ? bespoke_mesh : Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
              var polygonsLayer = this.getLayersByName('Polygons').renderables[0];
              var mesh = (Ext.getCmp('meshes').getValue() == "Bespoke") ? bespoke_mesh : Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
              latLonValues=computeMinMaxLatLonValues(mesh,polygonsLayer);
              minLat= latLonValues[0];
              maxLat = latLonValues[1];
              minLon = latLonValues[2];
              maxLon = latLonValues[3];
              var bbox = "&maxlat=" + maxLat + "&minlon=" + minLon + "&maxlon=" + maxLon + "&minlat=" + minLat;
              var networks = button.up('form').down('multicombo').rawValue.replace(/\s/g, "");
              if (typeof networks === 'string') {
                  // handle custom strings
                  networks = networks.split(',');
              }
              var searchStartDate = Ext.getCmp('startTime').getSubmitValue();
              var searchEndDate = Ext.getCmp('endTime').getSubmitValue();
              //this.getStations(this, baseUrl + 'network=' + networks.join(',') + bbox, STXML_TYPE);
              var extraParams = provider.get('extraParams') != null && Ext.getCmp('solvertype').getValue() == "SPECFEM3D_GLOBE" ? provider.get('extraParams') : "";

              this.getStations(baseUrl + 'starttime=' + searchStartDate + '&endtime=' + searchEndDate + '&network=' + networks.join(',') + bbox + extraParams, STXML_TYPE);
          }
      },
      setOnClickListener : function(wwd)
      {
        setClickHandler(wwd);
      },
      setWmsLayer : function (mapPanel,layer, options) {
            createWmsLayer(mapPanel,layer,options);
      },
      getLayersByName : function(name){
          for(var i=0;i < wwd.layers.length;i++)
          {
              if(wwd.layers[i].displayName==name){
                  return wwd.layers[i];
              }
          }
        },
      getStations: function(purl, formatType,callback) {
          gl_stationUrl = purl;
          gl_stationFormat = formatType;
          this.getStore('stationStore').removeAll();
          this.getStationGrid().setLoading(true);

          g_stationLayer = this.getLayersByName( "Stations");
          stationInfoLayer=this.getLayersByName("StationInfo");
          g_stationStore=this.getStore('stationStore');
          g_stationLayer.removeAllRenderables();
          stationInfoLayer.removeAllRenderables();
          g_stationStore.removeAll();

          contours=this.getLayersByName('Polygons').renderables[0].contours[0].polygons;
          if (formatType === STXML_TYPE)
          {
            jqueryRequest(purl,StationXMLFormat,callback);
          }
          else if (formatType === STPOINTS_TYPE)
          {
            jqueryRequest(purl,PointsListFormat,callback);
          }
      },
      getEvents: function(purl,callback) {
          gl_eventUrl = purl;
          this.getStore('eventStore').removeAll();
          this.getEventGrid().setLoading(true);

          g_eventLayer = this.getLayersByName('Events');
          eventInfoLayer=this.getLayersByName("EventInfo");
          g_eventStore=this.getStore('eventStore');
          g_eventLayer.removeAllRenderables();
          eventInfoLayer.removeAllRenderables();
          g_eventStore.removeAll();

          contours=this.getLayersByName('Polygons').renderables[0].contours[0].polygons;
          jqueryRequest(purl,QuakeMLXMLFormat,callback);

      },
      updateEvents: function(events, selected){
        var i;
        for(i=0;i<events.length;i++)
        {
            updateEventsLayer(events[i],selected);
            updateEventGrid(events[i],selected);
        }
      },
      updateStations: function(stations,selected){
        var i;
        for(i=0;i<stations.length;i++)
        {
            updateStationsLayer(stations[i],selected);
            updateStationGrid(stations[i],selected);
        }
      },
      showEventInfo: function(evtfeature) {
        eventInfoLayer=this.getLayersByName("EventInfo");
        eventInfo=eventInfoLayer.renderables;
        if(eventInfo.length > 0 && eventInfo[0].userProperties.eventId==evtfeature.eventId)
        {
            eventInfoLayer.removeAllRenderables();
            return;
        }
        eventInfoLayer.removeAllRenderables();

        var annotationAttributes = new WorldWind.AnnotationAttributes(null);
        annotationAttributes.cornerRadius = 14;
        annotationAttributes.backgroundColor = WorldWind.Color.WHITE;
        annotationAttributes.drawLeader = true;
        annotationAttributes.leaderGapWidth = 10;
        annotationAttributes.leaderGapHeight = 30;
        annotationAttributes.opacity = 0.8;
        annotationAttributes.scale = 1;
        annotationAttributes.width = 200;
        annotationAttributes.height = 100;
        annotationAttributes.textAttributes.color = WorldWind.Color.RED;
        annotationAttributes.insets = new WorldWind.Insets(10, 10, 10, 10);

        // Set a location for the annotation to point to and create it.
        var location = new WorldWind.Position(evtfeature.latitude,evtfeature.longitude,0);
        var annotation = new WorldWind.Annotation(location, annotationAttributes);
        // Text can be assigned to the annotation after creating it.
        annotation.label = evtfeature.description;
        annotation.userProperties.eventId=evtfeature.eventId;

        eventInfoLayer.addRenderable(annotation);

        //var grid = Ext.getCmp('eventgrid');
        //grid.getView().focusRow(this.getStore('eventStore').getByFeature(evtfeature));
      },
      showStationInfo: function(stfeature) {
        stationInfoLayer=this.getLayersByName("StationInfo");
        stationInfo=stationInfoLayer.renderables;
        net_station_code=stfeature.network +"."+stfeature.station;
        if(stationInfo.length > 0 && stationInfo[0].userProperties.net_station_code==net_station_code)
        {
            stationInfoLayer.removeAllRenderables();
            return;
        }
        stationInfoLayer.removeAllRenderables();

        var annotationAttributes = new WorldWind.AnnotationAttributes(null);
        annotationAttributes.cornerRadius = 14;
        annotationAttributes.backgroundColor = WorldWind.Color.WHITE;
        annotationAttributes.drawLeader = true;
        annotationAttributes.leaderGapWidth = 10;
        annotationAttributes.leaderGapHeight = 30;
        annotationAttributes.opacity = 0.8;
        annotationAttributes.scale = 1;
        annotationAttributes.width = 200;
        annotationAttributes.height = 100;
        annotationAttributes.textAttributes.color = WorldWind.Color.BLUE;
        annotationAttributes.insets = new WorldWind.Insets(10, 10, 10, 10);

        // Set a location for the annotation to point to and create it.
        var location = new WorldWind.Position(stfeature.latitude,stfeature.longitude,Number(stfeature.elevation));
        var annotation = new WorldWind.Annotation(location, annotationAttributes);
        // Text can be assigned to the annotation after creating it.
        annotation.label = "Station: "+stfeature.station;
        annotation.userProperties.net_station_code=stfeature.net_station_code;

        stationInfoLayer.addRenderable(annotation);

        //var grid = Ext.getCmp('stationgrid');
        //grid.getView().focusRow(this.getStore('stationStore').getByFeature(stfeature));
      },
      createPolygon : function(mesh) {
        bespoke_mesh=mesh;
        var attributes = new WorldWind.ShapeAttributes(null)
        attributes.applyLighting = true;
        attributes.pathType = WorldWind.GREAT_CIRCLE;//WorldWind.GREAT_CIRCLE WorldWind.RHUMB_LINE WorldWind.LINEAR
        attributes.outlineColor = new WorldWind.Color(0, 0, 0, 1);
        attributes.outlineWidth=2;
        attributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.1);

        polygonLayer=this.getLayersByName("Polygons");
        this.clearMap();
        polygonLayer.addRenderable(new WorldWind.SurfacePolygon(mesh.data.polygon.boundaries, attributes));

    },
      clearMap : function(){
        // clear layers
        this.getLayersByName("Polygons").removeAllRenderables();
        this.getLayersByName("Events").removeAllRenderables();
        this.getLayersByName("EventInfo").removeAllRenderables();
        this.getLayersByName("Stations").removeAllRenderables();
        this.getLayersByName("StationInfo").removeAllRenderables();

        // clear data
        Ext.data.StoreManager.lookup('eventStore').removeAll();
        Ext.data.StoreManager.lookup('stationStore').removeAll();

        // disable earthquake, station and submit tabs
        //Ext.getCmp('tabpanel_principal').down('#stations').setDisabled(true);
        //Ext.getCmp('tabpanel_principal').down('#earthquakes').setDisabled(true);
        //Ext.getCmp('tabpanel_principal').down('#submit').setDisabled(true);
    },
      zoomToExtent : function(mesh){
        if (mesh.data.details == "Globe") {
            wwd.goTo(new WorldWind.Position(45,10, 2e7));
        }
        else {

            zoomLevel=computeZoomRange(mesh);
            if(!zoomLevel)
            {

                zoomLevel=2e7;
            }
            centLat=(mesh.data.geo_maxLat - mesh.data.geo_minLat)/2 + mesh.data.geo_minLat;
            centLon=(mesh.data.geo_maxLon - mesh.data.geo_minLon)/2 + mesh.data.geo_minLon;

            if(WorldWind.Location.locationsCrossDateLine(mesh.data.polygon.boundaries))
            {
                centLon = (mesh.data.geo_maxLon + mesh.data.geo_minLon) - 180;
            }
            wwd.goTo(new WorldWind.Position(centLat,centLon, zoomLevel))
        }
    }

  });

function setClickHandler(wwd)
{
    // set up to handle clicks and taps.
    var handleClick  = function (recognizer) {
        // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
        // the mouse or tap location.
        var x = recognizer.clientX, y = recognizer.clientY;

        // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
        // relative to the upper left corner of the canvas rather than the upper left corner of the page.
        var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

        var baseUrl = window.location.origin;
        if (pickList.objects.length > 0) {
            for (var i = 0; i < pickList.objects.length; i++) {
                if (pickList.objects[i].userObject && pickList.objects[i].userObject.userProperties) {

                    if(pickList.objects[i].userObject.userProperties.earthquake)
                    {
                        if (!pickList.objects[i].userObject.userProperties.selected)
                        {
                            pickList.objects[i].userObject.userProperties.selected=true;
                            updateEventGrid(pickList.objects[i].userObject.userProperties.EventAttributes.eventId,true);
                        }
                        else
                        {
                            pickList.objects[i].userObject.userProperties.selected=false;
                            updateEventGrid(pickList.objects[i].userObject.userProperties.EventAttributes.eventId,false);
                        }
                    }
                    else if (pickList.objects[i].userObject.userProperties.station)
                    {
                         if (!pickList.objects[i].userObject.userProperties.selected)
                        {
                            pickList.objects[i].userObject.userProperties.selected=true;
                            updateStationGrid(pickList.objects[i].userObject.userProperties.StationAttributes.net_station_code,true);
                        }
                        else
                        {
                            pickList.objects[i].userObject.userProperties.selected=false;
                            updateStationGrid(pickList.objects[i].userObject.userProperties.StationAttributes.net_station_code,false);
                        }
                    }
                }
            }
        }
    };
    //wwd.addEventListener("click", handleClick);
    // Listen for mouse clicks.
      var clickRecognizer = new WorldWind.ClickRecognizer(wwd, handleClick);

    // Listen for taps on mobile devices.
     var tapRecognizer = new WorldWind.TapRecognizer(wwd, handleClick);


}
function computeZoomRange(mesh) {
    var verticalBoundary = mesh.data.geo_maxLat - mesh.data.geo_minLat;
    var horizontalBoundary = mesh.data.geo_maxLon - mesh.data.geo_minLon;
    // Calculate diagonal angle between boundaries (simple pythagoras formula, we don't need to
    // consider vectors or great circles).
    var diagonalAngle = Math.sqrt(Math.pow(verticalBoundary, 2) + Math.pow(horizontalBoundary, 2));
    // If the diagonal angle is equal or more than an hemisphere (180°) don't change zoom level.
    // Else, use the diagonal arc length as camera altitude.
    if (diagonalAngle >= 180) {
        return null;
    } else {
        // Gross approximation of longitude of arc in km
        // (assuming spherical Earth with radius of 6,371 km. Accuracy is not needed for this).
        var diagonalArcLength = (diagonalAngle / 360) * (2 * 3.1416 * 6371000);
        return diagonalArcLength;
    }
}

function updateEventGrid(eventId,selectEvent)
{
    rowmodel=Ext.getCmp('eventgrid').getSelectionModel();
    items=Ext.getCmp('eventgrid').getStore().data.items;
    for(var i=0;i<items.length;i++)
    {
        if(eventId==items[i].data.eventId)
        {
            if(selectEvent)
            {
                rowmodel.selectRange(i,i,true);
                Ext.getCmp('eventgrid').getView().focusRow(items[i])

            }
            else
            {
                rowmodel.deselectRange(i,i);
            }
            break;
        }
    }

}

function updateStationGrid(net_station_code,selectStation)
{
    rowmodel=Ext.getCmp('stationgrid').getSelectionModel();
    items=Ext.getCmp('stationgrid').getStore().data.items;
    for(var i=0;i<items.length;i++)
    {
        network_station_code=items[i].data.network+"."+items[i].data.station;
        if(net_station_code==network_station_code)
        {
            if(selectStation)
            {
                rowmodel.selectRange(i,i,true);
                Ext.getCmp('stationgrid').getView().focusRow(items[i])
            }
            else
            {
                rowmodel.deselectRange(i,i);
            }
            break;
        }
    }

}

function updateEventsLayer(eventId,selected)
{
    events=controller.getLayersByName('Events').renderables;
    for(var i=0;i<events.length;i++)
    {
        if(events[i].userProperties.EventAttributes.eventId == eventId)
        {
          events[i].userProperties.selected=selected;
          if(selected)
          {
            events[i].attributes.imageSource = window.location.origin + "/forward-modelling-portlet/img/selected-earthquake.png";
          }
          else
          {
            events[i].attributes.imageSource = window.location.origin + "/forward-modelling-portlet/img/earthquake.png";
          }
          break;
        }

    }
}
function updateStationsLayer(net_station_code,selected)
{
    stations=controller.getLayersByName('Stations').renderables;
    for(var i=0;i<stations.length;i++)
    {
        if(stations[i].userProperties.StationAttributes.net_station_code == net_station_code)
        {
              stations[i].userProperties.selected=selected;
              if(selected)
              {
                 stations[i].attributes.imageSource = window.location.origin + "/forward-modelling-portlet/img/selected-station.png";
              }
              else
              {
                stations[i].attributes.imageSource = window.location.origin + "/forward-modelling-portlet/img/station.png";
              }
              break;
        }

    }
}

function jqueryRequest(serviceAddress,processResponse,callback)
{

    Ext.Ajax.request({
        url : serviceAddress,
        method: 'GET',
        useDefaultXhrHeader: false,
        disableCaching: false,
        success: function(response, opts) {
            parser = new DOMParser();
            responseXML= (response.responseXML) ? response.responseXML : parser.parseFromString(response.responseText,"text/xml");
            processResponse(responseXML,callback);
        },

        failure: function(response, opts) {
            console.log('server-side failure with status code ' + response.status);
            Ext.getCmp("stationgrid").setLoading(false);
            Ext.getCmp("eventgrid").setLoading(false);
            Ext.getCmp("viewport").setLoading(false);
        }
    });
}

  // check if the given lon and lat lies within the bounding box
function validate_geo_location(mesh, lon, lat) {
      return lon >= mesh.data.geo_minLon && lon <= mesh.data.geo_maxLon && lat >= mesh.data.geo_minLat && lat <= mesh.data.geo_maxLat;
  }
  // Check if the the position of the given point is inside of the polygon
function containsPoint(polygonFeatures, point) {
      point1 = new OpenLayers.Geometry.Point(normaliseAngleTo360(point.x), point.y);
      for (var i = 0; i < polygonFeatures.length; i++) {
          if (polygonFeatures[i].geometry.containsPoint(point) || polygonFeatures[i].geometry.containsPoint(point1))
              return true;
      }
      return false;

  }

function normaliseAngleTo360(degrees) {
    var angle = degrees % 360;
    return angle >= 0 ? angle : (angle < 0 ? 360 + angle : 360 - angle);
}

function containsPoint(contours, lat,lon)
{
    for(var i=0;i<contours.length;i++)
    {
        if(inside({latitude : lat, longitude : lon}, contours[i]))
        {
            return true;
        }
    }
    return false;
}

// This method checks if a point is inside a polygon.
// It is based on ray-casting algorithm, see https://github.com/substack/point-in-polygon (MIT license):
function inside(point, polygon) {

    var x = point.latitude, y = point.longitude;

    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i].latitude, yi = polygon[i].longitude;
        var xj = polygon[j].latitude, yj = polygon[j].longitude;

        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect)
            inside = !inside;
    }

    return inside;
}
function computeMinMaxLatLonValues(mesh,polygonsLayer){
  minLat= mesh.data.geo_minLat;
  maxLat = mesh.data.geo_maxLat;
  minLon = mesh.data.geo_minLon;
  maxLon = mesh.data.geo_maxLon;

  //polygonsLayer.layer.renderables[0].crossesAntiMeridian || WorldWind.Location.locationsCrossDateLine(mesh.data.polygon.boundaries)
  // added also a custom crossesDateLine() method since the other above commented functions tend to fail if at polar regions
  if(Ext.getCmp('meshes').getValue() == "Bespoke")
  {
      if(crossesDateLine(polygonsLayer.layer.renderables[0].contours[0].polygons[0]))
      // We redefine maxLon to be the smallest longitude value in the eastern hemisphere
      // and minLon to be the biggest value in the western hemisphere to enable us
      // widen the search area for stations/events since these points will be
      // further from the dateline than the predefined minLon and maxLon values.
      {
           sortLonValAsc = mesh.data.polygon.boundaries.slice().sort(function(pt1, pt2) {
                return pt1.longitude - pt2.longitude;
            });
            minLon=sortLonValAsc[1].longitude;
            maxLon=sortLonValAsc[2].longitude+180;
      }
      if(polygonsLayer.layer.renderables[0].containsPole)
      {
            if(minLat < 0 && maxLat < 0)
            {
                minLat = minLat - 90;
            }
            if(minLat >0 && maxLat > 0)
            {
                maxLat = maxLat + 90;
            }
      }
  }
  return [minLat,maxLat,minLon,maxLon];
}
// returns true if the polygon contains at least two points with longitude values of 180 and -180
function crossesDateLine(polygon)
{
    foundFirstPoint=false;
    foundsecondPoint=false;
    for(var i=0;i<polygon.length;i++)
    {
        if(polygon[i].longitude==180)
         {
            foundFirstPoint=true
         }
         if(polygon[i].longitude== -180)
         {
            foundsecondPoint=true
         }
         if(foundFirstPoint && foundsecondPoint)
         {
            break;
         }
    }
    return foundFirstPoint && foundsecondPoint;
}



/**
 * Map controller
 * Used to manage map layers and showing their related views
 */

//Global variables
var gl_minLat; //bounding box
var gl_maxLat; //bounding box
var gl_minLon; //bounding box
var gl_maxLon; //bounding box
var gl_stationUrl;
var gl_eventUrl;
var gl_stationFormat;
var gl_solver;
var gl_mesh;
var gl_velmod;
var GL_EVENTSLIMIT = 30;

evisfeature = null;
svisfeature = null;


var solverConfStore = Ext.create('CF.store.SolverConf');

var eventStore = Ext.create('CF.store.Event');
eventStore.load({
  params: {
    start: 0,
    limit: 10
  }
});

var PointsListFormat = OpenLayers.Class(OpenLayers.Format.Text, {
  read: function(response) {
    var lines = response.replace(/\r\n/g, "\n").split("\n");
    var features = [];
    var sFeatures = [];
    for (var l = 1; l < lines.length; l++) {
      var tokens = lines[l].split(" ");
      if (tokens.length > 3) {
        if (tokens[2] >= gl_minLon && tokens[2] <= gl_maxLon && tokens[3] >= gl_minLat && tokens[3] <= gl_maxLat) //Check if it is inside the bounding box
        {
          //alert("station: "+tokens[0]+", network: "+tokens[1]+", elevation: '', longitude: "+tokens[2]+", latitude: "+tokens[3]);
          var attributes = {
            station: tokens[0],
            network: tokens[1],
            elevation: "",
            longitude: tokens[2],
            latitude: tokens[3]
          };
          feature = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(tokens[2], tokens[3]),
            attributes
          );
          features.push(feature);
        }
      }
    }
    return features;
  }
});

var QuakeMLXMLFormat = OpenLayers.Class(OpenLayers.Format.XML, {
  read: function(response) {
    var xmlDoc = response;
    if (typeof response == "string") {
      xmlDoc = OpenLayers.Format.XML.prototype.read.apply(this, [response]);
    }
    var features = [];
    var events = xmlDoc.getElementsByTagName("event");
    for (var e = 0; e < events.length; e++) {
      var event = events[e];
      var mrr = "",
        mtt = "",
        mpp = "",
        mrt = "",
        mtp = "";
      var valid = true;

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
      //	", longitude: "+lon+", latitude: "+lat+", tensor: "+mrr+", "+mtt+", "+mpp+", "+mrt+", "+mtp+". Valid event: "+valid);

      if (valid && lon >= gl_minLon && lon <= gl_maxLon && lat >= gl_minLat && lat <= gl_maxLat) {
        var attributes = {
          eventId: eventId,
          description: desc,
          datetime: time,
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
        feature = new OpenLayers.Feature.Vector(
          new OpenLayers.Geometry.Point(lon, lat),
          attributes
        );
        features.push(feature);
      }
    }

    return features;
  }
});
var stationStore = Ext.create('CF.store.Station');

var StationXMLFormat = OpenLayers.Class(OpenLayers.Format.XML, {
  read: function(response) {
    // We're going to read XML
    var xmlDoc = response;
    if (typeof response == "string") {
      xmlDoc = OpenLayers.Format.XML.prototype.read.apply(this, [response]);
    }
    var features = [];
    var latitudes = xmlDoc.getElementsByTagName("Latitude");
    var longitudes = xmlDoc.getElementsByTagName("Longitude");
    var elevs = xmlDoc.getElementsByTagName("Elevation");
    var stations = xmlDoc.getElementsByTagName("Station");
    for (var i = 0; i < latitudes.length; i++) {
      var latitude = latitudes[i].childNodes[0].nodeValue;
      var longitude = longitudes[i].childNodes[0].nodeValue;
      if (longitude >= gl_minLon && longitude <= gl_maxLon && latitude >= gl_minLat && latitude <= gl_maxLat) {
        var station = stations[i].getAttribute("code");
        stations[i].setAttribute("network", stations[i].parentNode.getAttribute("code"));
        var network = stations[i].getAttribute("network");
        var elev = elevs[i].childNodes[0].nodeValue;
        var attributes = {
          station: station,
          network: network,
          elevation: elev,
          longitude: longitude,
          latitude: latitude
        };
        feature = new OpenLayers.Feature.Vector(
          new OpenLayers.Geometry.Point(longitude, latitude),
          attributes
        );
        features.push(feature);
      }
    }
    return features;
  }
});

Ext.define('CF.controller.Map', {
  extend: 'Ext.app.Controller',
  refs: [{
    ref: 'stationsGrid',
    selector: 'stationsgrid'
  }, {
    ref: 'eventSearch',
    selector: 'eventsearch'
  }, {
    ref: 'eventsGrid',
    selector: 'eventsgrid'
  }, {
    ref: 'commons',
    selector: 'commons'
  }],
  views: ['LinkButton'],
  init: function() {
    var me = this;
    this.solverConfStore = solverConfStore;
    this.stationstore = stationStore;
    this.stationstore.on({
      scope: me,
      'datachanged': me.onStationStoreLoad
    });
    this.eventstore = eventStore
    this.eventstore.on({
      scope: me,
      'datachanged': me.onEventStoreLoad
    });
    this.control({
      'cf_mappanel': {
        'beforerender': this.onMapPanelBeforeRender,
        'afterrender': this.onMapPanelAfterRender
      },
      'button[itemId=station_cl_but]': {
        click: function(button) {
          this.stationstore.removeAll();
          hideStationInfo();
          Ext.getCmp('stationSelColumn').setText("0/0");
        }
      },
      'button[itemId=event_cl_but]': {
        click: function(button) {
          this.eventstore.removeAll();
          hideEventInfo();
          Ext.getCmp('eventSelColumn').setText("0/0");
        }
      },
      'button[itemId=station_but]': {
        click: this.onStationSearch
      },
      'button[itemId=event_but]': {
        click: this.onEventSearch
      }
    }, this);
  },

  onMapPanelBeforeRender: function(mapPanel, options) {
    this.mapPanel = mapPanel;
  },
  onMapPanelAfterRender: function(mapPanel, options) {
    //this.onEventSearch(this.getEventSearch().down("#event_but"));
  },

  onLaunch: function() {
    var me = this;
    // for dev purpose
    ctrl = this;
  },

  onStationStoreLoad: function(store, records) {
    //if the solver, the stations and the events are selected, enable the submit button
    if (this.eventstore.count() > 0 && this.stationstore.count() > 0 && this.solverConfStore.count() > 0) {
      Ext.getCmp('tabpanel_principal').down('#submit').setDisabled(false);
    }
    //Set the number of stations in the grid (shown as header of selected colum)
    Ext.getCmp('stationSelColumn').setText("0/" + store.getTotalCount());
  },

  onEventStoreLoad: function(store, records) {
    //if the solver, the stations and the events are selected, enable the submit button
    if (this.eventstore.count() > 0 && this.stationstore.count() > 0 && this.solverConfStore.count() > 0) {
      Ext.getCmp('tabpanel_principal').down('#submit').enable();
    }
    //Set the number of events in the grid (shown as header of selected colum)
    Ext.getCmp('eventSelColumn').setText("0/" + store.getTotalCount());
  },

  onEventSearch: function(button) {
    var form = button.up('form').getForm();
    if (form.isValid()) {
      var baseUrl = '/j2ep-1.0/ingv/fdsnws/event/1/query?';
      var bbox = "&maxlat=" + gl_maxLat + "&minlon=" + gl_minLon + "&maxlon=" + gl_maxLon + "&minlat=" + gl_minLat;
      getEvents(this, baseUrl + form.getValues(true) + bbox);
    }
  },
  onStationSearch: function(button) {
    var form = button.up('form').getForm();
    if (form.isValid()) {
      var baseUrl = '/j2ep-1.0/odc/fdsnws/station/1/query?level=station&';
      var bbox = "&maxlat=" + gl_maxLat + "&minlon=" + gl_minLon + "&maxlon=" + gl_maxLon + "&minlat=" + gl_minLat;
      var formValues = form.getValues(true);
      formValues = (formValues === 'net=Any%20network') ? 'net=*' : formValues;
      getStations(this, baseUrl + formValues + bbox, STXML_TYPE);
    }
  }
});

function getStations(elem, purl, formatType) {
  if (formatType === STXML_TYPE) var f = new StationXMLFormat();
  else if (formatType === STPOINTS_TYPE) var f = new PointsListFormat();
  gl_stationFormat = formatType;

  gl_stationUrl = purl;
  elem.stationstore.removeAll();
  elem.getStationsGrid().setLoading(true);
  hideStationInfo();

  var stationLayer = map.getLayersByName('Stations')[0];
  elem.stationstore.bind(stationLayer);

  stationLayer.refresh({
    url: purl,
    format: f,
  });
}

function getEvents(elem, purl) {
  gl_eventUrl = purl;
  elem.eventstore.removeAll();
  elem.getEventsGrid().setLoading(true);
  hideEventInfo();
  // The getForm() method returns the Ext.form.Basic instance:

  var eventLayer = map.getLayersByName('Events')[0];
  elem.eventstore.bind(eventLayer);

  eventLayer.refresh({
    url: purl,
  });
}

//type is a string "event" or "station"
function checkStatus(elem, resp, options, type) {
  var request = resp.priv;
  if (options.callback) {
    if (request.status == 200) // success
    {
      var errorMsg;
      if (resp.requestType != "delete") {
        //if(elem.url.indexOf("/documents/")> -1)
        //	Ext.Msg.alert('Success','The file has been uploaded and the information is now loading on the map.<br>You can manage your uploaded files in the File Manager');

        resp.features = elem.parseFeatures(request);

        if (resp.features.length < 1)
          Ext.Msg.alert("Alert!", "No data returned");
      }
      resp.code = OpenLayers.Protocol.Response.SUCCESS;
    } else // failure
    {
      resp.code = OpenLayers.Protocol.Response.FAILURE;
      if (request.status == 204) errorMsg = "No data returned";
      else if (request.status == 413) errorMsg = "The number of requested results is bigger than the maximum, 3000";

      else errorMsg = "The request failed. Error code " + request.status;
      Ext.Msg.alert("Alert!", errorMsg);
    }
    if (type === "event") ctrl.getEventsGrid().setLoading(false);
    if (type === "station") ctrl.getStationsGrid().setLoading(false);
    options.callback.call(options.scope, resp);
  }
}

function hideEventInfo(evtfeature) {
  if (evtfeature) evisfeature = evtfeature;
  if (evisfeature) {
    if (evisfeature.popup) {
      map.removePopup(evisfeature.popup);
      evisfeature.popup.destroy();
      evisfeature.popup = null;
    }
    evisfeature = null;
  }
}

function showEventInfo(evtfeature) {
  hideEventInfo();
  evisfeature = evtfeature;
  var popuptext = "<div style='font-size:.8em'><br>Description: " + evisfeature.attributes.description + "</div>";
  var popup = new OpenLayers.Popup.FramedCloud("popup",
    OpenLayers.LonLat.fromString(evisfeature.geometry.toShortString()),
    null,
    popuptext,
    null,
    true
  );
  var grid = Ext.ComponentQuery.query('eventsgrid')[0];
  grid.getView().focusRow(eventStore.getByFeature(evisfeature));
  evisfeature.popup = popup;
  map.addPopup(popup);
}

function hideStationInfo(stfeature) {
  if (stfeature) svisfeature = stfeature;
  if (svisfeature) {
    if (svisfeature.popup) {
      map.removePopup(svisfeature.popup);
      svisfeature.popup.destroy();
      svisfeature.popup = null;
    }
    svisfeature = null;
  }
}

function showStationInfo(stfeature) {
  hideStationInfo();
  svisfeature = stfeature;
  var popup = new OpenLayers.Popup.FramedCloud("popup",
    OpenLayers.LonLat.fromString(svisfeature.geometry.toShortString()),
    null,
    "<div style='font-size:.8em'><br>Station: " + svisfeature.attributes.station + "</div>",
    null,
    true
  );
  var grid = Ext.ComponentQuery.query('stationsgrid')[0];
  grid.getView().focusRow(stationStore.getByFeature(svisfeature));
  svisfeature.popup = popup;
  map.addPopup(popup);
}
/**
 * Map controller
 * Used to manage map layers and showing their related views
 */

//Global variables
var gl_stationUrl;
var gl_eventUrl;
var gl_stationFormat;
var GL_EVENTSLIMIT = 30;

evisfeature = null;
svisfeature = null;

var PointsListFormat = OpenLayers.Class(OpenLayers.Format.Text, {
  read: function(response) {
    var lines = response.replace(/\r\n/g, "\n").split("\n");
    var features = [];
    var sFeatures = [];
    for (var l = 1; l < lines.length; l++) {
      var tokens = lines[l].split(" ");
      if (tokens.length > 3) {
        var mesh = Ext.getCmp('meshes').store.findRecord('name', Ext.getCmp('meshes').getValue());
        if (tokens[2] >= mesh.get('geo_minLon') && tokens[2] <= mesh.get('geo_maxLon') && tokens[3] >= mesh.get('geo_minLat') && tokens[3] <= mesh.get('geo_maxLat')) //Check if it is inside the bounding box
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

      var mesh = Ext.getCmp('meshes').store.findRecord('name', Ext.getCmp('meshes').getValue());
      if (valid && lon >= mesh.get('geo_minLon') && lon <= mesh.get('geo_maxLon') && lat >= mesh.get('geo_minLat') && lat <= mesh.get('geo_maxLat')) {
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
      var mesh = Ext.getCmp('meshes').store.findRecord('name', Ext.getCmp('meshes').getValue());
      if (longitude >= mesh.get('geo_minLon') && longitude <= mesh.get('geo_maxLon') && latitude >= mesh.get('geo_minLat') && latitude <= mesh.get('geo_maxLat')) {
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
  views: ['LinkButton'],
  stores: ['CF.store.SolverConf', 'CF.store.Event', 'CF.store.Station'],
  init: function() {
    this.getStore('Station').on({
      scope: this,
      'datachanged': this.onStationStoreLoad
    });
    this.getStore('Event').on({
      scope: this,
      'datachanged': this.onEventStoreLoad
    });
    this.control({
      'cf_mappanel': {
        'beforerender': this.onMapPanelBeforeRender,
        'afterrender': this.onMapPanelAfterRender
      },
      'button[itemId=station_cl_but]': {
        click: function(button) {
          this.getStore('Station').removeAll();
          this.hideStationInfo();
          Ext.getCmp('stationSelColumn').setText("0/0");
        }
      },
      'button[itemId=event_cl_but]': {
        click: function(button) {
          this.getStore('Event').removeAll();
          this.hideEventInfo();
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
  },

  onStationStoreLoad: function(store, records) {
    //if the solver, the stations and the events are selected, enable the submit button
    if (this.getStore('Event').count() > 0 && this.getStore('Station').count() > 0 && this.getStore('SolverConf').count() > 0) {
      Ext.getCmp('tabpanel_principal').down('#submit').setDisabled(false);
    }
    //Set the number of stations in the grid (shown as header of selected colum)
    Ext.getCmp('stationSelColumn').setText("0/" + store.getTotalCount());
  },

  onEventStoreLoad: function(store, records) {
    //if the solver, the stations and the events are selected, enable the submit button
    if (this.getStore('Event').count() > 0 && this.getStore('Station').count() > 0 && this.getStore('SolverConf').count() > 0) {
      Ext.getCmp('tabpanel_principal').down('#submit').enable();
    }
    //Set the number of events in the grid (shown as header of selected colum)
    Ext.getCmp('eventSelColumn').setText("0/" + store.getTotalCount());
  },

  onEventSearch: function(button) {
    var form = button.up('form').getForm();
    if (form.isValid()) {
      var baseUrl = '/j2ep-1.0/ingv/fdsnws/event/1/query?';
      var mesh = Ext.getCmp('meshes').store.findRecord('name', Ext.getCmp('meshes').getValue());
      var bbox = "&maxlat=" + mesh.get('geo_maxLat') + "&minlon=" + mesh.get('geo_minLon') + "&maxlon=" + mesh.get('geo_maxLon') + "&minlat=" + mesh.get('geo_minLat');
      this.getEvents(this, baseUrl + form.getValues(true) + bbox);
    }
  },
  onStationSearch: function(button) {
    var form = button.up('form').getForm();
    if (form.isValid()) {
      var baseUrl = '/j2ep-1.0/odc/fdsnws/station/1/query?level=station&';
      var mesh = Ext.getCmp('meshes').store.findRecord('name', Ext.getCmp('meshes').getValue());
      var bbox = "&maxlat=" + mesh.get('geo_maxLat') + "&minlon=" + mesh.get('geo_minLon') + "&maxlon=" + mesh.get('geo_maxLon') + "&minlat=" + mesh.get('geo_minLat');
      var formValues = form.getValues(true);
      formValues = (formValues === 'net=Any%20network') ? 'net=*' : formValues;
      this.getStations(this, baseUrl + formValues + bbox, STXML_TYPE);
    }
  },
  getStations: function(elem, purl, formatType) {
    if (formatType === STXML_TYPE) var format = new StationXMLFormat();
    else if (formatType === STPOINTS_TYPE) var format = new PointsListFormat();
    gl_stationFormat = formatType;

    gl_stationUrl = purl;
    this.getStore('Station').removeAll();
    this.getStationGrid().setLoading(true);
    this.hideStationInfo();

    var stationLayer = this.mapPanel.map.getLayersByName('Stations')[0];
    this.getStore('Station').bind(stationLayer);

    stationLayer.protocol.format = format;

    stationLayer.refresh({
      url: purl,
    });
  },
  getEvents: function(elem, purl) {
    gl_eventUrl = purl;
    var format = new QuakeMLXMLFormat();
    this.getStore('Event').removeAll();
    this.getEventGrid().setLoading(true);
    this.hideEventInfo();
    // The getForm() method returns the Ext.form.Basic instance:

    var eventLayer = this.mapPanel.map.getLayersByName('Events')[0];
    this.getStore('Event').bind(eventLayer);

    eventLayer.protocol.format = format;

    eventLayer.refresh({
      url: purl,
    });
  },
  checkStatus: function(elem, resp, options, type) {
    //type is a string "event" or "station"
    var request = resp.priv;
    if (options.callback) {
      if (request.status == 200) // success
      {
        var errorMsg;
        if (resp.requestType != "delete") {
          //if(elem.url.indexOf("/documents/")> -1)
          //	Ext.Msg.alert('Success','The file has been uploaded and the information is now loading on the this.mapPanel.map.<br>You can manage your uploaded files in the File Manager');

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
      if (type === "event") this.getEventGrid().setLoading(false);
      if (type === "station") this.getStationGrid().setLoading(false);
      options.callback.call(options.scope, resp);
    }
  },
  hideEventInfo: function(evtfeature) {
    if (evtfeature) evisfeature = evtfeature;
    if (evisfeature) {
      if (evisfeature.popup) {
        this.mapPanel.map.removePopup(evisfeature.popup);
        evisfeature.popup.destroy();
        evisfeature.popup = null;
      }
      evisfeature = null;
    }
  },
  showEventInfo: function(evtfeature) {
    this.hideEventInfo();
    evisfeature = evtfeature;
    var popuptext = "<div style='font-size:.8em'><br>Description: " + evisfeature.attributes.description + "</div>";
    var popup = new OpenLayers.Popup.FramedCloud("popup",
      OpenLayers.LonLat.fromString(evisfeature.geometry.toShortString()),
      null,
      popuptext,
      null,
      true
    );
    var grid = Ext.getCmp('eventgrid');
    grid.getView().focusRow(CF.app.getController('Map').getStore('Event').getByFeature(evisfeature));
    evisfeature.popup = popup;
    this.mapPanel.map.addPopup(popup);
  },
  hideStationInfo: function(stfeature) {
    if (stfeature) svisfeature = stfeature;
    if (svisfeature) {
      if (svisfeature.popup) {
        this.mapPanel.map.removePopup(svisfeature.popup);
        svisfeature.popup.destroy();
        svisfeature.popup = null;
      }
      svisfeature = null;
    }
  },
  showStationInfo: function(stfeature) {
    this.hideStationInfo();
    svisfeature = stfeature;
    var popup = new OpenLayers.Popup.FramedCloud("popup",
      OpenLayers.LonLat.fromString(svisfeature.geometry.toShortString()),
      null,
      "<div style='font-size:.8em'><br>Station: " + svisfeature.attributes.station + "</div>",
      null,
      true
    );
    var grid = Ext.getCmp('stationgrid');
    grid.getView().focusRow(CF.app.getController('Map').getStore('Station').getByFeature(svisfeature));
    svisfeature.popup = popup;
    this.mapPanel.map.addPopup(popup);
  }
});
var wwd = null;
var controller=null;
Ext.define('CF.view.Map', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cf_mappanel',
    border: 'false',
    layout: 'fit',
    region: 'west',
    width: '50%',
    html : '<div class="modal fade" id="legendModal" role="dialog">'+
        '<div class="modal-dialog modal-sm">'+
            '<div class="modal-content">'+
                '<div class="modal-header">'+
                    '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
                    '<h4 class="modal-title">Legend</h4>'+
                '</div>'+
                '<div class="modal-body" id="legendData"> </div>'+
                '<div class="modal-footer">'+
                    '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>'+
    '<div class="collapse navbar-collapse" id="mapNavbar">'+
    '  <ul class="nav navbar-nav">'+
      '    <li class="dropdown">'+
      '         <a class="dropdown-toggle" data-toggle="dropdown" href="#">Projections <span class="caret"></span></a>'+
      '         <ul class="dropdown-menu" id ="projectionsDropdown"></ul>'+
      '    </li>'+
     ' </ul>'+
      '  <ul class="nav navbar-nav">'+
      '     <li class="dropdown">'+
      '         <a class="dropdown-toggle" data-toggle="dropdown" href="#">Layers <span class="caret"></span></a>'+
      '         <ul class="dropdown-menu" id ="layersDropdown"></ul>'+
      '     </li>'+
      '</ul>'+
     ' <ul class="nav navbar-nav">'+
       '    <li class="dropdown">'+
       '        <a class="dropdown-toggle" data-toggle="dropdown" href="#">Legends <span class="caret"></span></a>'+
       '        <ul class="dropdown-menu" id ="legendsDropdown"></ul>'+
       '    </li>'+
      '</ul>'+
        '<ul class="nav navbar-nav">'+
        '   <li class="dropdown">'+
       '        <a class="dropdown-toggle" data-toggle="dropdown" href="#">Controls <span class="caret"></span></a>'+
      '         <ul class="dropdown-menu" id ="slidersDropdown"></ul>'+
     '      </li>'+
    '  </ul>'+
    '</div>'+
    '<div> <canvas id="canvasOne"></canvas> </div>',

    initializeComponent: function()
    {
        // Create a WorldWindow for the canvas.
        wwd = new WorldWind.WorldWindow("canvasOne");
        var projectionsMenu = Ext.create('CF.view.globe.ProjectionMenu', wwd);
        var layersMenu = Ext.create('CF.view.globe.LayerMenu', wwd);

        // Add a base layer and some overlays to the WorldWindow's globe.
        baseLayer = new WorldWind.BMNGLayer(); //Constructs a Blue Marble image layer that spans the entire globe.
        baseLayer.enabled=true;
        baseLayer.hide=true;
        wwd.addLayer(baseLayer);

        coordinateLayer = new WorldWind.CoordinatesDisplayLayer(wwd);
        coordinateLayer.enabled=true;
        coordinateLayer.hide=true;
        coordinateLayer.placement= new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0,WorldWind.OFFSET_FRACTION, 1);
        coordinateLayer.alignment= new WorldWind.Offset(WorldWind.OFFSET_PIXELS, -10,WorldWind.OFFSET_INSET_PIXELS, -18);
        wwd.addLayer(coordinateLayer);

        var eventsLayer = new WorldWind.RenderableLayer("Events");
        wwd.addLayer(eventsLayer);


        viewControlsLayer = new WorldWind.ViewControlsLayer(wwd);
        viewControlsLayer.hide=true;
        wwd.addLayer(viewControlsLayer);

        var stationsLayer = new WorldWind.RenderableLayer("Stations");
        wwd.addLayer(stationsLayer);

        var polygonLayer = new WorldWind.RenderableLayer("Polygons");
        polygonLayer.enabled=true;
        wwd.addLayer(polygonLayer);

        var eventInfoLayer = new WorldWind.RenderableLayer("EventInfo");
        eventInfoLayer.enabled=true;
        eventInfoLayer.hide=true;
        wwd.addLayer(eventInfoLayer);

        var stationInfoLayer = new WorldWind.RenderableLayer("StationInfo");
        stationInfoLayer.enabled=true;
        stationInfoLayer.hide=true;
        wwd.addLayer(stationInfoLayer);

        controller=CF.app.getController('Map');
        wmsLayerOptions= [
        {
            serviceAddress: "https://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?version=1.3.0&service=WMS&request=GetCapabilities&layer=world_raster",
            layerName : "world_raster",
            displayName : "KNMI",
            enabled : true,
            hide : false,
            opacity: 1,
            hasLegend :false,
            hasOpacityControl: false

        },
        {
            serviceAddress: "https://mapsref.brgm.fr/wxs/1GG/GISEurope_Bedrock_and_Structural_Geology?version=1.3.0&service=WMS&request=GetCapabilities&sld_version=1.1.0&layer=Europe_GISEurope_1500K_BedrockAge&format=image/png&STYLE=default",
            layerName : "Europe_GISEurope_1500K_BedrockAge",
            displayName : "Geology",
            enabled : true,
            hide : false,
            opacity: 0.5,
            hasLegend :true,
            hasOpacityControl: true

        },
        {
            serviceAddress: "https://mapsref.brgm.fr/wxs/1GG/GISEurope_Bedrock_and_Structural_Geology?version=1.3.0&service=WMS&request=GetCapabilities&sld_version=1.1.0&layer=Europe_GISEurope_1500K_BedrockAge&format=image/png&STYLE=default",
            layerName : "Europe_GISEurope_1500K_Faults",
            displayName : "Faults",
            enabled : true,
            hide : false,
            opacity: 0.5,
            hasLegend :false,
            hasOpacityControl: true

        },{
            serviceAddress: "/ethz-mapserv/mapserv?MAP=/var/www/mapfile/sharehazard.01.map&FORMAT=image/gif&TRANSPARENT=true&VISIBILITY=false&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities&STYLES=&EXCEPTIONS=application/vnd.ogc.se_inimage&SRS=EPSG%3A4326&layer=hmap469",
            layerName : "hmap469",
            displayName : "Hazards",
            enabled : true,
            hide : false,
            opacity: 0.5,
            hasLegend :true,
            hasOpacityControl: true

        },{
            serviceAddress: "/ethz-mapserv/mapserv?map=/var/www/mapfile/worldvector.map&FORMAT=image/gif&TRANSPARENT=true&VISIBILITY=false&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities&STYLES=&EXCEPTIONS=application/vnd.ogc.se_inimage&SRS=EPSG%3A4326&layer=wv_country_ol",
            layerName : "wv_country_ol",
            displayName : "Borders",
            enabled : true,
            hide : false,
            opacity: 0.5,
            hasLegend :false,
            hasOpacityControl: true

        }
        ];
        for(var i=0;i<wmsLayerOptions.length;i++)
        {
            this.createWmsLayer(layersMenu,wmsLayerOptions[i]);

        }
        controller.setOnClickListener(wwd);
        wwd.goTo(new WorldWind.Position(45,10, 1e7))

    },
    createWmsLayer : function(layersMenu,options)
    {

        // Create the callback parsing function
        var parseXml = function (xml) {

          // Create a WmsCapabilities object from the returned xml
          var wmsCapabilities = new WorldWind.WmsCapabilities(xml);

          // Simulate a user selection of a particular layer to display
          var layerForDisplay = wmsCapabilities.getNamedLayer(options.layerName);
          layerForDisplay.title=options.displayName;
          var layerConfig = WorldWind.WmsLayer.formLayerConfiguration(layerForDisplay);

          // Create the layer
          var wmsLayer = new WorldWind.WmsLayer(layerConfig);
          wmsLayer.enabled=options.enabled;
          wmsLayer.hide=options.hide;
          wmsLayer.opacity=options.opacity;

          wwd.addLayer(wmsLayer);

          layersMenu.updateLayerList();

          if(options.hasLegend)
          {
              legend= {
              name :options.displayName,
              imageUrl:options.serviceAddress.replace("GetCapabilities","GetLegendGraphic")
              };
              Ext.create('CF.view.globe.LegendMenu', legend);
          }

          if(options.hasOpacityControl)
          {
              Ext.create('CF.view.globe.SliderMenu', wmsLayer);
          }
        };

        Ext.Ajax.request({
            url : options.serviceAddress,
            method: 'GET',
            useDefaultXhrHeader: false,
            success: function(response, opts) {
                parser = new DOMParser();
                responseXML= (response.responseXML) ? response.responseXML : parser.parseFromString(response.responseText,"text/xml");
                parseXml(responseXML);
            },

            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });
    },
    listeners:
    {
        afterrender : function(obj, eOpts)
        {
            this.initializeComponent();
        }
    }
});

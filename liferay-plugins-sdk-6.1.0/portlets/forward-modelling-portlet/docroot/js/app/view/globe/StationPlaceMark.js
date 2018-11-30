
Ext.define('CF.view.globe.StationPlaceMark', {
    constructor: function(stationPlaceMark) {

       this.layer = stationPlaceMark.layer;
       this.position= stationPlaceMark.position;
       this.attributes=stationPlaceMark.attributes;
       this.updateStationLayer();
    },
    updateStationLayer : function() {
        var layer = this.layer;
        var position= this.position;
        var placemark = new WorldWind.Placemark(new WorldWind.Position(position.lat, position.lon, position.altitude), true, null);
        placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

        placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        placemark.userProperties.selected=false;
        placemark.userProperties.StationAttributes=this.attributes;
        var baseUrl = window.location.origin;

        image_path= "/forward-modelling-portlet/img/station.png";
        placemark.userProperties.station=true;

        placemarkAttributes.imageSource = baseUrl + image_path;
        placemark.attributes = placemarkAttributes;

        layer.addRenderable(placemark);


    }
});


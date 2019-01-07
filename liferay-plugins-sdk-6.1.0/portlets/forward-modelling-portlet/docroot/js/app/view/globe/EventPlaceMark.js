
Ext.define('CF.view.globe.EventPlaceMark', {
    constructor: function(eventPlaceMark) {

       this.layer = eventPlaceMark.layer;
       this.position= eventPlaceMark.position;
       this.attributes=eventPlaceMark.attributes;
       this.updateStationLayer();
    },
    updateStationLayer : function() {
        var layer = this.layer;
        var position= this.position;

        // Create the custom image for the placemark with a 2D canvas.
       /* var canvas = document.createElement("canvas"),
            ctx2d = canvas.getContext("2d"),
            size = 64, c = size / 2 - 0.5, innerRadius = 5, outerRadius = 20;

        canvas.width = size;
        canvas.height = size;

        var gradient = ctx2d.createRadialGradient(c, c, innerRadius, c, c, outerRadius);
        gradient.addColorStop(0, 'rgb(255, 51, 51)');

        ctx2d.fillStyle = gradient;
        ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
        ctx2d.fill();*/

        var placemark = new WorldWind.Placemark(new WorldWind.Position(position.lat, position.lon, position.altitude), true, null);
        placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        //placemark.label = "Test point";
        placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        placemark.userProperties.selected=false;
        placemark.userProperties.EventAttributes=this.attributes;
        var baseUrl = window.location.origin;

        image_path= "/forward-modelling-portlet/img/earthquake.png";
        placemark.userProperties.earthquake=true;

        placemarkAttributes.imageSource = baseUrl + image_path;

        // Wrap the canvas created above in an ImageSource object to specify it as the placemarkAttributes image source.
        //placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);

        imageScale=Number(this.attributes.magnitude)/10;
        //placemarkAttributes.imageScale = 0.2 + (imageScale > 0.8 ? 0.8 : imageScale);
        placemark.attributes = placemarkAttributes;

        var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
        //highlightAttributes.imageScale = 1.2;
        //placemark.highlightAttributes = highlightAttributes;

        layer.addRenderable(placemark);


    },
    listeners: {


    }
});
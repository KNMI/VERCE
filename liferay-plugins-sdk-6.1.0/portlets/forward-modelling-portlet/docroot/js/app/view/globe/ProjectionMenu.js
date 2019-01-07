
Ext.define('CF.view.globe.ProjectionMenu', {

    constructor: function(worldWindow) {
       var thisExplorer = this;
       this.wwd = worldWindow;
       this.roundGlobe = this.wwd.globe;

       this.createProjectionList(),
        $("#projectionsDropdown").find(" li").on("click", function (e) {
            thisExplorer.onProjectionClick(e);
        });
    },

    createProjectionList : function () {
        var projectionNames = [
            "3D",
            "Equirectangular",
            "Mercator",
            "North Polar",
            "South Polar",
            "North UPS",
            "South UPS",
            "North Gnomonic",
            "South Gnomonic"
        ];
        var projectionDropdown = $("#projectionsDropdown");
        for (var i = 0; i < projectionNames.length; i++) {
            var projectionItem = $('<li><a >' + projectionNames[i] + '</a></li>');
            projectionDropdown.append(projectionItem);
        }
    },

    onProjectionClick : function (event) {
        var projectionName = event.target.innerText || event.target.innerHTML;
        $("#projectionsDropdown").find("button").html(projectionName);

        if (projectionName === "3D") {
            if (!this.roundGlobe) {
                this.roundGlobe = new WorldWind.Globe(new WorldWind.EarthElevationModel());
            }

            if (this.wwd.globe !== this.roundGlobe) {
                this.wwd.globe = this.roundGlobe;
            }
        } else {
            if (!this.flatGlobe) {
                this.flatGlobe = new WorldWind.Globe2D();
            }

            if (projectionName === "Equirectangular") {
                this.flatGlobe.projection = new WorldWind.ProjectionEquirectangular();
            } else if (projectionName === "Mercator") {
                this.flatGlobe.projection = new WorldWind.ProjectionMercator();
            } else if (projectionName === "North Polar") {
                this.flatGlobe.projection = new WorldWind.ProjectionPolarEquidistant("North");
            } else if (projectionName === "South Polar") {
                this.flatGlobe.projection = new WorldWind.ProjectionPolarEquidistant("South");
            } else if (projectionName === "North UPS") {
                this.flatGlobe.projection = new WorldWind.ProjectionUPS("North");
            } else if (projectionName === "South UPS") {
                this.flatGlobe.projection = new WorldWind.ProjectionUPS("South");
            } else if (projectionName === "North Gnomonic") {
                this.flatGlobe.projection = new WorldWind.ProjectionGnomonic("North");
            } else if (projectionName === "South Gnomonic") {
                this.flatGlobe.projection = new WorldWind.ProjectionGnomonic("South");
            }

            if (this.wwd.globe !== this.flatGlobe) {
                this.wwd.globe = this.flatGlobe;
            }
        }

        this.wwd.redraw();
    }
});



Ext.define('CF.view.globe.LayerMenu', {
    constructor: function (worldWindow) {
        this.wwd = worldWindow;
        this.updateLayerList();

    },
    updateLayerList : function () {
        var layerListItem = $("#layersDropdown");

        layerListItem.find("button").off("click");
        layerListItem.find("button").remove();

        // Synchronize the displayed layer list with the WorldWindow's layer list.
       for (var i = 0; i < this.wwd.layers.length; i++) {
            var layer = this.wwd.layers[i];
            if (layer.hide) {
                continue;
            }
            var layerItem = $('<button class="list-group-item btn btn-block">' + layer.displayName + '</button>');
            layerListItem.append(layerItem);

            if (layer.enabled) {
                layerItem.addClass("active");
            } else {
                layerItem.removeClass("active");
            }
        }

        var self = this;
        layerListItem.find("button").on("click", function (e) {
            self.onLayerClick($(this));
        });
    },
    onLayerClick : function (layerButton) {
        var layerName = layerButton.text();

        // Update the layer state for the selected layer.
        for (var i = 0; i < this.wwd.layers.length; i++) {
            var layer = this.wwd.layers[i];
            if (layer.hide) {
                continue;
            }

            if (layer.displayName === layerName) {
                layer.enabled = !layer.enabled;
                if (layer.enabled) {		
                    layerButton.addClass("active");
                    $('#'+layerName+'OpacitySliderPanel').show();
                    $('#'+layerName+'legendPanel').show();
                } else {
                    layerButton.removeClass("active");
                    $('#'+layerName+'OpacitySliderPanel').hide();
                    $('#'+layerName+'legendPanel').hide();
                }
                this.wwd.redraw();
                break;
            }
        }
    },

});

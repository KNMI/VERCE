
Ext.define('CF.view.globe.SliderMenu', {
    constructor: function(layer) {
       this.layer=layer;
       this.updateSliderList();
    },
    updateSliderList : function() {
        var layer = this.layer;
        var name = layer.displayName;
        var sliderDropdown =  $("#slidersDropdown");
        var sliderPanel = $('<div id="'+name+'OpacitySliderPanel"></div>');
        var sliderlabel = '<h5>' + name +'<span id="'+name+'Opacity" class="pull-right">' + Math.round(layer.opacity * 100) + '</span></h5>';
        sliderPanel.append(sliderlabel);
        var sliderItem = $('<li id="'+name+'OpacitySlider"></li>');
	
        // Set up  an opacity slider control
        sliderItem.slider({
            range: "min",
            value: 0.5,
            min: 0,
            max: 1,
            step: 0.05,
            animate: true,
            slide: function (event, ui) {
                $("#"+name+"Opacity").html(Math.round(ui.value * 100));
                layer.opacity = ui.value;
            }
          });

        sliderPanel.append(sliderItem);

        sliderPanel.append('<hr>');
        sliderDropdown.append(sliderPanel);
         if (layer.enabled) {
                $('#'+name+'OpacitySliderPanel').show();
            } else {
                $('#'+name+'OpacitySliderPanel').hide();
            }
    }

});
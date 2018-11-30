
Ext.define('CF.view.globe.LegendMenu', {
    constructor: function(legend) {

       var thisLegend = this;
       this.legend=legend;
       this.updateLegendList();
        $("#legendsDropdown").find(" li").on("click", function (e) {
            thisLegend.onLegendClick(e);
        });
    },
    updateLegendList : function() {
        var legendDropdown = $("#legendsDropdown");

        var legendItem = $('<li id ="' + this.legend.name + 'legend_btn" type="button" class="btn btn-block" data-toggle="modal" data-target="#legendModal" value='+ this.legend.name + ' data-backdrop="false"><a >' + this.legend.name + '</a></li>');

        legendDropdown.append(legendItem);

        var imageUrl=' <input type="hidden"  id="imgUrl_'+ this.legend.name +'" value="'+this.legend.imageUrl +'">'

        legendDropdown.append(imageUrl);


    },
    onLegendClick : function(event) {

       var legendName = event.target.innerText || event.target.innerHTML;
        $("#legendsDropdown").find("button").html(legendName);
          var legendData = $('#legendData');
          legendData.empty();
          imageUrl=$('#imgUrl_'+legendName).val();
          var legendImage=$('<img src="' + imageUrl + '" />');
          legendData.append(legendImage);

    }
});


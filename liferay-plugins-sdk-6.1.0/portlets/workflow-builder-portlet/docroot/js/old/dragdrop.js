$(function() {

		jsPlumb.Defaults.Container = "trash";
		//jsPlumb.Defaults.Anchors = [ "LeftMiddle", "BottomRight" ];
		
        $(".item").draggable({                
				helper:'clone'
				
        });
		
/******** jsplumb options */
		 //Setting up drop options
		var targetDropOptions = {
				tolerance:'touch',
				hoverClass:'dropHover',
				activeClass:'dragActive'
		};
		
		//Setting up a Target endPoint
		var targetColor = "#efefef";
		var targetEndpoint = {
		   endpoint:["Dot", { radius:16 }],
		   paintStyle:{ fillStyle:"#555555"},
		   //isSource:true,
		   scope:"green dot",
		   connectorStyle:{ strokeStyle:"#ffff00", lineWidth:8 },
		   //connector: ["Bezier", { curviness:63 } ],
		   connector: "Flowchart",
		   maxConnections:3,
		   isTarget:true,
		   dropOptions : targetDropOptions
		};
		
		//Setting up a Source endPoint
		var sourceColor = "#ababab";
		
		var sourceEndpoint = {
		   endpoint:["Dot", { radius:16 }],
		   paintStyle:{ fillStyle:"#aaaaaa"},
		   isSource:true,
		   scope:"green dot",
		   connectorStyle:{ strokeStyle:"#555555", lineWidth:8 },
		   //connector: "Flowchart",
		   connector: ["Bezier", { curviness:63 } ],
		   maxConnections:3,
		   //isTarget:true,
		   //dropOptions : targetDropOptions
		   connectorOverlays:[ 
				[ "Arrow", { width:20, length:30, location:0.6, id:"arrow" } ]
				//,[ "Label", { label:"foo", id:"label" } ]
			]
		};
/*************************/
function getTool(toolName,idItem) {
	if (toolName == 'merge') {
		return $('<div id="item'+idItem+'" class="itemUsed"><span>Merge</span><center><img src="img/merge.png"/></center></div>');
	} else if (toolName == 'process') {
		return $('<div id="item'+idItem+'" class="itemUsed"><span>Process</span><center><img src="img/process.png"/></center></div>');	
	} else if (toolName == 'waveform') {
		return $('<div id="item'+idItem+'" class="itemUsed"><span>Waveform</span><center><img src="img/waveform.png"/></center></div>');	
	} else if (toolName == 'plot') {
		return $('<div id="item'+idItem+'" class="itemUsed"><span>Plot</span><center><img src="img/plot.png"/></center></div>');	
	} else if (toolName == 'filter') {
		return $('<div id="item'+idItem+'" class="itemUsed"><span>Filter</span><center><img src="img/filter.png"/></center></div>');	
	} else {
		return $('<div id="item'+idItem+'" class="itemUsed"><span>New Instance of '+toolName+'</span></div>');
	}
	
	
}		

		var idItem = 0;
		
		$("#trash").droppable({
				//tolerance: 'touch',
				/*
                over: function() {
                       $(this).removeClass('out').addClass('over');
                },
                out: function() {
                        $(this).removeClass('over').addClass('out');
                },
				*/
				drop: function(event,ui) {	
						
						var pos = ui.helper.position();												
						var tool = ui.helper.attr("tool");
						if (tool==null) {
							return;
						}
						
                        $(this).removeClass('over').addClass('out');						
						
						idItem +=1;
						obj=getTool(tool,idItem)
						
						
						obj.css({
							position: "absolute", 
							top: pos.top,
							left: pos.left
						});
						obj.appendTo($(this));
						jsPlumb.draggable(obj, {containment:"parent"});
						
						/* plusieurs position
						jsPlumb.addEndpoint("item"+idItem , { anchor:["LeftMiddle","TopCenter","TopRight","RightMiddle","BottomRight","BottomCenter","BottomLeft","TopLeft"] }, targetEndpoint);
						jsPlumb.addEndpoint("item"+idItem , { anchor:["RightMiddle","TopCenter","TopRight","LeftMiddle","BottomRight","BottomCenter","BottomLeft","TopLeft"] }, sourceEndpoint);
						*/
						if (tool != 'waveform') {
							jsPlumb.addEndpoint("item"+idItem , { anchor: "LeftMiddle" }, targetEndpoint);						
						}
						
						if (tool != 'plot') {
							jsPlumb.addEndpoint("item"+idItem , { anchor: "RightMiddle" }, sourceEndpoint);						
						}
						
						/* position suivant un rectangle
						jsPlumb.addEndpoint("item"+idItem, { anchor:[ "Perimeter", { shape:"rectangle" } ] }, sourceEndpoint);
						*/
						
						
						
						

						
						
						
						
						
                }
        });
		
		
});
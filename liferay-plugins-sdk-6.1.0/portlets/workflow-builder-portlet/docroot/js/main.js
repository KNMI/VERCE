AUI().ready(function() {});


Liferay.Portlet.ready(function() {
		
});


Liferay.on("allPortletsReady", function() {
		
		jsPlumb.Defaults.Container = "wf-trash";		
		
		
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
function getTool(toolName,idItem,html) {
	return $('<div id="item'+idItem+'" class="itemUsed">'+html+'div');
}		

		var idItem = 0;
		
		$("#wf-trash").droppable({

				drop: function(event,ui) {	
						
						var pos = ui.helper.position();												
						var tool = ui.helper.attr("tool");
						if (tool==null) {
							return;
						}
						
                        $(this).removeClass('over').addClass('out');						
						
						idItem +=1;
						
						obj=getTool(tool,idItem,ui.helper.html())
						
						
						obj.css({
							position: "absolute", 
							top: pos.top,
							left: pos.left
						});
						obj.appendTo($(this));
						jsPlumb.draggable(obj, {containment:"parent"});
						
						if (tool != 'waveform') {
							jsPlumb.addEndpoint("item"+idItem , { anchor: "LeftMiddle" }, targetEndpoint);						
						}
						
						if (tool != 'plot') {
							jsPlumb.addEndpoint("item"+idItem , { anchor: "RightMiddle" }, sourceEndpoint);						
						}
						
						
						
                }
        });
		

		
});

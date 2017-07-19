 Ext.define('CF.view.dataviews.Conf', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.conf',

  autoScroll: true,
  disabled: true,
  requires: [
    'Ext.grid.plugin.CellEditing',
    'Ext.form.field.Number',
    'CF.view.Component'
  ],
  border: false,
  columns: [{
    header: 'Name',
    dataIndex: 'name',
    flex: 40 / 100,
  }, {
    header: 'Value',
    dataIndex: 'value',
    flex: 30 / 100,
    xtype: 'componentcolumn',
    renderer: function(value, meta, record) {
      var change = function(component, newValue, oldValue, options) {
        record.set('value', newValue, {
          // prevent breaking focus on the field
          silent: true
        });
	if(record.get('name')=='ANGULAR_WIDTH_XI_IN_DEGREES' || record.get('name')=='ANGULAR_WIDTH_ETA_IN_DEGREES' 
	|| record.get('name')=='CENTER_LATITUDE_IN_DEGREES' || record.get('name')=='CENTER_LONGITUDE_IN_DEGREES')
	{   
 		if(parseFloat(newValue) || newValue=="0")
		{
			updateBoundaryBox(record);
		}
	}    
      };
      if (record.get('type') === 'bool') {
        if (value === true || value === 'true' || value === 1 || value === '1' || value === 'on') {
          value = true;
        } else {
          value = false;
        }
        return {
          checked: value,
          xtype: 'checkbox',
          listeners: {
            change: change,
          },
          disabled: !record.get('editable')
        }
      } else if (record.get('type') === 'int') {
        return {
          value: value,
          xtype: 'numberfield',
          allowDecimals: false,
          step: record.get('step'),
          listeners: {
            change: change,
          },
          minValue: record.get('minValue'),
          maxValue: record.get('maxValue'),
          disabled: !record.get('editable')
        }
      } else if (record.get('type') === 'float') {
        return {
          value: Number(value),
          xtype: 'numberfield',
          allowDecimals: true,
          allowExponential: false,
          decimalPrecision: 10,
          step: record.get('step'),
          listeners: {
            change: change,
          },
          minValue: record.get('minValue'),
          maxValue: record.get('maxValue'),
          disabled: !record.get('editable'),
	  name:record.get('name')
        }
      } else if (record.get('type') === 'option') {
        var options = record.get('options');
        options.forEach(function(option) {
          if (option[0] === value) {
            value = option;
            return;
          }
        });
        return {
          value: value,
          store: options,
          queryMode: 'local',
          xtype: 'combobox',
          listeners: {
            change: change,
          },
          disabled: !record.get('editable')
        }
      } else {
        return {
          value: value,
          xtype: 'textfield',
          listeners: {
            change: change,
          },
          disabled: !record.get('editable')
        }
      }
    }
  }, {
    flex: 1,
    header: 'Description',
    dataIndex: 'desc',
    renderer: function(value, metaData, record, rowIdx, colIdx, store) {
        metaData.tdAttr = 'data-qtip="' + value + '"';
        return  '<img src="/../../forward-modelling-portlet/img/help.png" style="margin-left: 20px; width: 16px; height: 16px;" />';   
    }
  }],
  flex: 1,
  selType: 'cellmodel',
  features: [],
  initComponent: function() {
    this.callParent(arguments);
  }
});

function updateBoundaryBox(record)
{
	// convert values to float	
	var width_xi=parseFloat(document.getElementsByName("ANGULAR_WIDTH_XI_IN_DEGREES")[0].value);
	var width_eta=parseFloat(document.getElementsByName("ANGULAR_WIDTH_ETA_IN_DEGREES")[0].value);
	var centLat=parseFloat(document.getElementsByName("CENTER_LATITUDE_IN_DEGREES")[0].value);
	var centLon=parseFloat(document.getElementsByName("CENTER_LONGITUDE_IN_DEGREES")[0].value);

	// work out min/max values for latitude and longitude	
	var minLon=centLon-width_eta;
	var maxLon=centLon+width_eta;
	var minLat=centLat-width_xi;
	var maxLat=centLat+width_xi;

	// reshuffle values
	
	minLat=Math.min(minLat,maxLat);
	maxLat=Math.max(minLat,maxLat);
	minLon=Math.min(minLon,maxLon);
	maxLon=Math.max(minLon,maxLon); 

	//updateMeshValues(mesh,minLon,maxLon,minLat,maxLat)
	var mesh=Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());	
	mesh.data.geo_minLat=minLat;
	mesh.data.geo_maxLat=maxLat;
	mesh.data.geo_minLon=minLon;
	mesh.data.geo_maxLon=maxLon;

	var meshes=computeMeshValues(minLat, maxLat, minLon,maxLon);
	if(Ext.getCmp('meshes').getValue()=="Bespoke")
	{
		 mesh.computedMeshes=meshes; 
	}
	createBoxesLayer(meshes,centLat,centLon,minLat, maxLat, minLon,maxLon);

} 
function computeMeshValues(minLat, maxLat, minLon,maxLon)
{ 
	

	if((minLat < -90)&&(minLon < -180))
	{	
		box1={"minLat":-90,"maxLat":maxLat,"minLon":-180,"maxLon":maxLon}; 
		box2={"minLat":-90,"maxLat":maxLat,"minLon":(180-(-180-minLon)),"maxLon":180}; 
		 
		return [box1,box2];
	}
	else if((minLat < -90)&&(maxLon > 180))
	{	
		box1={"minLat":-90,"maxLat":maxLat,"minLon":minLon,"maxLon":180};
		box2={"minLat":-90,"maxLat":maxLat,"minLon":-180,"maxLon":(-180+(maxLon-180))};   

		return [box1,box2];	 
	}
	else if((maxLat > 90) && (minLon < -180))
	{  
		box1={"minLat":minLat,"maxLat":90,"minLon":-180,"maxLon":maxLon}; 
		box2={"minLat":minLat,"maxLat":90,"minLon":(180-(-180-minLon)),"maxLon":180};
 
		return [box1,box2]; 
	}
	else if((maxLat > 90) && (maxLon > 180))
	{  
		box1={"minLat":minLat,"maxLat":90,"minLon":minLon,"maxLon":180};
		box2={"minLat":minLat,"maxLat":90,"minLon":-180,"maxLon":(-180+(maxLon-180))}; 

		return [box1,box2];
	}
	else if(minLon < -180)
	{ 
		box1={"minLat":minLat,"maxLat":maxLat,"minLon":-180,"maxLon":maxLon};
		box2={"minLat":minLat,"maxLat":maxLat,"minLon":(180-(-180-minLon)),"maxLon":180};

		return [box1,box2];
	}
	else if(maxLon > 180 )
	{ 
		box1={"minLat":minLat,"maxLat":maxLat,"minLon":minLon,"maxLon":180};
		box2={"minLat":minLat,"maxLat":maxLat,"minLon":-180,"maxLon":(-180+(maxLon-180))};  

		return [box1,box2];
	}	
	else if(minLat < -90)
	{
		return [{"minLat":-90,"maxLat":maxLat,"minLon":minLon,"maxLon":maxLon}];  
 
	}
	else if(maxLat > 90)
	{
		return[{"minLat":minLat,"maxLat":90,"minLon":minLon,"maxLon":maxLon}]; 
 
	}
	else
	{
		return [{"minLat":minLat,"maxLat":maxLat,"minLon":minLon,"maxLon":maxLon}]; 
	}
}

function createBoxesLayer(meshes,centLat,centLon,minLat, maxLat, minLon,maxLon) {
	  var controller = CF.app.getController('Map');
	  if (controller.mapPanel.map.getLayersByName("Boxes") != "") {
		controller.mapPanel.map.removeLayer(controller.mapPanel.map.getLayersByName("Boxes")[0]);
	  }  
	  Ext.getStore('Event').removeAll();
	  Ext.getStore('Station').removeAll();
	  var layers = [];
	  var boxes = new OpenLayers.Layer.Boxes("Boxes");


	meshes.forEach( function (mesh,centLat,centLon)
	{
	  var coord = [mesh.minLon, mesh.minLat, mesh.maxLon, mesh.maxLat];
	  bounds = OpenLayers.Bounds.fromArray(coord);
	  box = new OpenLayers.Marker.Box(bounds);
	  box.setBorder("black"); 
	  boxes.addMarker(box);
	  layers.push(boxes);
	});
	  controller.mapPanel.map.addLayers(layers);
	 
	 if (meshes.length ==1)
	{
	  controller.mapPanel.map.setCenter([centLon,centLat]);
	  controller.mapPanel.map.zoomToExtent(bounds);
	}
	// adjusting the lat/lon values for min, max and central when there is more than one box to be shown on the map
	else
	{ 
		min_lat=minLat
		min_lon=minLon
		max_lat=maxLat
		max_lon=maxLon
		cent_lat=centLat
		cent_lon=centLon 
		if(minLat<-90)
		{
			min_lat=-90  
		}
		if(maxLat>90)
		{ 
			max_lat=90 
		}
		if(minLon<-180 || maxLon>180)
		{ 
			min_lon=-180 
			max_lon=180
			cent_lon=0
		}
	
	  controller.mapPanel.map.setCenter([cent_lon,cent_lat]);
	  controller.mapPanel.map.zoomToExtent(new OpenLayers.Bounds.fromArray([min_lon,min_lat,max_lon,max_lat]));
	}
}
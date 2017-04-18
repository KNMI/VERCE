 Ext.define('CF.view.dataviews.Conf', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.conf',

  autoScroll: true,
  disabled: true,
  requires: [
    'Ext.grid.plugin.CellEditing',
    'Ext.form.field.Number',
    'CF.view.Component', 
    'CF.view.SolverSelect'
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

 	// check for any value that exceeds the min/max range (i.e. min/max range should be between -90 and 90 for latitude and between -180 and 180 for longitude)	
 	if(minLat < -90 || minLat > 90 || maxLat < -90 || maxLat > 90 )
 	{
 		alert('value exceeds latitude min/max range ');
 		//undo change
 		record.set('value', record.previousValues.value);
 		document.getElementsByName(record.get('name'))[0].value=record.get('value');
 		return;
 	}
 	if(minLon < -180 || minLon > 180 || maxLon < -180 || maxLon > 180 )
 	{
 		alert('value exceeds longitude min/max range ');
 		//undo change
 		 record.set('value', record.previousValues.value);
 		document.getElementsByName(record.get('name'))[0].value=record.get('value');
 		return;
 	}


 	var mesh=Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());
 	//update mesh values
 	updateMeshValues(mesh,minLon,maxLon,minLat,maxLat);

 	// create a boundary box
 	createBoundariesLayer(mesh);
 }
 function updateMeshValues(mesh,minLon,maxLon,minLat,maxLat)
 {   
 	
 	mesh.data.geo_minLat=minLat;
 	mesh.data.geo_maxLat=maxLat;
 	mesh.data.geo_minLon=minLon;
 	mesh.data.geo_maxLon=maxLon;

 	return mesh;
  
 }
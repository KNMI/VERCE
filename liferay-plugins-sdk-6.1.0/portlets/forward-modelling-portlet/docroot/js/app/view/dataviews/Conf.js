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
			updateBoundaries(record);
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
function updateBoundaries(record)
{
	// convert values to float	
	var width_xi=parseFloat(document.getElementsByName("ANGULAR_WIDTH_XI_IN_DEGREES")[0].value);
	var width_eta=parseFloat(document.getElementsByName("ANGULAR_WIDTH_ETA_IN_DEGREES")[0].value);
	var centLat=parseFloat(document.getElementsByName("CENTER_LATITUDE_IN_DEGREES")[0].value);
	var centLon=parseFloat(document.getElementsByName("CENTER_LONGITUDE_IN_DEGREES")[0].value);
	 	
	minLat=centLat-width_eta/2;
  maxLat=centLat+width_eta/2; 
 	// check if it crosses polar regions
 	if(minLat < -90 || minLat > 90 || maxLat < -90 || maxLat > 90 )
 	{
 		 Ext.MessageBox.alert('WARNING!', 'map projection does not support going across polar regions', function(){ 
     }); 
 		//undo change
 		record.set('value', record.previousValues.value);
 		document.getElementsByName(record.get('name'))[0].value=record.get('value');
 		return;
 	}

	// determine polygon vertices	
	polygonProps=workoutVertices(centLat, centLon, width_eta, width_xi);

  // build a polgon instance
  polygon = buildPolyon(polygonProps.vertices); 


  // work out min/max values for latitude and longitude
  values=computeMinMaxValues(polygon,);
	//update mesh values
	var mesh=Ext.getCmp('meshes').findRecordByValue(Ext.getCmp('meshes').getValue());		
	mesh.data.polygon=polygon; 
  mesh.data.geo_minLat=values[0];
  mesh.data.geo_maxLat=values[1];
  mesh.data.geo_minLon=values[2];
  mesh.data.geo_maxLon=values[3];  

 	// create polygons
 	var controller = CF.app.getController('Map');  
	controller.createPolygonLayer(mesh,polygonProps.isAcrossEquator);
}
// returns min/max values for lat & lon in degrees 
function computeMinMaxValues(polygon,isAcrossEquator)
{  
  minLat=Math.min(polygon.lower_left[1],polygon.lower_right[1]);
  minLon=isAcrossEquator ? Math.min(polygon.mid_left[0],Math.min(polygon.lower_left[0],polygon.upper_left[0]))
                         : Math.min(polygon.lower_left[0],polygon.upper_left[0]);
  maxLon=isAcrossEquator ? Math.max(polygon.mid_right[0],Math.max(polygon.lower_right[0],polygon.upper_right[0]))
                         : Math.max(polygon.lower_right[0],polygon.upper_right[0]);
  maxLat=Math.max(polygon.upper_left[1],polygon.upper_right[1]);

	return [minLat,maxLat,minLon,maxLon];
}
function buildPolyon(vertices)
{  
	lower_left=vertices[0];
	lower_right=vertices[1];
	mid_right=vertices[2];
	upper_right=vertices[3];
	upper_left=vertices[4];
	mid_left=vertices[5];
 
	return {"lower_left":[lower_left[1],lower_left[0]],"lower_right":[lower_right[1],lower_right[0]],"mid_right":[mid_right[1],mid_right[0]],
				  "upper_right":[upper_right[1],upper_right[0]],"upper_left":[upper_left[1],upper_left[0]],"mid_left":[mid_left[1],mid_left[0]]}; 
}
// returns a list of vertices for building an instance of a polygon shape
function workoutVertices(centLat, centLon, width_eta, width_xi)
{ 
	
	if((Math.abs(centLat)+width_eta/2) >= 90)
	{
		width_eta=width_eta-0.001;
	}
	//find the min and max values for latitude of the given point
	minLat=centLat-width_eta/2;
	maxLat=centLat+width_eta/2; 
	minLon=centLon-width_xi/2;
	maxLon=centLon+width_xi/2; 

	// calculate the width of eta in km
	eta=rhumbDistance(minLat, centLon, maxLat, centLon);

	// find top and bottom mid points
	btm_mid_pt=rhumbDestinationPoint(centLat, centLon, 180, eta/2);
	top_mid_pt=rhumbDestinationPoint(centLat, centLon, 0, eta/2);
	
	// work out the width in km of both top and bottom sides
	btm_side_xi=rhumbDistance(btm_mid_pt[0], minLon, btm_mid_pt[0], maxLon);
	top_side_xi=rhumbDistance(top_mid_pt[0], minLon, top_mid_pt[0], maxLon);

	var eq_xi=0;
	var mid_left=[];
	var mid_right=[];	 
	// if across the equator then find the mid left and right points
	isAcrossEquator=minLat<0 && maxLat>0;//maxLat/Math.abs(maxLat)!=minLat/Math.abs(minLat);
	if(isAcrossEquator)
	{
		// each degree of latitude at the equator is approximately 110.567 km
		mid_left=rhumbDestinationPoint(0, centLon, 270, (width_xi*110.567)/2); 
		mid_right=rhumbDestinationPoint(0, centLon, 90, (width_xi*110.567)/2);
		// compute the width at the middle
		eq_xi=rhumbDistance(btm_mid_pt[0], centLon-width_xi/2, btm_mid_pt[0], centLon+width_xi/2);
	}	
	//define xi as a maximum width in kilometers of top, middle and bottom sides 
	xi=Math.max(Math.max(Math.abs(btm_side_xi),Math.abs(top_side_xi)), Math.abs(eq_xi));	

	// identify corner points
	lower_left=rhumbDestinationPoint(btm_mid_pt[0], btm_mid_pt[1], 270, xi/2);
	lower_right=rhumbDestinationPoint(btm_mid_pt[0], btm_mid_pt[1], 90, xi/2);
	upper_left=rhumbDestinationPoint(top_mid_pt[0], top_mid_pt[1], 270, xi/2);
	upper_right=rhumbDestinationPoint(top_mid_pt[0], top_mid_pt[1], 90, xi/2);

	return {"isAcrossEquator":isAcrossEquator, "vertices":[lower_left, lower_right, mid_right, upper_right, upper_left, mid_left]};
}  
function normaliseAngle(angle)
{
	if(angle<=180 && angle >=-180)
		return angle;
	 
    return angle%360; 
}
function toRadians(degrees)
{
	radians= degrees * (Math.PI/180);
	return radians;
	
}
function toDegrees(radians)
{
	degrees= radians * (180/Math.PI);
	return degrees;
} 
// returns the distance in kilometers between two points
// (http://www.movable-type.co.uk/scripts/latlong.html)
function rhumbDistance(lat1, lon1, lat2, lon2){     	
	var R = 6371; // radius in km
    var φ1 = toRadians(lat1), φ2 = toRadians(lat2);
    var Δφ = φ2 - φ1;
    var Δλ = toRadians(Math.abs(lon2-lon1));
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

    // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
    // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
    var q = Math.abs(Δψ) > 10e-12 ? Δφ/Δψ : Math.cos(φ1);

    // distance is pythagoras on 'stretched' Mercator projection
    var δ = Math.sqrt(Δφ*Δφ + q*q*Δλ*Δλ); // angular distance in radians
    var dist = δ * R;

    return dist;
}
//returns the destination point reachable along a rhumb line from a given point with bearing in degrees and a distance in kilometers
// (http://www.movable-type.co.uk/scripts/latlong.html)
function rhumbDestinationPoint(lat, lon, bearing, distance) {
	radius = 6371;// radius in km
    var δ = Number(distance) / radius; // angular distance in radians
    var φ1 = toRadians(lat), λ1 = toRadians(lon);
    var θ = toRadians(bearing);

    var Δφ = δ * Math.cos(θ);
    var φ2 = φ1 + Δφ;

    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(φ2) > Math.PI/2) φ2 = φ2>0 ? Math.PI-φ2 : -Math.PI-φ2;

    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
    var q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1); // E-W course becomes ill-conditioned with 0/0 
    
    var Δλ = δ*Math.sin(θ)/q;
    var λ2 = λ1 + Δλ;
 
    return [toDegrees(φ2), normaliseAngle(toDegrees(λ2))]; // (toDegrees(λ2)+540)%360-180];//normalise to −180..+180°
}

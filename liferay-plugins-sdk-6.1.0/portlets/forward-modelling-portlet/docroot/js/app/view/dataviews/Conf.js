
var updateBoundaries = function(width_xi,width_eta,centLat,centLon) {	// convert values to float
    width_xi = parseFloat(width_xi);
    width_eta = parseFloat(width_eta);
    centLat = parseFloat(centLat);
    centLon = parseFloat(centLon);



    boundaries = computeBoundaries(centLat, centLon, width_eta, width_xi);
    sortByLon = boundaries.slice().sort(function(pt1, pt2) {
        return pt1.longitude - pt2.longitude;
    });
    sortByLat =boundaries.slice().sort(function(pt1, pt2) {
        return pt1.latitude - pt2.latitude;
    });

    if(centLat!=0)
    {
        boundaries=sortByLon;
    }

    var mesh = {
        data: {
            details : "Bespoke",
            polygon : { boundaries :boundaries },
            geo_minLat : sortByLat[0].latitude,
            geo_maxLat : sortByLat[3].latitude,
            geo_minLon : sortByLon[0].longitude,
            geo_maxLon : sortByLon[3].longitude
        }
    }; 

    controller.createPolygon(mesh);
    controller.zoomToExtent(mesh);

}

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
        renderer: function (value, meta, record) {
            var change = function (component, newValue, oldValue, options) {
                record.set('value', newValue, {
                    // prevent breaking focus on the field
                    silent: true
                });
                if (record.get('name') == 'ANGULAR_WIDTH_XI_IN_DEGREES' || record.get('name') == 'ANGULAR_WIDTH_ETA_IN_DEGREES'
                    || record.get('name') == 'CENTER_LATITUDE_IN_DEGREES' || record.get('name') == 'CENTER_LONGITUDE_IN_DEGREES') {
                    if (parseFloat(newValue) || newValue == "0") {
                        xi = document.getElementsByName("ANGULAR_WIDTH_XI_IN_DEGREES")[0].value;
                        eta = document.getElementsByName("ANGULAR_WIDTH_ETA_IN_DEGREES")[0].value;
                        centLat = document.getElementsByName("CENTER_LATITUDE_IN_DEGREES")[0].value;
                        centLon = document.getElementsByName("CENTER_LONGITUDE_IN_DEGREES")[0].value;
                        updateBoundaries(xi,eta,centLat,centLon);
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
                    name: record.get('name')
                }
            } else if (record.get('type') === 'option') {
                var options = record.get('options');
                options.forEach(function (option) {
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
        renderer: function (value, metaData, record, rowIdx, colIdx, store) {
            metaData.tdAttr = 'data-qtip="' + value + '"';
            return '<img src="/../../forward-modelling-portlet/img/help.png" style="margin-left: 20px; width: 16px; height: 16px;" />';
        }
    }],
    flex: 1,
    selType: 'cellmodel',
    features: [],
    initComponent: function () {
        this.callParent(arguments);
    }
});
// computes the four corners points to create a polygon
function computeBoundaries(centLat, centLon, width_eta, width_xi) {


    if(width_xi>=180)
    {
        width_xi=179.9;
    }
    /*if(width_eta>=180)
    {
        width_eta=179.9;
    }*/
    eta_len = width_eta / 2;
    xi_len = width_xi / 2;

    top_mid_pt = WorldWind.Location.greatCircleLocation(new WorldWind.Location(centLat,centLon), 0, toRad(eta_len),new WorldWind.Location(0,0));
    btm_mid_pt = WorldWind.Location.greatCircleLocation(new WorldWind.Location(centLat,centLon), 180, toRad(eta_len),new WorldWind.Location(0,0));

    lower_left = WorldWind.Location.greatCircleLocation(new WorldWind.Location(btm_mid_pt.latitude,btm_mid_pt.longitude), 270, toRad(xi_len),new WorldWind.Location(0,0));
    lower_right = WorldWind.Location.greatCircleLocation(new WorldWind.Location(btm_mid_pt.latitude,btm_mid_pt.longitude), 90, toRad(xi_len),new WorldWind.Location(0,0));
    upper_left = WorldWind.Location.greatCircleLocation(new WorldWind.Location(top_mid_pt.latitude,top_mid_pt.longitude), 270, toRad(xi_len),new WorldWind.Location(0,0));
    upper_right = WorldWind.Location.greatCircleLocation(new WorldWind.Location(top_mid_pt.latitude,top_mid_pt.longitude), 90, toRad(xi_len),new WorldWind.Location(0,0));


    return [lower_left,lower_right,upper_right,upper_left];


}
// to convert an angle from degrees to radians
function toRad(n)
{
    return n * Math.PI / 180;
}

// to convert an angle from radians to degrees
function toDeg(n)
{
    return n * 180 / Math.PI;
}
/*

//Calculate the length of a degree of latitude in meters
//https://en.wikipedia.org/wiki/Latitude
function calculateLatitudeLengthInMeters(lat) {
 a = 6378137;//wwd.globe.radiusAt(lat,lon);//6378137;
 b = 6356752.3142;

 e = (Math.pow(a, 2) - Math.pow(b, 2)) / Math.pow(a, 2);

 c = Math.PI * a * (1 - e);
 d = 180 * Math.pow(1 - e * Math.pow(Math.sin(toRad(lat)), 2), 1.5);

 return (c / d); //* len_deg;

}
//Calculate the length of a degree of longitude in meters
//https://en.wikipedia.org/wiki/Longitude#Length_of_a_degree_of_longitude
function calculateLongitudeLengthInMeters(lat) {
 a = 6378137;//wwd.globe.radiusAt(lat,lon);;
 b = 6356752.3142;

 e = (Math.pow(a, 2) - Math.pow(b, 2)) / Math.pow(a, 2);

 c = Math.PI * a * Math.cos(toRad(lat));
 d = 180 * Math.sqrt(1 - e * Math.pow(Math.sin(toRad(lat)), 2));

 return (c / d);// * len_deg;

 //return ((Math.PI/180) * a * Math.cos(lat))*len_deg;


}

function updateMinMaxValues(mesh,points)
{
 mesh.data.geo_minLat = Math.min(Math.min(points[0].latitude, points[1].latitude),
                                 Math.min(points[2].latitude, points[3].latitude));
 mesh.data.geo_maxLat = Math.max(Math.max(points[0].latitude, points[1].latitude),
                                 Math.max(points[2].latitude, points[3].latitude));
 mesh.data.geo_minLon = Math.min(Math.min(points[0].longitude, points[1].longitude),
                                 Math.min(points[2].longitude, points[3].longitude));
 mesh.data.geo_maxLon = Math.max(Math.max(points[0].longitude, points[1].longitude),
                                 Math.max(points[2].longitude, points[3].longitude));
 return mesh;
}

function normalizeAngle360(degrees) {
    var angle = degrees % 360;
    return angle >= 0 ? angle : (angle < 0 ? 360 + angle : 360 - angle);
}
*/
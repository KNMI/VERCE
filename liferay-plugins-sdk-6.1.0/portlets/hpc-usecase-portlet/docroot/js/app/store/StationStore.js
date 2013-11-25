 
 

 
 						
 Ext.define('CF.model.Station', {
    extend: 'Ext.data.Model',
 
  fields : [
  		    {
            name: 'symbolizer',
            convert: function(v, r) {
                return r.raw.layer.styleMap.createSymbolizer(r.raw, 'default');
            	}
        	},
            {name: 'station', type: 'string', mapping:'station'},
            {name: 'network', type: 'string', mapping:'network'},
            
        	{name: 'latitude', type: 'string' , mapping:'latitude'}, // custom mapping
            {name: 'longitude', type: 'string' , mapping:'longitude'}, // custom mapping
            {name: 'elevation', type: 'string' , mapping:'elevation'} // custom mapping
            
        	],
        	
        	belongsTo : 'CF.model.Network'
});
 						
  				
 
Ext.define('CF.model.Network', {
  extend : 'Ext.data.Model',
  fields : [
          {name: 'network', type: 'string', mapping:'@code'},
          {name: 'latitude', type: 'string'}, // custom mapping
          {name: 'longitude', type: 'string'}, // custom mapping
          {name: 'elevation', type: 'string' } // custom mapping
         
  ]
  ,
  hasMany : {
    model: 'CF.model.Station',
    name: 'stations',
    associationKey:'stations',
    reader: {
   									          type: 'xml',
   									          record:'Station'
 										       }
    }
}); 


Ext.define('CF.reader.StationReader', {
extend : 'Ext.data.reader.Xml',
alias: 'reader.StationReader',
read: function(response) {  
  var xmlDoc=response.responseXML;
  var data = [];
  var lats = xmlDoc.getElementsByTagName("Latitude");
        		var longs = xmlDoc.getElementsByTagName("Longitude");
        		var elevs = xmlDoc.getElementsByTagName("Elevation");
        		var stations = xmlDoc.getElementsByTagName("Station");        		
        		for(var i=0; i<lats.length; i++)
        		{
        			var lat = lats[i].childNodes[0].nodeValue;
        			var long = longs[i].childNodes[0].nodeValue;
        			var station = stations[i].getAttribute("code");
        			
        			stations[i].setAttribute("network",stations[i].parentNode.getAttribute("code"));
        			var network = stations[i].getAttribute("network");
        			 
        			var elev = elevs[i].childNodes[0].nodeValue;
				 //   data.push({station: station, network: '', elevation: elev, longitude: long, latitude: lat});
				   
				   }
  return this.readRecords(xmlDoc);
}
});

/**
 * The store used for summits
 */
Ext.define('CF.store.StationStore', {extend:'GeoExt.data.FeatureStore',
   						 // requires:['CF.model.Station','CF.model.Network'],
   						  model:   'CF.model.Station',
   						  alias: 'store.stationstore',
   						  storeId: 'stationStore',
   						  
   						  /*,
   						  proxy: new GeoExt.data.ProtocolProxy({
           							 protocol: protocol,
        							})
   						  
   						  
    					  proxy: {	 limitParam: undefined,
      						         startParam: undefined,
   						             paramName: undefined,
  						             pageParam: undefined,
 							         noCache:false,
    							     type: 'ajax',
   								     reader: {
   									          type: 'StationReader'
   									          ,
   									          record:'Station'
   									       //   root: 'FDSNStationXML',
										   //   getAssociatedDataRoot:function(data, associationName) {
 										//			 if(associationName == 'stations')
  										//					  return data;}
 						       }  
 								 }*/
 						 
 						   
 						});



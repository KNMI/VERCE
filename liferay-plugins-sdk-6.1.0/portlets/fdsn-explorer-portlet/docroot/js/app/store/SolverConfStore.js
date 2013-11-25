 
 

 
 						
 Ext.define('CF.model.Solver', {
    extend: 'Ext.data.Model',
 
  fields : [
  		     
        	 
            {name: 'xtype', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'desc', type: 'string'},
            {name: 'value', type: 'string'},
            {name: 'req', type: 'string'}
        	
        	]

});
 						
  				
 
/*
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
*/

/**
 * The store used for summits
 */
Ext.define('CF.store.SolverConfStore', {extend:'Ext.data.Store',
   						  requires:['CF.model.Solver'],
   						  model:   'CF.model.Solver',
   						  alias: 'store.solverstore',
   						  storeId: 'solverConfStore',
   						 
   					      
     				    
   					      
   						 }
);
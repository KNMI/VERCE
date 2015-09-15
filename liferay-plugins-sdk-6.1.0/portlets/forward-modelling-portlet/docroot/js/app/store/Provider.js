var providers = [{
  "abbr": "INGV",
  "name": "Istituto Nazionale di Geofisica e Vulcanologia",
  "url": "/j2ep-1.0/ingv",
  "extraParams": "&user=verce_" + userSN,
}, {
  "abbr": "GCMT",
  "name": "Global Centroid Moment Tensor Catalog",
  "url": "/j2ep-1.0/gcmt",
}, {
  "abbr": "NCEDC",
  "name": "Northern California Earthquake Data Center",
  "url": "/j2ep-1.0/ncedc",
  "extraParams": "&includemechanisms=true"
  // "http://service.ncedc.org/fdsnws/event/1/query?minmag=7&maxmag=9&includemechanisms=true",
}, {
  "abbr": "USGS",
  "name": "United States Geological Service",
  "url": "/j2ep-1.0/usgs",
  "extraParams": "&format=xml&producttype=moment-tensor"
  // "http://earthquake.usgs.gov/fdsnws/event/1/query?format=xml&starttime=2014-01-01&endtime=2014-01-02&minmagnitude=5&producttype=moment-tensor",
}, {
  "abbr": "ISC",
  "name": "International Seismological Centre",
  "url": "/j2ep-1.0/isc",
  // http://isc-mirror.iris.washington.edu/fdsnws/event/1/query?starttime=2011-01-07T14:00:00&endtime=2011-02-07&minlatitude=15&maxlatitude=40&minlongitude=-170&maxlongitude=170&minmagnitude=5&includeallmagnitudes=true&orderby=magnitude
}];

Ext.define('CF.store.Provider', {
  extend: 'Ext.data.Store',
  model: 'CF.model.Provider',
  data: providers
});
/**
 * Ext.Loader
 */

Ext.manifest = { // the same content as "app.json"
  compatibility: {
    ext: '4.2'
  }
}

var sys = arbor.ParticleSystem();
sys.parameters({
  repulsion: -20,
  stiffness: 1000,
  friction: -0.5
})
// {repulsion:-10, stiffness:100, friction:1.0,gravity:true, dt:0.015}

Ext.Ajax.disableCaching = true;
Ext.enableAriaButtons=false;
/*Ext.Date.now = function() {
  return "";
}*/

Ext.Loader.setConfig({
  enabled: true,
  disableCaching: false,
  paths: {
    //GeoExt: "../../../forward-modelling-portlet/js/src/GeoExt",
    NasaWorldWind: "../../../forward-modelling-portlet/js/src/NasaWorldWind",

    // for dev use
    // Ext: "http://cdn.sencha.io/ext-4.1.0-gpl/src"
    // for build purpose
    // Ext: "extjs-4.1.0/src"
  }
});

/**
 * CF.app A MVC application demo that uses GeoExt and Ext components to display
 * geospatial data.
 */
Ext.application({
  name: 'CF',
  appFolder: '../../../forward-modelling-portlet/js/app',
   controllers: ['Map'],
  autoCreateViewport: true
});
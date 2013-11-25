/**
 * Ext.Loader
 */
 
 

Ext.Ajax.disableCaching = false;

Ext.Date.now = function () { return ""; }
 
Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: "../../../fdsn-explorer-portlet/js/src/GeoExt",
        // for dev use
        Ext: "http://cdn.sencha.io/ext-4.1.0-gpl/src"
        // for build purpose
        //Ext: "extjs-4.1.0/src"
    }
});

/**
 * CF.app
 * A MVC application demo that uses GeoExt and Ext components to display
 * geospatial data.
 */
Ext.application({
    name: 'CF',
    appFolder: '../../../fdsn-explorer-portlet/js/app',
    controllers: [
        'Map'
    ],
    autoCreateViewport: true
});

/**
 * For dev purpose only
 */
var ctrl, map, mapPanel;

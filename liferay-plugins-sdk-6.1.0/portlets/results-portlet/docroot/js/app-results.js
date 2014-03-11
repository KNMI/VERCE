
var sys = arbor.ParticleSystem();
sys.parameters({repulsion:-20, stiffness:1000,friction:-0.5})

Ext.Ajax.disableCaching = true;
 
Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        Ext: "http://cdn.sencha.io/ext-4.1.0-gpl/src"
    }
});

Ext.application({
    name: 'RS',
    appFolder: '../../../results-portlet/js/app-results',
    autoCreateViewport: true
});

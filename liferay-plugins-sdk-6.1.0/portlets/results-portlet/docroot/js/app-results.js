var sys = arbor.ParticleSystem();
sys.parameters({
    repulsion: -20,
    stiffness: 1000,
    friction: -0.5
})

Ext.Ajax.disableCaching = true;

Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        //Ext: "https://extjs.cachefly.net/ext/gpl/5.0.0/build/ext-all-debug.js"
    }
});

Ext.application({
    name: 'RS',
    appFolder: '../../../results-portlet/js/app-results',
    autoCreateViewport: true
});
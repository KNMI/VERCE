var mimetypes = [{
    "mime": "application/octet-stream",
    "desc": ""
}, {
    "mime": "image/png",
    "desc": ""
}, {
    "mime": "video/mpeg",
    "desc": ""
}]



Ext.regModel('mimetypeModel', {
    fields: [{
            type: 'string',
            name: 'mime'
        }, {
            type: 'string',
            name: 'desc'
        }

    ]
});

var mimetypesStore = Ext.create('Ext.data.Store', {
    model: 'mimetypeModel',
    data: mimetypes
});

// ComboBox with single selection enabled


Ext.define('CF.view.mimeCombo', {
    extend: 'Ext.form.field.ComboBox',
    fieldLabel: 'mime-type',
    name: 'mime-type',
    displayField: 'mime',
    width: 300,
    labelWidth: 130,
    colspan: 4,
    store: mimetypesStore,
    queryMode: 'local',
    getInnerTpl: function () {
        return '<div data-qtip="{mime}">{mime} {desc}</div>';
    },
    initComponent: function () {
        var me = this;


        me.callParent();



    }
});
var mimetypescombo1 = Ext.create('CF.view.mimeCombo', {

});

var mimetypescombo2 = Ext.create('Ext.form.field.ComboBox', {
    fieldLabel: 'mime-type',
    name: 'mime-type',
    displayField: 'mime',
    width: 300,
    labelWidth: 130,
    colspan: 4,
    store: mimetypesStore,
    queryMode: 'local',
    getInnerTpl: function () {
        return '<div data-qtip="{mime}">{mime} {desc}</div>';
    }
});


var graphMode = ""

var currentRun

var level = 1;

var colour = {
    orange: "#EEB211",
    darkblue: "#21526a",
    purple: "#941e5e",
    limegreen: "#c1d72e",
    darkgreen: "#619b45",
    lightblue: "#009fc3",
    pink: "#d11b67",
}

    function wasDerivedFromDephtree(data, graph, parent) {
        var col = colour.darkblue;
        if (parent) {
            col = colour.orange

        }

        //var node = graph.addNode(data["id"],{label:data["_id"].substring(0,5),'color':col, 'shape':'dot', 'radius':19,'alpha':1,mass:2})
        //node.runId=data["runId"]
        var nodea = graph.addNode(data["id"], {
            label: data["_id"].substring(0, 8),
            'color': col,
            'shape': 'dot',
            'radius': 19,
            'alpha': 1,
            mass: 2
        })

        if (parent) {

            graph.addEdge(parent, nodea, {
                length: 0.75,
                directed: true,
                weight: 2
            })

        }

        if (data["derivationIds"].length > 0 && typeof data["derivationIds"] != "undefined") {
            for (var i = 0; i < data["derivationIds"].length; i++) {
                if (data["derivationIds"][i]["wasDerivedFrom"]) {
                    wasDerivedFromDephtree(data["derivationIds"][i]["wasDerivedFrom"], graph, nodea)
                }
            }
        }

    };


function derivedDataDephtree(data, graph, parent) {
    var col = colour.darkgreen;
    if (parent) {
        col = colour.orange

    }

    //var node = graph.addNode(data["id"],{label:data["_id"].substring(0,5),'color':col, 'shape':'dot', 'radius':19,'alpha':1,mass:2})
    //node.runId=data["runId"]
    var nodea = graph.addNode(data["dataId"], {
        label: data["_id"].substring(0, 8),
        'color': col,
        'shape': 'dot',
        'radius': 19,
        'alpha': 1,
        mass: 2
    })

    if (parent) {

        graph.addEdge(parent, nodea, {
            length: 0.75,
            directed: true,
            weight: 2
        })

    }

    if (typeof data["derivedData"] != "undefined" && data["derivedData"].length > 0) {
        for (var i = 0; i < data["derivedData"].length; i++) {
            if (data["derivedData"][i]) {
                derivedDataDephtree(data["derivedData"][i], graph, nodea)
            }
        }
    }



};


function getMetadata(data, graph) {

    /*var node = graph.addNode(data["streams"][0]["id"]+"meata",{label:data["streams"][0]["id"] })
graph.addEdge(node.name,data["streams"][0]["id"],{label:"wasDerivedBy"})*/
    if (data["entities"][0]["location"] != "") {
        var loc = data["entities"][0]["location"].replace(/file:\/\/[\w-]+[\w.\/]+[\w\/]+pub/, "/intermediate/")
        //	loc=loc.replace(//,"")


        var params = graph.addNode(data["entities"][0]["id"] + "loc", {
            label: JSON.stringify(data["entities"][0]["location"]),
            'color': colour.darkgreen,
            'link': loc
        })

        graph.addEdge(params.name, data["entities"][0]["id"], {
            label: "location",
            "weight": 10
        })
    }


}




function wasDerivedFromAddBranch(url) {

    $.getJSON(url, function (data) {
        wasDerivedFromDephtree(data, sys, null)
    });
}




function derivedDataAddBranch(url) {

    graphMode = "DERIVEDDATA"

    $.getJSON(url, function (data) {
        derivedDataDephtree(data, sys, null)
    });
}

function wasDerivedFromNewGraph(url) {

    graphMode = "WASDERIVEDFROM"

    sys.prune();
    wasDerivedFromAddBranch(url)

}


function derivedDataNewGraph(url) {
    sys.prune();
    derivedDataAddBranch(url)

}




function addMeta(url) {

    $.getJSON(url, function (data) {
        getMetadata(data, sys)
    });
}




var activityStore = Ext.create('CF.store.ActivityStore');

var artifactStore = Ext.create('CF.store.ArtifactStore');

var workflowStore = Ext.create('CF.store.WorkflowStore');

var action = Ext.create('Ext.Action', {
    tooltip: 'Open Run',
    text: 'Open Run',

    handler: function () {


        if (typeof workflowSel != "undefined") {
            workflowSel.close();
        }
        workflowSel = Ext.create('Ext.window.Window', {
            title: 'Workflows Runs',
            height: 230,
            width: 800,
            layout: 'fit',
            items: [Ext.create('CF.view.WorlflowSelection')]

        })


        workflowSel.show();
        workflowStore.data.clear()
        workflowStore.load()
    }
});

var refreshAction = Ext.create('Ext.Action', {
    tooltip: 'Refresh View',
    text: 'Refresh View',


    handler: function () {
        activityStore.setProxy({
            type: 'ajax',
            url: '/j2ep-1.0/prov/activities/' + encodeURIComponent(currentRun),
            reader: {
                root: 'activities',
                totalProperty: 'totalCount'
            },
            simpleSortMode: true

        });
        activityStore.data.clear()
        activityStore.load()

    }
});




Ext.define('CF.view.WorlflowSelection', {

    width: 780,

    height: 200,
    extend: 'Ext.grid.Panel',


    requires: [
        'CF.store.WorkflowStore',
        'Ext.grid.plugin.BufferedRenderer'
    ],
    store: workflowStore,
    trackOver: true,
    autoScroll: true,
    verticalScroller: {
        xtype: 'paginggridscroller'
    },



    plugins: [{
        ptype: 'bufferedrenderer',
    }],


    selModel: {
        pruneRemoved: false
    },

    initComponent: function () {
        Ext.apply(this, {
            border: false,

            loadMask: true,

            columns: [

                {
                    header: 'Run ID',
                    dataIndex: 'runId',
                    flex: 5,
                    sortable: false
                }, {
                    header: 'Workflow Name',
                    dataIndex: 'name',
                    flex: 3,
                    sortable: false,
                    groupable: false
                }, {
                    header: 'Description',
                    dataIndex: 'description',
                    flex: 3,
                    sortable: false,
                    field: {
                        xtype: 'textfield',
                        allowBlank: true,
                        maxLength: 50
                    }
                }, {
                    header: 'Date',
                    dataIndex: 'date',
                    flex: 3,
                    sortable: false,
                    groupable: false
                }, // custom mapping
                /*{
                    xtype: 'actioncolumn',
                    width: 40,
                    tdCls: 'Delete',
                    items: [{
                        icon: localResourcesPath + '/img/delete-icon.png', // Use a URL in the icon config
                        tooltip: 'Delete',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);

                            var storeClassName = Ext.getClassName(grid.getStore());
                            var tempStore = Ext.create(storeClassName, {
                                buffered: false
                            });
                            tempStore.add(rec);
                            var xx = tempStore.getAt(0)
                            Ext.Msg.confirm('Remove Run', 'Are you sure?', function (button) {
                                if (button == 'yes') {


                                    var tempx = tempStore.getProxy()
                                    tempx.api.destroy = "/j2ep-1.0/prov/workflow/" + xx.get("runId");

                                    tempStore.remove(xx);
                                    tempStore.sync({
                                        success: function (args) {


                                            grid.getStore().data.clear();
                                            grid.getStore().load();
                                        }

                                    })
                                }
                            })


                        }



                    }]
                } */
            ],
            flex: 1,
            selType: 'cellmodel',
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners: {
                        'validateedit': function (c, e, eOpts) {
                            var r = e.rowIdx;
                            var sr = workflowStore.getAt(r);
                            sr.set(e.field, e.value);
                        }
                    }
                })
            ]




        });
        this.callParent(arguments);

        // store singleton selection model instance


    },

    viewConfig: {
        listeners: {
            itemdblclick: function (dataview, record, item, index, e) {

                activityStore.setProxy({
                    type: 'ajax',
                    url: '/j2ep-1.0/prov/activities/' + encodeURIComponent(record.get("runId")),
                    reader: {
                        root: 'activities',
                        totalProperty: 'totalCount'
                    },
                    simpleSortMode: true

                });
                activityStore.data.clear();
                activityStore.load({
                    callback: function () {
                        currentRun = record.get("runId")
                    }
                })
                Ext.getCmp('filtercurrent').enable();
                Ext.getCmp('searchartifacts').enable();

            }
        }
    }


});




Ext.define('CF.view.ActivityMonitor', {
    region: 'west',
    width: '35%',
    title: 'Processing Elements - Double Click on the PE to access the produced Sream Data',
    height: '100%',
    extend: 'Ext.grid.Panel',
    alias: 'widget.activitymonitor',
    id: 'activitymonitor',
    requires: [
        'CF.store.ActivityStore',
        'Ext.grid.plugin.BufferedRenderer'
    ],

    store: activityStore,
    trackOver: true,
    autoScroll: true,
    collapsible: true,
    verticalScroller: {
        xtype: 'paginggridscroller'
    },

    dockedItems: {
        itemId: 'toolbar',
        xtype: 'toolbar',
        items: [

            action,
            refreshAction
        ]
    },

    plugins: [{
        ptype: 'bufferedrenderer',
    }],


    selModel: {
        pruneRemoved: false
    },

    initComponent: function () {
        Ext.apply(this, {
            border: false,

            loadMask: true,

            columns: [

                {
                    header: 'ID',
                    dataIndex: 'ID',
                    flex: 3,
                    sortable: false
                },

                {
                    header: 'Date',
                    dataIndex: 'creationDate',
                    flex: 3,
                    sortable: true,
                    groupable: false
                }, // custom mapping
                {
                    header: 'Errors',
                    dataIndex: 'errors',
                    flex: 3,
                    sortable: false
                }, // custom mapping
                {
                    header: 'IterationIndex',
                    dataIndex: 'iterationIndex',
                    flex: 3,
                    sortable: false
                } // custom mapping

            ],
            flex: 1,




        });
        this.callParent(arguments);

        // store singleton selection model instance


    },

    viewConfig: {
        listeners: {
            itemdblclick: function (dataview, record, item, index, e) {

                artifactStore.setProxy({
                    type: 'ajax',
                    url: '/j2ep-1.0/prov/entities/generatedby?iterationId=' + record.get("ID"),

                    reader: {
                        root: 'entities',
                        totalProperty: 'totalCount'
                    }



                });
                artifactStore.data.clear()
                artifactStore.load()

            }
        }
    }


});



function is_image(url, callback, errorcallback) {

    var img = new Image();
    if (typeof (errorcallback) === "function") {
        img.onerror = function () {
            errorcallback(url);
        }
    } else {
        img.onerror = function () {
            return false;
        }
    }
    if (typeof (callback) === "function") {
        img.onload = function () {
            callback(url);
        }
    } else {
        img.onload = function () {
            return true;
        }
    }
    img.src = url;

}

var IRODS_URL = "http://dir-irods.epcc.ed.ac.uk/irodsweb/rodsproxy/" + userSN + ".UEDINZone@dir-irods.epcc.ed.ac.uk:1247/UEDINZone"

    function viewData(url) { //var loc=url.replace(/file:\/\/[\w-]+/,"/intermediate-nas/")


        htmlcontent = "<br/><br/><center><strong>Link to data files or data images preview....</strong></center><br/><br/>"
        for (var i = 0; i < url.length; i++) {
            url[i] = url[i].replace(/file:\/\/[\w-]+/, IRODS_URL + "/home/" + userSN + "/verce/")


            htmlcontent = htmlcontent + "<center><div id='" + url[i] + "'><img   src='" + localResourcesPath + "/img/loading.gif'/></div></center><br/><br/>"
            var id = url[i];
            var im = new Object()
            im.func = is_image
            im.func(id, function (val) {
                document.getElementById(val).innerHTML = "<img  width='100%' height='100%' src='" + val + "'/>"
            }, function (val) {
                document.getElementById(val).innerHTML = "<center><strong><a target='_blank'  href='" + val + "'>" + val.substring(val.lastIndexOf('/') + 1) + "</a></strong></center>"
            })

        }

        Ext.create('Ext.window.Window', {
            title: 'Data File',
            height: 400,
            width: 800,
            layout: 'fit',
            items: [{
                overflowY: 'auto',
                overflowX: 'auto',

                xtype: 'panel',
                html: htmlcontent
            }]

        }).show();
    }

    //activityStore.load();




Ext.define('CF.view.StreamValuesRangeSearch', {
        extend: 'Ext.form.Panel',
        // The fields
        title: 'Values\' Range',
        defaultType: 'textfield',
        layout: {
            align: 'center',
            pack: 'center',
            type: 'vbox'
        },
        items: [{
                fieldLabel: 'Attributes keys (csv)',
                name: 'keys',
                allowBlank: false
            }, {
                fieldLabel: 'Min values (csv)',
                name: 'minvalues',
                allowBlank: false
            }, {
                fieldLabel: 'Max values (csv)',
                name: 'maxvalues',
                allowBlank: false
            },
            Ext.create('CF.view.mimeCombo', {})
        ],


        buttons: [{
            text: 'Search',
            formBind: true, //only enabled once the form is valid

            handler: function () {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    artifactStore.setProxy({
                        type: 'ajax',
                        url: '/j2ep-1.0/prov/entities/values-range?runId=' + currentRun + "&" + form.getValues(true),

                        reader: {
                            root: 'entities',
                            totalProperty: 'totalCount'
                        },
                        
                        failure: function (response) {

                            alert("Search Request Failed")


                        }
                        
                    });
                    artifactStore.data.clear()
                    artifactStore.load()
                }
            }
        }]
    }

);




Ext.define('CF.view.StreamContentMatchSearch', {
        extend: 'Ext.form.Panel',
        // The fields
        title: 'Attributes Match',
        defaultType: 'textfield',
        layout: {
            align: 'center',
            pack: 'center',
            type: 'vbox'
        },
        items: [{
                fieldLabel: 'Attributes keys (csv)',
                name: 'keys',
                allowBlank: false
            }, {
                fieldLabel: 'Values (csv)',
                name: 'values',
                allowBlank: false
            },
            Ext.create('CF.view.mimeCombo', {})
        ],


        buttons: [{
            text: 'Search',
            formBind: true, //only enabled once the form is valid

            handler: function () {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    artifactStore.setProxy({
                        type: 'ajax',
                        url: '/j2ep-1.0/prov/entities/contentmatch-eachtoone?runId=' + currentRun + "&" + form.getValues(true),

                        reader: {
                            root: 'entities',
                            totalProperty: 'totalCount'
                        }
                    });
                    artifactStore.data.clear()
                    artifactStore.load()
                }
            }
        }]
    }

);

Ext.define('FilterAjax', {
    extend: 'Ext.data.Connection',
    singleton: true,
    constructor: function (config) {
        this.callParent([config]);
        this.on("beforerequest", function () {
            Ext.getCmp("ArtifactView").el.mask("Loading", "x-mask-loading");

        });
        this.on("requestcomplete", function () {
            Ext.getCmp("ArtifactView").el.unmask();
        });
    }
});

Ext.define('CF.view.FilterOnAncestor', {
        extend: 'Ext.form.Panel',
        // The fields
        title: 'Ancestor Attributes\' Match',
        defaultType: 'textfield',
        layout: {
            align: 'center',
            pack: 'center',
            type: 'vbox'
        },
        items: [{
                fieldLabel: 'Attribute keys (csv)',
                name: 'keys',
                allowBlank: false
            }, {
                fieldLabel: 'Attribute values (csv)',
                name: 'values',
                allowBlank: false
            }

        ],


        buttons: [{
            text: 'Filter',
            formBind: true, //only enabled once the form is valid

            handler: function () {

                dataids = ""
                if (artifactStore.getAt(0).data.ID)
                    dataids = artifactStore.getAt(0).data.ID

                for (var i = 1; i < artifactStore.getCount(); i++) {

                    dataids += ',' + artifactStore.getAt(i).data.ID;
                }



                var form = this.up('form').getForm();
                if (form.isValid()) {
                    FilterAjax.request({

                        method: 'POST',
                        url: '/j2ep-1.0/prov/entities/filterOnAncestorsMeta',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        success: function (response) {
                            filtered = Ext.decode(response.responseText)
                            artifactStore.clearFilter(true);
                            if (filtered.length == 0)
                                artifactStore.removeAll()
                            else {
                                artifactStore.filterBy(function (record, id) {
                                    if (Ext.Array.indexOf(filtered, record.data.ID) == -1) {
                                        return false;
                                    }
                                    return true;
                                }, this);

                            }
                        }

                        ,
                        failure: function (response) {

                            alert("Filter Request Failed")


                        },
                        params: {
                            ids: dataids,
                            keys: form.findField("keys").getValue(),
                            values: form.findField("values").getValue()

                        }
                    });

                }
            }
        }]
    }

);



Ext.define('CF.view.FilterOnAncestorValuesRange', {
        extend: 'Ext.form.Panel',
        // The fields
        title: 'Ancestors Values Range',
        defaultType: 'textfield',
        layout: {
            align: 'center',
            pack: 'center',
            type: 'vbox'
        },
        items: [{
                fieldLabel: 'Attribute keys (csv)',
                name: 'keys',
                allowBlank: false
            }, {
                fieldLabel: 'Min values (csv)',
                name: 'minvalues',
                allowBlank: false
            }, {
                fieldLabel: 'Max values (csv)',
                name: 'maxvalues',
                allowBlank: false
            }


        ],


        buttons: [{
            text: 'Filter',
            formBind: true, //only enabled once the form is valid

            handler: function () {

                dataids = ""
                if (artifactStore.getAt(0).data.ID)
                    dataids = artifactStore.getAt(0).data.ID

                for (var i = 1; i < artifactStore.getCount(); i++) {

                    dataids += ',' + artifactStore.getAt(i).data.ID;
                }



                var form = this.up('form').getForm();
                if (form.isValid()) {
                    FilterAjax.request({

                        method: 'POST',
                        url: '/j2ep-1.0/prov/entities/filterOnAncestorsValuesRange',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        success: function (response) {
                            filtered = Ext.decode(response.responseText)
                            artifactStore.clearFilter(true);
                            if (filtered.length == 0)
                                artifactStore.removeAll()
                            else {
                                artifactStore.filterBy(function (record, id) {
                                    if (Ext.Array.indexOf(filtered, record.data.ID) == -1) {
                                        return false;
                                    }
                                    return true;
                                }, this);

                            }
                        }

                        ,
                        failure: function (response) {

                            alert("Filter Request Failed")


                        },
                        params: {
                            ids: dataids,
                            keys: form.findField("keys").getValue(),
                            minvalues: form.findField("minvalues").getValue(),
                            maxvalues: form.findField("maxvalues").getValue()
                        }
                    });

                }
            }
        }]
    }

);



Ext.define('CF.view.FilterOnMeta', {
        extend: 'Ext.form.Panel',
        // The fields
        title: 'Attributes Match',
        defaultType: 'textfield',
        layout: {
            align: 'center',
            pack: 'center',
            type: 'vbox'
        },
        items: [{
                fieldLabel: 'Attribute keys (csv)',
                name: 'keys',
                allowBlank: false
            }, {
                fieldLabel: 'Attribute values (csv)',
                name: 'values',
                allowBlank: false
            },
            Ext.create('CF.view.mimeCombo', {})

        ],


        buttons: [{
            text: 'Filter',
            formBind: true, //only enabled once the form is valid

            handler: function () {

                dataids = ""
                if (artifactStore.getAt(0).data.ID)
                    dataids = artifactStore.getAt(0).data.ID

                for (var i = 1; i < artifactStore.getCount(); i++) {

                    dataids += ',' + artifactStore.getAt(i).data.ID;
                }



                var form = this.up('form').getForm();
                if (form.isValid()) {
                    FilterAjax.request({

                        method: 'POST',
                        url: '/j2ep-1.0/prov/entities/filterOnMeta',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        success: function (response) {
                            filtered = Ext.decode(response.responseText)
                            artifactStore.clearFilter(true);
                            if (filtered.length == 0)
                                artifactStore.removeAll()
                            else {
                                artifactStore.filterBy(function (record, id) {
                                    if (Ext.Array.indexOf(filtered, record.data.ID) == -1) {
                                        return false;
                                    }
                                    return true;
                                }, this);

                            }
                        }

                        ,
                        failure: function (response) {

                            alert("Filter Request Failed")


                        },
                        params: {
                            ids: dataids,
                            keys: form.findField("keys").getValue(),
                            values: form.findField("values").getValue()

                        }
                    });

                }
            }
        }]
    }

);




Ext.define('CF.view.AnnotationSearch', {
        extend: 'Ext.form.Panel',
        // The fields
        title: 'Annotations',
        defaultType: 'textfield',
        layout: {
            align: 'center',
            pack: 'center',
            type: 'vbox'
        },
        items: [{
            fieldLabel: 'Annotation keys (csv)',
            name: 'keys',
            allowBlank: false,
            margins: '0 0 0 0'
        }, {
            fieldLabel: 'Annotation values (csv)',
            name: 'values',
            allowBlank: false,
            margins: '0 0 0 0'
        }],


        buttons: [{
            text: 'Search',
            formBind: true, //only enabled once the form is valid

            handler: function () {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    artifactStore.setProxy({
                        type: 'ajax',
                        url: '/j2ep-1.0/prov/entities/annotations?' + form.getValues(true),

                        reader: {
                            root: 'entities',
                            totalProperty: 'totalCount'
                        }
                    });
                    artifactStore.data.clear()
                    artifactStore.load()
                }
            }
        }]
    }

);

var searchartifactspane = Ext.create('Ext.window.Window', {
    title: 'Search Data',
    height: 230,
    width: 500,
    layout: 'fit',
    closeAction: 'hide',
    items: [{
        xtype: 'tabpanel',
        items: [
            Ext.create('CF.view.StreamValuesRangeSearch'),
            Ext.create('CF.view.StreamContentMatchSearch'),
            Ext.create('CF.view.AnnotationSearch')

        ]
    }]
})

var filterOnAncestorspane = Ext.create('Ext.window.Window', {
    title: 'Filter Current View',
    height: 230,
    width: 500,
    layout: 'fit',
    closeAction: 'hide',
    items: [{
        xtype: 'tabpanel',
        items: [
            Ext.create('CF.view.FilterOnMeta'),
            Ext.create('CF.view.FilterOnAncestor'),
            Ext.create('CF.view.FilterOnAncestorValuesRange')
        ]
    }]
})


var searchartifacts = Ext.create('Ext.Action', {
    text: 'Search',
    id: 'searchartifacts',
    iconCls: 'icon-add',
    disabled: 'true',
    handler: function () {

        searchartifactspane.show();
    }
});


var filterOnAncestors = Ext.create('Ext.Action', {
    text: 'Filter Current',
    id: 'filtercurrent',
    iconCls: 'icon-add',
    disabled: 'true',
    handler: function () {

        filterOnAncestorspane.show();
    }
});

function renderStream(value, p, record) {
    return Ext.String.format(
        '<div class="search-item" style="border:2px solid; box-shadow: 10px 10px 5px #888888;"><br/>' +
        '<strong>Data ID: {0} </strong> <br/> <br/></strong><hr/>' +
        '<strong>Navigate the Data Derivations Graph:</strong><br/><br/>' +
        '<strong><a href="javascript:wasDerivedFromNewGraph(\'/j2ep-1.0/prov/wasDerivedFrom/{0}?level=' + level + '\')">Backwards</a><br/><br/></strong>' +
        '<strong><a href="javascript:derivedDataNewGraph(\'/j2ep-1.0/prov/derivedData/{0}?level=' + level + '\')">Forward</a><br/><br/><hr/></strong>' +
        '<strong>Generated By :</strong> {1} <br/> <br/>' +
        '<strong>Run Id :</strong> {6} <br/> <br/>' +
        '<strong>Date :</strong>{7}<br/> <br/>' +
        '<strong>Output Files :</strong><a href="javascript:viewData(\'{4}\'.split(\',\'))">Open</a><br/> <br/>' +
        '<strong>Output Metadata:</strong><div style="height:350px;background-color:#6495ed; color:white; border:2px solid; box-shadow: 10px 10px 5px #888888;overflow: auto; width :700px; max-height:100px;"> {5}</div><br/><br/>' +
        '<strong>Parameters :</strong>{2}<br/> <br/>' +
        '<strong>Annotations :</strong>{3}<br/> <br/>' +
        '<strong>Errors:</strong><div style="height:350px;background-color:#6495ed; color:white; border:2px solid; box-shadow: 10px 10px 5px #888888;overflow: auto; width :700px; max-height:100px;"> {8}</div><br/><br/>' +
        '</div>',
        record.data.ID,
        record.data.wasGeneratedBy,
        record.data.parameters,
        record.data.annotations,
        record.data.location,
        record.data.content.substring(0, 1000) + "...",
        record.data.runId,
        record.data.endTime,
        record.data.errors
    );
}

Ext.define('CF.view.ArtifactView', {
    id: 'ArtifactView',
    extend: 'Ext.grid.Panel',
    region: 'south',
    width: '65%',
    height: 300,
    store: artifactStore,
    disableSelection: true,
    hideHeaders: true,
    split: true,
    collapsible: true,
    title: 'Data products',
    alias: 'widget.artifactview',
    requires: [
        'CF.store.ArtifactStore',
        'Ext.grid.plugin.BufferedRenderer'
    ],
    trackOver: true,
    autoScroll: true,
    collapsible: true,
    verticalScroller: {
        xtype: 'paginggridscroller'
    },
    
    viewConfig: {
        enableTextSelection: true
    },
    plugins: [{
        ptype: 'bufferedrenderer',
         
    }],

    columns: [

        {
            dataIndex: 'ID',
            field: 'ID',
            flex: 3,
            renderer: renderStream
        }
    ],

    dockedItems: {
        itemId: 'toolbar',
        xtype: 'toolbar',
        items: [

            searchartifacts,
            filterOnAncestors

        ]
    },

});

Ext.define('CF.view.ResultsPane', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.resultspane'
})



Ext.define('CF.view.provenanceGraphsViewer', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.wasDerivedfrom',


    // configure how to read the XML Data
    region: 'center',
    title: 'Data Derivations Graph',
    split: true,
    collapsible: true,
    require: ['Ext.layout.container.Fit',
        'Ext.toolbar.Paging',
        'Ext.ux.form.SearchField',
        'Ext.ux.DataTip'
    ],
    height: 800,
    autoScroll: true,

    layout: 'fit',

    items: [{
            overflowY: 'auto',
            overflowX: 'auto',

            region: 'center',

            xtype: 'panel',
            html: '<strong>Double Click on the Yellow Dots to expand. Right Click to see the content</strong><center> <div style="width:100%" height="700"><canvas id="viewportprov" width="1200" height="500"></canvas></div></center>'
        }

    ],

    listeners: {
        render: function () {

            $(viewportprov).bind('contextmenu', function (e) {
                var pos = $(this).offset();
                var p = {
                    x: e.pageX - pos.left,
                    y: e.pageY - pos.top
                }
                selected = nearest = dragged = sys.nearest(p);

                if (selected.node !== null) {
                    // dragged.node.tempMass = 10000
                    dragged.node.fixed = true;
                    //   addMeta('/j2ep-1.0/prov/streamchunk/?runid='+currentRun+'&id='+selected.node.name)

                    artifactStore.setProxy({
                        type: 'ajax',
                        url: '/j2ep-1.0/prov/entities/run?runId=' + currentRun + '&dataId=' + selected.node.name,

                        reader: {
                            root: 'entities',
                            totalProperty: 'totalCount'
                        }



                    });
                    artifactStore.data.clear()
                    artifactStore.load()

                }
                return false;
            })


            $(viewportprov).bind('dblclick', function (e) {
                var pos = $(this).offset();
                var p = {
                    x: e.pageX - pos.left,
                    y: e.pageY - pos.top
                }
                selected = nearest = dragged = sys.nearest(p);

                if (selected.node !== null) {
                    // dragged.node.tempMass = 10000
                    dragged.node.fixed = true;
                    if (graphMode == "WASDERIVEDFROM")
                        wasDerivedFromAddBranch('/j2ep-1.0/prov/wasDerivedFrom/' + selected.node.name + "?level=" + level)

                    if (graphMode == "DERIVEDDATA")
                        derivedDataAddBranch('/j2ep-1.0/prov/derivedData/' + selected.node.name + "?level=" + level)


                }
                return false;
            })
            sys.renderer = Renderer("#viewportprov");
            //		
        }
    }
});
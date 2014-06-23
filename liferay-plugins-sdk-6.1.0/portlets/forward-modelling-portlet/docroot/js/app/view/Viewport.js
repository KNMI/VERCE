/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */

var eventsTabPanel = Ext.create('Ext.TabPanel', {
  region: 'center',
  border: false,
  layout: {
    type: 'vbox',
    align: 'stretch'
  },
  requires: ['CF.view.EventSearchByFile', 'CF.view.EventSearch'],
  items: [{
    xtype: 'panel',
    title: 'FDSN',
    border: false,
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    items: [
      Ext.create('CF.view.EventSearch')
    ]
  }, {
    xtype: 'panel',
    title: 'File',
    border: false,
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    items: [
      Ext.create('CF.view.EventSearchByFile')
    ]
  }]
});

var stationsTabPanel = Ext.create('Ext.TabPanel', {
  border: false,
  layout: {
    type: 'vbox',
    align: 'stretch'
  },
  requires: ['CF.view.StationSearchByFile', 'CF.view.StationSearch'],
  items: [{
    xtype: 'panel',
    title: 'FDSN',
    border: false,
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    items: [
      Ext.create('CF.view.StationSearch')
    ]
  }, {
    xtype: 'panel',
    title: 'File',
    border: false,
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    items: [
      Ext.create('CF.view.StationSearchByFile')
    ]
  }]
});

Ext.define('CF.view.Viewport', {
  extend: 'Ext.Viewport',
  layout: 'fit',
  requires: [
    'Ext.layout.container.Border',
    'Ext.resizer.Splitter',
    'CF.view.Commons',
    'CF.view.ResultsPane',
    'CF.view.Control',
    'CF.view.Map'
  ],

  initComponent: function() {
    var me = this;

    Ext.apply(me, {
      id: 'viewport',
      items: [{
        xtype: 'tabpanel',
        border: 'false',
        layout: 'border',
        defaults: {
          split: true
        },
        items: [{
          title: 'Setup',
          xtype: 'panel',
          border: 'false',
          layout: 'border',
          defaults: {
            split: true
          },
          items: [{
              xtype: 'cf_mappanel'
            }, {
              xtype: 'tabpanel', // Search & Upload
              region: 'center',
              border: false,
              id: 'tabpanel_principal',
              name: 'tabpanel_principal',
              layout: {
                type: 'vbox',
                align: 'stretch'
              },
              items: [{
                xtype: 'panel',
                title: 'Solver',
                border: false,
                layout: {
                  type: 'vbox',
                  align: 'stretch'
                },
                items: [
                  Ext.create('CF.view.SolverSelect'),
                  Ext.create('CF.view.dataviews.SolverConf')
                ]
              }, {
                xtype: 'panel',
                title: 'Earthquakes',
                id: 'earthquakes',
                name: 'earthquakes',
                border: false,
                disabled: true,
                layout: {
                  type: 'vbox',
                  align: 'stretch'
                },
                items: [
                  eventsTabPanel,
                  Ext.create('CF.view.dataviews.EventGrid')
                ]
              }, {
                xtype: 'panel',
                title: 'Stations',
                id: 'stations',
                name: 'stations',
                disabled: true,
                border: false,
                layout: {
                  type: 'vbox',
                  align: 'stretch'
                },
                items: [
                  stationsTabPanel,
                  Ext.create('CF.view.dataviews.StationGrid')
                ]
              }, {
                xtype: 'panel',
                title: 'Submit',
                id: 'submit',
                disabled: true,
                border: false,
                layout: {
                  type: 'vbox',
                  align: 'stretch'
                },
                items: [
                  Ext.create('CF.view.Submit')
                ]
              }, {
                xtype: 'panel',
                title: 'Control',
                border: false,
                layout: 'fit',
                items: [Ext.create('CF.view.Control')]
              }],
              listeners: {
                'tabchange': function(tabPanel, tab) {
                  if (tab.id == "submit") updateSubmitOverview();
                }
              }
            }

          ]
        }, {
          xtype: 'panel', // Earthquake & Station & Common
          title: 'Results',
          region: 'center',
          border: false,
          autoScroll: true,
          layout: {
            type: 'border',
            padding: 5
          },
          defaults: {
            split: true
          },
          items: [Ext.create('CF.view.ActivityMonitor'), {
              region: 'center',
              layout: 'border',
              border: false,
              autoScroll: true,
              items: [

                Ext.create('CF.view.provenanceGraphsViewer')

                ,
                Ext.create('CF.view.ArtifactView')
              ]
            }


          ]
        }, {
          xtype: 'panel',
          title: 'iRods',
          region: 'center',
          border: false,
          autoScroll: true,
          layout: 'border',
          defaults: {},
          items: [{
            xtype: "component",
            autoEl: {
              tag: "iframe",
              seamless: "seamless",
              // TODO real url
              src: ((navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) ? "/j2ep-1.0/dir-irods/" : "http://dir-irods.epcc.ed.ac.uk/") + "irodsweb/browse.php?ruri=" + (userSN ? userSN + "@" : "") + "dir-irods.epcc.ed.ac.uk%3A1247/UEDINZone/home/" + (userSN ? userSN + "/verce" : "")
            },
            region: 'center',
            border: false
          }]
        }]

      }]

    });

    me.callParent(arguments);
  }
});

selectedFile = "";

function updateSubmitOverview() {
  $("div#submit_overview div#solver").html(gl_solver);
  $("div#submit_overview div#mesh").html(gl_mesh);
  $("div#submit_overview div#velmodel").html(gl_velmod);

  var sEventUrl = gl_eventUrl;
  if (sEventUrl.indexOf('documents') < 0) sEventUrl = portalUrl + sEventUrl;
  var linkToUrl = "<a href='" + sEventUrl + "' target='_blank'>" + sEventUrl + "</a>";
  $("div#submit_overview div#eurl").html(linkToUrl);
  var sStationUrl = gl_stationUrl;
  if (sStationUrl.indexOf('documents') < 0) sStationUrl = portalUrl + sStationUrl;
  linkToUrl = "<a href='" + sStationUrl + "' target='_blank'>" + sStationUrl + "</a>";
  $("div#submit_overview div#surl").html(linkToUrl);

  var selectedStations = Ext.getCmp('gridStations').getSelectionModel().selected;
  var sStations = "";
  selectedStations.each(function(item, ind, l) {
    if (ind > 0) sStations += ', ';
    sStations += '"' + item.get('network') + '.' + item.get('station') + '"';
  });
  $("div#submit_overview div#ssel").html(sStations);

  var selectedEvents = Ext.getCmp('gridEvents').getSelectionModel().selected;
  var sEvents = "";
  selectedEvents.each(function(item, ind, l) {
    if (ind > 0) sEvents += ', ';
    sEvents += '"' + item.get('eventId') + '"';
  });
  $("div#submit_overview div#esel").html(sEvents);

}

function fileSelection(filetype) {
  Ext.Ajax.request({
    url: getFileListURL,
    params: {
      userSN: userSN, //user screen name, it is populated in html/init.jsp
      filetype: filetype
    },
    success: function(response) {
      showFileSelector(response.responseText, filetype);
    }
  });
}

function showFileSelector(htmlFileList, filetype) {
  win = Ext.widget('window', {
    title: 'Select existing file',
    closeAction: 'hide',
    width: 300,
    height: 350,
    layout: 'fit',
    modal: true,
    autoScroll: true,
    resizable: false,
    html: htmlFileList,
    buttons: [{
      text: 'Cancel',
      handler: function() {
        selectedFile = "";
        this.up('window').hide();
      }
    }, {
      text: 'Select',
      handler: function() {
        parseSelectedFile(this.up('window'), filetype);
      }
    }]
  });
  win.show();
}

function parseSelectedFile(win, filetype) {
  if (selectedFile === "") {
    Ext.Msg.alert("Alert!", "Please, select a file by clicking on it");
  } else {
    if (filetype === EVENT_TYPE) getEvents(ctrl, selectedFile);
    if (filetype === STXML_TYPE || filetype === STPOINTS_TYPE)
      getStations(ctrl, selectedFile, filetype);
    selectedFile = "";
    win.hide();
  }
}

function selectFile(e) {
  $("li").css('background-color', '');
  selectedFile = e.getAttribute('filePath');
  $(e).css('background-color', '#CED9E7');
}
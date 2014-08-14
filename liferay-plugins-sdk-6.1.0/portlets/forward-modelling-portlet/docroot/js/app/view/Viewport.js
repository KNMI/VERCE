/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */

Ext.define('CF.view.Viewport', {
  extend: 'Ext.Viewport',
  layout: 'fit',
  requires: [
    'Ext.layout.container.Border',
    'Ext.resizer.Splitter',
    'CF.view.Commons',
    'CF.view.Map',
    'CF.view.SolverSelect',
    'CF.view.dataviews.SolverConf',
    'CF.view.EventsTabPanel',
    'CF.view.dataviews.EventGrid',
    'CF.view.StationsTabPanel',
    'CF.view.dataviews.StationGrid',
    'CF.view.Submit',
    'CF.view.Control',
    'CF.view.ResultsPane',
  ],

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
          deferredRender: false,
          items: [{
            xtype: 'panel',
            title: 'Solver',
            border: false,
            layout: {
              type: 'vbox',
              align: 'stretch'
            },
            items: [{
              xtype: 'solverselect'
            }, {
              xtype: 'solverconf'
            }]
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
            items: [{
              xtype: 'eventstabpanel'
            }, {
              xtype: 'eventgrid'
            }]
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
            items: [{
              xtype: 'stationstabpanel'
            }, {
              xtype: 'stationgrid'
            }]
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
            items: [{
              xtype: 'submit'
            }]
          }, {
            xtype: 'panel',
            title: 'Control',
            border: false,
            layout: 'fit',
            items: [{
              xtype: 'control'
            }]
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
      items: [{
        xtype: 'activitymonitor',
        region: 'west',
        border: false,
        autoScroll: true,
      }, {
        xtype: 'panel',
        layout: 'border',
        region: 'center',
        border: false,
        autoScroll: true,
        items: [{
          xtype: 'provenancegraphsviewer'
        }, {
          xtype: 'artifactview'
        }]
      }]
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
          src: ((navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) ? "/j2ep-1.0/dir-irods/" : "http://dir-irods.epcc.ed.ac.uk/") + "irodsweb/browse.php?ruri=" + (userSN ? userSN + "@" : "") + "dir-irods.epcc.ed.ac.uk%3A1247/UEDINZone/home/" + (userSN ? userSN + "/verce" : "")
        },
        region: 'center',
        border: false
      }]
    }]

  }],
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

  var selectedStations = Ext.getCmp('stationgrid').getSelectionModel().selected;
  var sStations = "";
  selectedStations.each(function(item, ind, l) {
    if (ind > 0) sStations += ', ';
    sStations += '"' + item.get('network') + '.' + item.get('station') + '"';
  });
  $("div#submit_overview div#ssel").html(sStations);

  var selectedEvents = Ext.getCmp('eventgrid').getSelectionModel().selected;
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
  var controller = CF.app.getController('Map');
  if (selectedFile === "") {
    Ext.Msg.alert("Alert!", "Please, select a file by clicking on it");
  } else {
    if (filetype === EVENT_TYPE) controller.getEvents(controller, selectedFile);
    if (filetype === STXML_TYPE || filetype === STPOINTS_TYPE)
      controller.getStations(controller, selectedFile, filetype);
    selectedFile = "";
    win.hide();
  }
}

function selectFile(e) {
  $("li").css('background-color', '');
  selectedFile = e.getAttribute('filePath');
  $(e).css('background-color', '#CED9E7');
}
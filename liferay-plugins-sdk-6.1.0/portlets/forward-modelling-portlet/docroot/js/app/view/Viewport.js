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
    'CF.view.Misfit',
    'CF.view.Simulation',
    'CF.view.Download',
    'CF.view.Processing'
  ],

  id: 'viewport',
  items: [{
    xtype: 'tabpanel',
    id: 'viewport_tabpanel',
    border: false,
    layout: 'border',
    defaults: {
      split: true
    },
    items: [{
      xtype: 'simulation_panel',
      title: 'Simulation',
      id: 'simulationtab',
      border: false,
    }, {
      xtype: 'download_panel',
      title: 'Download',
      id: 'downloadtab',
      border: false,
    }, {
      xtype: 'processing_panel',
      title: 'Processing',
      id: 'processingtab',
      border: false,
    }, {
      xtype: 'misfit_panel',
      title: 'Misfit',
      id: 'misfittab',
      border: false,
    }, {
      xtype: 'panel', // Earthquake & Station & Common
      id: 'resultstab',
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
    }]

  }],
});

selectedFile = "";

function updateSubmitOverview() {
  $("div#submit_overview div#solver").html(Ext.getCmp('solvertype').getValue());
  $("div#submit_overview div#mesh").html(Ext.getCmp('meshes').getValue());
  $("div#submit_overview div#velmodel").html(Ext.getCmp('velocity').getValue());

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

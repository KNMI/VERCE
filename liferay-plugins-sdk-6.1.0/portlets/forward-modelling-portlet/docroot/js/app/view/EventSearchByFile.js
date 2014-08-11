Ext.require([
  'Ext.form.field.File'
]);

var form2 = Ext.create('Ext.form.Panel', {
  width: 500,
  frame: false,
  border: false,
  bodyPadding: '10 10 10 10',

  defaults: {
    anchor: '100%',
    allowBlank: false,
    msgTarget: 'side',
    labelWidth: 50
  },

  items: [{
    xtype: 'textfield',
    id: 'event-file-name',
    name: 'name',
    value: 'DefaultName',
    fieldLabel: 'Name'
  }, {
    xtype: 'filefield',
    id: 'event-form-file',
    emptyText: 'Select a file',
    fieldLabel: 'File',
    name: 'form-file',
    buttonText: 'Browse...'
  }, {
    xtype: 'hidden',
    id: 'event-filetype',
    name: 'filetype',
    value: EVENT_TYPE
  }],

  buttons: [{
    text: 'Upload',
    handler: function() {

      var form = this.up('form').getForm();
      if (form.isValid()) {
        var n = form.getValues()['name'];
        if (n.indexOf(" ") < 0) {
          form.submit({
            url: uploadFileURL,
            waitMsg: 'Uploading your file...',
            success: function(fp, o) {
              var controller = CF.app.getController('Map');
              controller.getEvents(controller, o.result.path);
            },
            failure: function(formPanel, action) {
              var data = Ext.decode(action.response.responseText);
              Ext.Msg.alert("Error!", "Was not possible to upload the file. [" + data.msg + "]");
            }
          });
        } else {
          Ext.Msg.alert("Alert!", "The name cannot contain blankspaces");
        }
      }
    }
  }]
});

var openMenuEvents = [];
//openMenuEvents.push("->");
openMenuEvents.push(Ext.create('Ext.button.Button', {
  text: 'Open',
  handler: function() {
    fileSelection(EVENT_TYPE); //declared in Viewport.js
  }
}));

Ext.define('CF.view.EventSearchByFile', {
  extend: 'Ext.form.Panel',
  dockedItems: [{
    xtype: 'toolbar',
    dock: 'top',
    items: openMenuEvents,
    style: {
      border: 0,
      padding: 0
    }
  }],
  items: [form2]
});
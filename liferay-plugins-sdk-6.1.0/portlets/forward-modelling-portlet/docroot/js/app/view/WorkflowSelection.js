Ext.define('CF.view.WorkflowSelection', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.workflowselection',
  requires: [
    'CF.store.Workflow',
    'Ext.grid.plugin.BufferedRenderer'
  ],

  width: 780,
  disableSelection: true,

  autoHeight: true,

  store: Ext.data.StoreManager.lookup('provWorkflowStore'),

  border: false,

  loadMask: true,

  columns: [{
      xtype: 'rownumberer',

      sortable: false
    }, {
      header: 'Run ID',
      dataIndex: 'runId',
      flex: 5,
      sortable: false
    }, {
      header: 'Workflow Name',
      dataIndex: 'workflowName',
      flex: 3,
      sortable: false,
      groupable: false
    }, {
      header: 'Description - Click to Edit',
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
    {
      xtype: 'actioncolumn',
      width: 40,
      tdCls: 'Delete',
      items: [{
        icon: localResourcesPath + '/img/delete-icon.png', // Use a URL in the icon config
        tooltip: 'Delete',
        handler: function(grid, rowIndex, colIndex) {
          var rec = grid.getStore().getAt(rowIndex);

          var storeClassName = Ext.getClassName(grid.getStore());
          var tempStore = Ext.create(storeClassName, {
            buffered: false
          });
          tempStore.add(rec);
          var xx = tempStore.getAt(0)
          messagebox = Ext.Msg.confirm('Remove Run', 'Are you sure?', function(button) {
            if (button == 'yes') {
              var tempx = tempStore.getProxy();
              tempx.api.destroy = PROV_SERVICE_BASEURL + "workflow/delete/" + xx.get("runId");

              tempStore.remove(xx);

              tempStore.sync({
                success: function(args) {
                  Ext.Ajax.request({
                    url: deleteWorkflowURL,
                    params: {
                      "workflowId": xx.get('systemId')
                    },
                    success: function(response) {
                      Ext.Msg.alert("Completed", "Data for Run ID " + xx.get("runId") + " has been successfully removed")
                    },
                    failure: function(response) {
                      Ext.Msg.alert("Error", "Error deleting workflow information from gUSE")
                    }
                  })
                  //PHPSESSID=vsb9rpreoten67g945pghhtde6

                  Ext.util.Cookies.set('PHPSESSID', "1t1vt2c50oilnm21q9072gdbp6")


                  Ext.Ajax.request({
                    url: deleteWorkflowDataURL,
                    method: "POST",
                    withCredentials: true,
                    useDefaultXhrHeader: false,
                    params: {
                      "ruri": IRODS_URI,
                      "dirs[]": xx.get("runId")

                    },
                    success: function(response) {
                      wfStore.load();
                    },
                    failure: function(response) {


                      Ext.Msg.alert("Error", "Error deleting data for Run ID " + xx.get("runId"))

                    }
                  })

                  // workflowStore.data.clear()
                  workflowStore.load()


                },

                faliure: function(args) {

                  Ext.Msg.alert("Error", "Delete failed!");

                }

              })



            }
          })
          messagebox.zIndexManager.bringToFront(messagebox);



        }



      }]
    }
  ],
  flex: 1,
  selType: 'cellmodel',
  plugins: [
    Ext.create('Ext.grid.plugin.CellEditing', {
      clicksToEdit: 1,
      listeners: {
        'validateedit': function(c, e, eOpts) {
          var r = e.rowIdx;
          var sr = workflowStore.getAt(r);

          sr.set(e.field, e.value);

          workflowStore.load()
        }
      }
    })
  ],

  /*   verticalScroller: {
        xtype: 'paginggridscroller'
    },*/



  /* plugins: [{
        ptype: 'bufferedrenderer'
    }],*/


  /* selModel: {
        pruneRemoved: false
    },
*/
  initComponent: function() {
    this.callParent(arguments);
  },

  viewConfig: {
    enableTextSelection: true,
    listeners: {

      itemclick: function(dv, record, item, index, e) {
        workflowStore.sync()
      },
      itemdblclick: function(dataview, record, item, index, e) {

        activityStore.setProxy({
          type: 'ajax',
          url: PROV_SERVICE_BASEURL + 'activities/' + encodeURIComponent(record.get("runId")),
          reader: {
            rootProperty: 'activities',
            totalProperty: 'totalCount'
          },
          simpleSortMode: true

        });
        sys.prune();
        artifactStore.data.clear();
        activityStore.data.clear();
        activityStore.load({
          callback: function() {
            currentRun = record.get("runId")
            Ext.getCmp('filtercurrent').enable();
            Ext.getCmp('searchartifacts').enable();
            Ext.getCmp('downloadscript').enable();




          }

        })

        activityStore.on('load', onStoreLoad, this, {
          single: true
        });
        currentRun = record.get("runId")
        owner = userSN

      }




    }
  }


});
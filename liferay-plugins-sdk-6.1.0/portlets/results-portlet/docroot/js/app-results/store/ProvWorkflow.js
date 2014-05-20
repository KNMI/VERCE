/**
 * The store used for summits
 */
Ext.define('RS.store.ProvWorkflow', {
  extend: 'Ext.data.Store',
  restful: true,
  requires: [
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.grid.plugin.BufferedRenderer',
    'RS.model.ProvWorkflow'
  ],

  model: 'RS.model.ProvWorkflow',
  alias: 'store.prvworkflow',
  storeId: 'provWorkflowStore',

  // allow the grid to interact with the paging scroller by buffering
  trailingBufferZone: 60,
  buffered: true,
  leadingBufferZone: 10,
  pageSize: 1000,


  proxy: {
    type: 'ajax',
    actionMethods: {
      read: 'GET',
      update: 'POST',
      destroy: 'POST'
    },

    api: {
      read: PROV_SERVICE_BASEURL + 'workflow/user/' + userSN,
      update: PROV_SERVICE_BASEURL + 'workflow',
      destroy: PROV_SERVICE_BASEURL + 'workflow/delete/'
    },

    reader: {
      root: 'runIds',
      totalProperty: 'totalCount'
    },
    simpleSortMode: true

  },




  listeners: {


    update: {
      fn: function(s, r, o) {

        Ext.Ajax.request({
          method: 'POST',
          url: PROV_SERVICE_BASEURL + 'workflow/edit/' + r.get('runId'),
          params: {
            "doc": '{ "description":"' + r.get('description') + '"}'
          },

          failure: function(response) {

            alert("Workflow Run update failed")


          },

          success: function(response) {

            Ext.Ajax.request({
              url: updateWorkflowDescriptionURL,
              params: {
                "workflowId": r.get('runId'),
                "newText": r.get('description')
              },
              success: function(response) {

                wfStore.load();
              }
            });


          }


        });

      }


    },
    destroy: {
      fn: function(s, r, o) {

        Ext.Ajax.request({
          method: 'POST',
          url: PROV_SERVICE_BASEURL + 'workflow/delete/' + r.get('runId'),


          failure: function(response) {

            alert("Workflow Run delete failed")


          },

          success: function(response) {




          }


        });

      }


    }

  }




});
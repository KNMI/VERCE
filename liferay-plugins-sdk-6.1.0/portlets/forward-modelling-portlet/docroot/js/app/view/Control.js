
var text = "<div style='padding-left: 15px;'><br>" +
		"<a href='file-manager' target='_blank'>" +
		"Access the Document Library  (opens in a new window)</a>" +
		"<br><br></div>";

var wfStore = Ext.create('Ext.data.ArrayStore', {
    fields: [
       {name: 'name'},
       {name: 'status'},
       {name: 'date', type: 'date', dateFormat: 'Y-m-d'},
       {name: 'date2'}
    ],
    sortOnLoad: true, 
    sorters: { property: 'date2', direction : 'DESC' },
    //data: wfList
    proxy: {
	         type: 'ajax',
	          url: getWorkflowListURL,
	          reader: {
		             root: 'list'
		          }
		   },
		   autoLoad: true
});

wfStore.load(function() {
		console.log(arguments);
});

var wfGrid = Ext.create('Ext.grid.Panel', {
    store: wfStore,
    id: 'wfGrid',
    columns: [
        {
            text     : 'Name',
            flex     : 1,
            sortable : true,
            dataIndex: 'name'
        },
        {
            text     : 'Status',
            width    : 75,
            sortable : true,
            renderer : statusRenderer,
            dataIndex: 'status'
        },
        {
            text     : 'Date',
            width    : 90,
            sortable : true,
            renderer : Ext.util.Format.dateRenderer('d - m - Y'),
            dataIndex: 'date'
        },
        {
            xtype: 'actioncolumn',
            width: 50,
            items: [
            {
                icon   : localResourcesPath+'/img/download-icon.png', 
                tooltip: 'Download results',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = wfStore.getAt(rowIndex);
                    alert("Download results " + rec.get('name'));
                }
            },
            {
                icon   : localResourcesPath+'/img/delete-icon.png',
                tooltip: 'Delete instance',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = wfStore.getAt(rowIndex);
                    Ext.Msg.confirm('Alert!', 'Are you sure that you want to delete the workflow '+rec.get('name')+"?", 
      	                  function(btn) {
      	                  	if(btn === 'yes')
      	                  	{	
	      	                  	Ext.Ajax.request({
	      	      	    			url: deleteWorkflowURL,
	      	      	    			params: {
	      	      	    				"workflowId": rec.get('name')
	      	      	    			},
	      	      	    			success: function(response){
	      	      	    				wfStore.load();
	      	      	    			},
	      	      	    			failure: function(response) {
	      	      	    				Ext.Msg.alert("Error", "Delete failed!");
	      	      	                }
	      	                    });
      	                  	}
      	            });
                }
            }
            ]
        }
    ],
    title: 'Submited workflows'
});

//TODO: the scroll in the list does not work
Ext.define('CF.view.Control', {
	  extend:'Ext.form.Panel',
	  alias: 'widget.mypanel',
	  items: 
		    [
		     	{
			       xtype: 'panel',
			       html:text
				},
				{
			       xtype: 'panel',
			       layout: 'fit',
			       autoScroll: true,
			       items: [wfGrid]
				}
			]
	});

function statusRenderer(val) {
    if (val === 'INIT') {
        return '<span style="color:green;">' + val + '</span>';
    } 
    else if (val === 'ERROR') {
        return '<span style="color:red;">' + val + '</span>';
    }
    return val;
}


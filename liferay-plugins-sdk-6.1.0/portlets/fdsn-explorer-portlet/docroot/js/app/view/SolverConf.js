

solverConfStore = Ext.create('CF.store.SolverConfStore');



Ext.define('CF.view.SolverConf', {
     extend:'Ext.grid.Panel',
     alias: 'widget.solvergrid',
     id:"SolverConfPanel",
    
     requires: [
    	 
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Number'
    ],
     store: solverConfStore,
     initComponent: function() {
     	var me=this;
     	 
    	 
        Ext.apply(this, {
            border: false,
             
    		columns: [
      					 {header: 'Name',  dataIndex: 'name'},
   					     {header: 'Value', dataIndex: 'value', flex:1, 
  				          field:{
  					              xtype:'textfield',
  					              allowBlank:true
  						          }
						        },
						       {header: 'Required', dataIndex: 'req'},
 						       {header: 'Description', dataIndex: 'desc'}
					    ],
		    selType: 'cellmodel',
		    plugins: [
 				       Ext.create('Ext.grid.plugin.CellEditing', {
			            clicksToEdit: 1
				        })
  					  ]
				}
			);
			 this.callParent(arguments);
			
	}
	
}
);

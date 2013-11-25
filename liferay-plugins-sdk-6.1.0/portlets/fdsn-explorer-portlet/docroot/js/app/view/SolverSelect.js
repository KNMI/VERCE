







 var solvers = [
        {"abbr":"seissol","name":"seisol"},
        {"abbr":"specfem","name":"specfem"},
       
        
    ];

Ext.regModel('SolversCombo', {
    fields: [
        {type: 'string', name: 'abbr'},
        {type: 'string', name: 'name'}
        
    ]
});

	




// The data store holding the solvers
var solverstore = Ext.create('Ext.data.Store', {
    model: 'SolversCombo',
    data: solvers
});





// ComboBox with multiple selection enabled
var solvercombo = Ext.create('Ext.form.field.ComboBox', {
    fieldLabel: 'Solvers',
    name: 'name',
    displayField: 'abbr',
    width: 300,
    labelWidth: 130,
    colspan: 3,
    store: solverstore,
    queryMode: 'local',
    getInnerTpl: function() {
        return '<div data-qtip="{abbr}">{abbr} {name}</div>';
    },
    
    listeners:{
         scope: this,
         'change': function(combo)
         	{   
         		solverConfStore=Ext.data.StoreManager.lookup('solverConfStore');
         		solverConfStore.setProxy({
 						           type : 'ajax',
  							       url : '../js/solvers/'+combo.getValue()+'.json',

 					               reader : {
							                type : 'json',
 							                root : 'fields'
   								         }
    					});
         		solverConfStore.load()
    					
    		}
    	   	/*); 
    	   	solverConfStore.load({
						    
   							    callback: function(records, operation, success) {
   							    
   							    
									alert("loaded")   					
								},
						    scope: this
						});
    	   	*/
    	    
		}

}
);


Ext.define('CF.view.SolverSelect', {
     extend:'Ext.form.Panel',
     alias: 'widget.solverselect',
    
    // configure how to read the XML Data
   
    layout: {
            type: 'table',
            columns: 3
        },
    defaultType:'numberfield',
    items: [solvercombo]
     
});

    





    

/*
 * The Model
 */
Ext.define('CF.model.Solver', {
    extend: 'Ext.data.Model',
  fields : [
            {name: 'xtype', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'desc', type: 'string'},
            {name: 'value', type: 'string'},
            {name: 'req', type: 'string'}
       	]
});

/**
 * The store used for summits
 */
Ext.define('CF.store.SolverConfStore', {
	extend:'Ext.data.Store',
   	requires:['CF.model.Solver'],
   	model:   'CF.model.Solver',
   	alias: 'store.solverstore',
   	storeId: 'solverConfStore'
});
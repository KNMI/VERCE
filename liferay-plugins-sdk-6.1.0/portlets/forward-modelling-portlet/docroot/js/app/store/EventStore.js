 
 Ext.define('CF.model.Event', {
    extend: 'Ext.data.Model',
 
  fields : [
  		    {
            name: 'symbolizer',
            convert: function(v, r) {
                return r.raw.layer.styleMap.createSymbolizer(r.raw, 'default');
            	}
        	},
        	{name: 'eventId', type: 'string' , mapping:'eventId'}, // custom mapping
            {name: 'description', type: 'string', mapping:'description'},
            {name: 'date', type: 'string', mapping:'datetime'},
            {name: 'depth', type: 'string', mapping:'depth'},
            {name: 'magnitude', type: 'string', mapping:'magnitude'},
            {name: 'latitude', type: 'string' , mapping:'latitude'}, // custom mapping
            {name: 'longitude', type: 'string' , mapping:'longitude'}, // custom mapping
            {name: 'tensor_mrr', type: 'string' , mapping:'tensor_mrr'}, // custom mapping
            {name: 'tensor_mtt', type: 'string' , mapping:'tensor_mtt'}, // custom mapping
            {name: 'tensor_mpp', type: 'string' , mapping:'tensor_mpp'}, // custom mapping
            {name: 'tensor_mrt', type: 'string' , mapping:'tensor_mrt'}, // custom mapping
            {name: 'tensor_mrp', type: 'string' , mapping:'tensor_mrp'}, // custom mapping            
        	{name: 'tensor_mtp', type: 'string' , mapping:'tensor_mtp'}
        	], 
});
 
Ext.define('CF.store.EventStore', {extend:'GeoExt.data.FeatureStore',
				 // requires:['CF.model.Station','CF.model.Network'],
				  model:   'CF.model.Event',
				  alias: 'store.eventstore',
				  storeId: 'eventStore'
				});



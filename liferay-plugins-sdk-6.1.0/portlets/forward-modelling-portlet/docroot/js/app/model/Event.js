 Ext.define('CF.model.Event', {
   extend: 'Ext.data.Model',

   fields: [{
     name: 'symbolizer',
     type: 'string',
     convert: function(v, r) {
       height=15 + Number(r.data.magnitude);
       width=15 + Number(r.data.magnitude);
       return '<img src="/forward-modelling-portlet/img/earthquake.png" height="'+height +'" width="'+width+'">';
     }
     /*convert: function(v, r) {
       return r.data.layer.styleMap.createSymbolizer(r.data, r.data.layer.styleMap.styles[r.data.renderIntent]);
     },*/
   }, {
     name: 'eventId',
     type: 'string',
     mapping: 'data.eventId'
   }, {
     name: 'description',
     type: 'string',
     mapping: 'data.description'
   }, {
     name: 'date',
     type: 'string',
     mapping: 'data.date'
   }, {
     name: 'depth',
     type: 'string',
     mapping: 'data.depth'
   }, {
     name: 'magnitude',
     type: 'string',
     mapping: 'data.magnitude'
   }, {
     name: 'latitude',
     type: 'string',
     mapping: 'data.latitude'
   }, {
     name: 'longitude',
     type: 'string',
     mapping: 'data.longitude'
   }, {
     name: 'tensor_mrr',
     type: 'string',
     mapping: 'data.tensor_mrr'
   }, {
     name: 'tensor_mtt',
     type: 'string',
     mapping: 'data.tensor_mtt'
   }, {
     name: 'tensor_mpp',
     type: 'string',
     mapping: 'data.tensor_mpp'
   }, {
     name: 'tensor_mrt',
     type: 'string',
     mapping: 'data.tensor_mrt'
   }, {
     name: 'tensor_mrp',
     type: 'string',
     mapping: 'data.tensor_mrp'
   }, {
     name: 'tensor_mtp',
     type: 'string',
     mapping: 'data.tensor_mtp'
   }]
 });
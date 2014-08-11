Ext.define('CF.model.Station', {
  extend: 'Ext.data.Model',

  fields: [{
      name: 'symbolizer',
      convert: function(v, r) {
        return r.data.layer.styleMap.createSymbolizer(r.data, r.data.layer.styleMap.styles[r.data.renderIntent]);
      },
    }, {
      name: 'station',
      type: 'string',
      mapping: 'data.station'
    }, {
      name: 'network',
      type: 'string',
      mapping: 'data.network'
    }, {
      name: 'network.station',
      type: 'string',
      calculate: function(data) {
        return data.network + '.' + data.station;
      }
    }, {
      name: 'latitude',
      type: 'string',
      mapping: 'data.latitude'
    }, // custom mapping
    {
      name: 'longitude',
      type: 'string',
      mapping: 'data.longitude'
    }, // custom mapping
    {
      name: 'elevation',
      type: 'string',
      mapping: 'data.elevation'
    } // custom mapping
  ]

});
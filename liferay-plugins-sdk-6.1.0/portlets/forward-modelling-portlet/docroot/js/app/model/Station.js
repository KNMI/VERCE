Ext.define('CF.model.Station', {
  extend: 'Ext.data.Model',

  fields: [{
      name: 'symbolizer',
      defaultValue: 'default'
    }, {
      name: 'station',
      type: 'string',
      mapping: 'station'
    }, {
      name: 'network',
      type: 'string',
      mapping: 'network'
    }, {
      name: 'latitude',
      type: 'string',
      mapping: 'latitude'
    }, // custom mapping
    {
      name: 'longitude',
      type: 'string',
      mapping: 'longitude'
    }, // custom mapping
    {
      name: 'elevation',
      type: 'string',
      mapping: 'elevation'
    } // custom mapping
  ]

});
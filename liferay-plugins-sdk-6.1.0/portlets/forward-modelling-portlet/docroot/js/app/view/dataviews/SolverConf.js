Ext.define('CF.view.dataviews.SolverConf', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.solverconf',
  id: "SolverConfPanel",
  autoScroll: true,
  disabled: true,
  requires: [
    'Ext.grid.plugin.CellEditing',
    'Ext.form.field.Number',
    'CF.view.Component'
  ],
  border: false,
  columns: [{
    header: 'Name',
    dataIndex: 'name'
  }, {
    header: 'Value',
    dataIndex: 'value',
    xtype: 'componentcolumn',
    renderer: function(value, meta, record) {
      var change = function(component, newValue, oldValue, options) {
        record.set('value', newValue, {
          // prevent breaking focus on the field
          silent: true
        });
      };

      if (record.get('type') === 'bool') {
        if (value === true || value === 'true' || value === 1 || value === '1' || value === 'on') {
          value = true;
        } else {
          value = false;
        }
        return {
          checked: value,
          xtype: 'checkbox',
          listeners: {
            change: change,
          },
          disabled: !record.get('editable')
        }
      } else if (record.get('type') === 'int') {
        return {
          value: value,
          xtype: 'numberfield',
          allowDecimals: false,
          step: record.get('step'),
          listeners: {
            change: change,
          },
          minValue: record.get('minValue'),
          maxValue: record.get('maxValue'),
          disabled: !record.get('editable')
        }
      } else if (record.get('type') === 'float') {
        return {
          value: value,
          xtype: 'numberfield',
          allowDecimals: true,
          allowExponential: true,
          decimalPrecision: 3,
          step: record.get('step'),
          listeners: {
            change: change,
          },
          minValue: record.get('minValue'),
          maxValue: record.get('maxValue'),
          disabled: !record.get('editable')
        }
      } else if (record.get('type') === 'option') {
        var options = record.get('options');
        options.forEach(function(option) {
          if (option[0] === value) {
            value = option;
            return;
          }
        });
        return {
          value: value,
          store: options,
          queryMode: 'local',
          xtype: 'combobox',
          listeners: {
            change: change,
          },
          disabled: !record.get('editable')
        }
      } else {
        return {
          value: value,
          xtype: 'textfield',
          listeners: {
            change: change,
          },
          disabled: !record.get('editable')
        }
      }
    }
  }, {
    flex: 1,
    header: 'Description',
    dataIndex: 'desc'
  }],
  flex: 1,
  selType: 'cellmodel',
  features: [{
    id: 'grouping',
    ftype: 'grouping',
    startCollapsed: true
  }],
  initComponent: function() {
    this.store = CF.app.getController('Map').getStore('SolverConf');
    this.callParent(arguments);
  }
});
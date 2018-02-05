var modes = [{
  "mode": "OR"
}, {
  "mode": "AND"
}]

var modeStore = Ext.define('RS.store.ModeStore', {
  extend: 'Ext.data.Store',
  model: 'RS.model.Mode',
  data: modes
});
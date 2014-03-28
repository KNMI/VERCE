Ext.define('CF.view.LinkButton', {
  alias: 'widget.LinkButton',
  extend: 'Ext.Component',
  renderTpl: '<a href="{url}">{text}</a>',
  renderSelectors: {
    linkEl: 'a'
  },

  initComponent: function() {
    this.callParent(arguments);
    this.renderData = {
      url: this.url || '#',
      text: this.text
    }
  },
  listeners: {
    render: function(c) {
      c.el.on('click', c.handler);
    }
  },
  handler: function(e) {}
});
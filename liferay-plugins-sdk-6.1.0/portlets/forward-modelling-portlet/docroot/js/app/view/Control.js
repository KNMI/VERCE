

var text = "<div style='padding-left: 15px;'><br><br>" +
		"<a href='file-manager' target='_blank'>" +
		"Access the Document Library  (opens in a new window)</a>" +
		"<br><br></div>";

Ext.define('CF.view.Control', {
	  extend:'Ext.form.Panel',
	  alias: 'widget.mypanel',
	  html: text
	});



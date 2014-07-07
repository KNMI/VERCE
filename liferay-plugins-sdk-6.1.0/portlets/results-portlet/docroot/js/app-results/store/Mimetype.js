var mimetypes = [{
  "mime": "application/octet-stream",
  "desc": ""
}, {
  "mime": "image/png",
  "desc": ""
}, {
  "mime": "video/mpeg",
  "desc": ""
},
{
	  "mime": "application/vnd.google-earth.kmz",
	  "desc": ""
	}

]

var mimetypesStore = Ext.define('RS.store.Mimetype', {
  extend: 'Ext.data.Store',
  model: 'RS.model.Mimetype',
  data: mimetypes
});
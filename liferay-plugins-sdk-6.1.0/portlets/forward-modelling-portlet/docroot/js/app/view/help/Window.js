/**
 * Help Window with static content using 'contentEl' property.
 * @extends Ext.window.Window
 */

var helpIframe = '<iframe id="test_iframe" src="http://www.verce-project.eu/projects/docu1/wiki/HPC_use-case?parent=User_documentation" width="1000px" height="600px"></iframe>';
var helpTitle = 'Help';

Ext.define('CF.view.help.Window', {
    extend: 'Ext.window.Window',
    alias : 'widget.cf_helpwindow',
    initComponent: function() {
        Ext.apply(this, {
            bodyCls: "cf-helpwindow",
            closeAction: "hide",
            layout: 'fit',
            maxWidth: 1200,
            html: helpIframe,
            title: helpTitle
        });
        this.callParent(arguments);
    }
});

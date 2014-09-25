/**
 * Abstract window used for all windows of Track annotation tool
 */
Ext.define("TrackAnnot.view.window.Abstract", {
    extend: 'Ext.window.Window',
    layout : 'fit',
    collapsible : true,
    maximizable : true,
    stateful: true,
    closable: true,
    closeAction: 'destroy'
});

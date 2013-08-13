Ext.define("TrackAnnot.view.window.Annotations", {
    extend: 'Ext.window.Window',
    alias: 'widget.window.annotations',
    requires: ["TrackAnnot.view.Annotations"],
    title : 'Annotations',
    layout : 'fit',
    closable : false,
    collapsible : true,
    maximizable : true,
    initComponent: function() {
        this.annotations = Ext.create("TrackAnnot.view.Annotations");
        this.items = [this.annotations];
        this.callParent();
    },
    getAnnotations: function() {
        return this.annotations;
    }
});

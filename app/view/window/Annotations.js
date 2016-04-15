/**
 * Annotations window
 */
Ext.define("TrackAnnot.view.window.Annotations", {
    extend: 'TrackAnnot.view.window.Abstract',
    alias: 'widget.window.annotations',
    requires: ["TrackAnnot.view.Annotations"],
    title : 'Annotations',
    stateId: 'annotations-window',
    closeAction: 'hide',
    initComponent: function() {
        this.annotations = Ext.create("TrackAnnot.view.Annotations");
        this.items = [this.annotations];
        this.callParent();
    },
    getAnnotations: function() {
        return this.annotations;
    }
});

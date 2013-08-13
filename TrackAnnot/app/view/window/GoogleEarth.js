Ext.define("TrackAnnot.view.window.GoogleEarth", {
    extend : 'Ext.window.Window',
    requires: ["TrackAnnot.view.GoogleEarth"],
    title : 'Google Earth',
    layout: 'fit',
    closable: true,
    collapsible: true,
    maximizable: true,
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.GoogleEarth");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
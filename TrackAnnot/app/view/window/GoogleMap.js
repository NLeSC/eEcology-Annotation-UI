Ext.define("TrackAnnot.view.window.GoogleMap", {
    extend : 'Ext.window.Window',
    requires: ["TrackAnnot.view.Metric.GoogleMap"],
    title : 'Google Map',
    layout: 'fit',
    closable: true,
    closeAction: 'hide',
    collapsible: true,
    maximizable: true,
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.GoogleMap");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
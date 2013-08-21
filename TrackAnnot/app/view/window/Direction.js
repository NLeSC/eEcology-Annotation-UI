Ext.define("TrackAnnot.view.window.Direction", {
    extend : 'Ext.window.Window',
    requires: ["TrackAnnot.view.Metric.Direction"],
    layout: 'fit',
    collapsible: true,
    maximizable: true,
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Direction");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
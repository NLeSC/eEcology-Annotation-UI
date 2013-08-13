Ext.define("TrackAnnot.view.window.Temperature", {
    extend : 'Ext.window.Window',
    requires: ["TrackAnnot.view.Metric.Temperature"],
    title : 'Temperature',
    layout: 'fit',
    closable: true,
    closeAction: 'hide',
    collapsible: true,
    maximizable: true,
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Temperature");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
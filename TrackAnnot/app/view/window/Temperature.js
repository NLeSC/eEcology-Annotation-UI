Ext.define("TrackAnnot.view.window.Temperature", {
    extend : 'Ext.window.Window',
    closable: true,
    title : 'Temperature',
    layout: 'fit',
    maximizable: true,
    collapsible: true,
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Temperature");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
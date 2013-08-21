Ext.define("TrackAnnot.view.window.Speed", {
    extend : 'Ext.window.Window',
    requires: ["TrackAnnot.view.Metric.Speed"],
    title : 'Temperature',
    layout: 'fit',
    collapsible: true,
    maximizable: true,
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Speed");
        this.items = [this.chart];

        this.tools = [{
            type: 'help',
            tooltip: 'Green is I, Blue is T'
        }];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
/**
 * Temperature window
 */
Ext.define("TrackAnnot.view.window.Temperature", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Temperature"],
    stateId: 'temperature-window',
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Temperature");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
Ext.define("TrackAnnot.view.window.Properties", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Properties"],
    stateId: 'properties-window',
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Properties");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
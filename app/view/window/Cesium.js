Ext.define("TrackAnnot.view.window.Cesium", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Cesium"],
    stateId: 'cesium-window',
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Cesium");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
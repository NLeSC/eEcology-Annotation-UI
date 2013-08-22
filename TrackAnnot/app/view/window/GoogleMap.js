Ext.define("TrackAnnot.view.window.GoogleMap", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.GoogleMap"],
    stateId: 'googlemap-window',
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.GoogleMap");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
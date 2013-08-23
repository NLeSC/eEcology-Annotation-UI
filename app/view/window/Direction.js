Ext.define("TrackAnnot.view.window.Direction", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Direction"],
    stateId: 'direction-window',
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Direction");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
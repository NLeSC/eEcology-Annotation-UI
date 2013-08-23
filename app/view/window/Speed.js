Ext.define("TrackAnnot.view.window.Speed", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Speed"],
    stateId: 'speed-window',
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
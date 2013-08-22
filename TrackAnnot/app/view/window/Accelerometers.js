Ext.define("TrackAnnot.view.window.Accelerometers", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Acceleration"],
    stateId: 'accel-window',
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Acceleration");
        this.items = [this.chart];

        this.tools = [{
            type: 'gear',
            tooltip: 'Alter number of plot before and after current time'
        }];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
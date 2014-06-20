/**
 * Altitude window
 */
Ext.define("TrackAnnot.view.window.Altitude", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Altitude"],
    stateId: 'altitude-window',
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Altitude");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
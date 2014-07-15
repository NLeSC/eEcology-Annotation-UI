/**
 * Delta Direction window
 */
Ext.define("TrackAnnot.view.window.DeltaDirection", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.DeltaDirection", 'Ext.menu.Menu'],
    stateId: 'delta-direction-window',
    initComponent: function() {
        var me = this;
        this.chart = Ext.create("TrackAnnot.view.Metric.DeltaDirection");
        this.items = [this.chart];

       this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
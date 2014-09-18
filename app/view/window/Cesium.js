/**
 * Cesium globe window
 */
Ext.define("TrackAnnot.view.window.Cesium", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Cesium"],
    stateId: 'cesium-window',
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.Metric.Cesium");
        this.items = [this.chart];

        var me = this;
        this.tools = [{
            type: 'gear',
            tooltip: 'Center map on track',
            handler: function(event) {
                me.getChart().centerOnTrack();
            }
        }];

        this.chart.on('pointclick', this.onPointClick, this);
        
        this.addEvents('pointclick');
        this.callParent();
    },
    getChart: function() {
        return this.chart;
    },
    onPointClick: function(date, source) {
    	this.fireEvent('pointclick', date, source);
    }
});
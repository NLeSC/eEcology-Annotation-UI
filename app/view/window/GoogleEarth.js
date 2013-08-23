Ext.define("TrackAnnot.view.window.GoogleEarth", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.GoogleEarth"],
    stateId: 'googleearth-window',
    initComponent: function() {
        this.chart = Ext.create("TrackAnnot.view.GoogleEarth");
        this.items = [this.chart];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    }
});
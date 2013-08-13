Ext.define("TrackAnnot.view.window.Accelerometers", {
    extend : 'Ext.window.Window',
    title : 'Accelerometers',
    layout: 'fit',
    closable: true,
    collapsible: true,
    maximizable: true,
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
/**
 * Speed window with menu to toggle speed types.
 */
Ext.define("TrackAnnot.view.window.Speed", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Speed", 'Ext.menu.Menu'],
    stateId: 'speed-window',
    initComponent: function() {
        var me = this;
        this.chart = Ext.create("TrackAnnot.view.Metric.Speed");
        this.items = [this.chart];
        // TODO make show toggles stateful
        this.showI = true;
        this.showT = true;

        this.actionsMenu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Instantanous',
                cls: 'iline',
                checked: this.showI,
                checkHandler: function(item, checked) {
                    me.onToggleVisibilityOfI(checked);
                }
            } ,{
                text: 'Traject',
                cls: 'tline',
                checked: this.showT,
                checkHandler: function(item, checked) {
                    me.onToggleVisibilityOfT(checked);
                }
            }]
        });

        this.tools = [{
            type: 'gear',
            tooltip: 'Toggle',
            handler: function(event) {
                me.actionsMenu.showAt(event.getXY());
            }
        }];

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    },
    onToggleVisibilityOfI: function(checked) {
        this.showI = checked;
        this.getChart().toggleVisibilityOfI(checked);
    },
    onToggleVisibilityOfT: function(checked) {
        this.showT = checked;
        this.getChart().toggleVisibilityOfT(checked);
    }
});
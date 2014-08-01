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

        // TODO make show toggles stateful
        this.showI = false;
        this.showT = true;

        this.actionsMenu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Instantaneous',
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
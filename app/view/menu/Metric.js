Ext.define('TrackAnnot.view.menu.Metric', {
    extend: 'Ext.menu.CheckItem',
    alias: 'widget.metricmenu',
    stateful: true,
    stateEvents: ['checkchange'],
    getState: function() {
        var me = this,
        state = me.callParent() || {};

        Ext.apply(state, {
            checked: this.checked
        });

        return state;
    },
    applyState: function(state) {
        var me = this;
        if (state) {
            me.setChecked(state.checked);
        }
    }
});
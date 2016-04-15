/**
 * To show a hidden metric use a menu item.
 */
Ext.define('TrackAnnot.view.menu.Metric', {
    extend: 'Ext.menu.CheckItem',
    alias: 'widget.metricmenu',
    stateful: true,
    stateEvents: ['checkchange'],
    getState: function() {
        state = this.callParent() || {};

        Ext.apply(state, {
            checked: this.checked
        });

        return state;
    },
    applyState: function(state) {
        if (state) {
            this.setChecked(state.checked);
        }
    }
});

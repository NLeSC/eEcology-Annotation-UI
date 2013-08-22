Ext.define('TrackAnnot.view.field.DateTime', {
	extend : 'Esc.ee.form.field.DateTime',
	alias : 'widget.datetimefield',
    getState: function() {
        var state = this.callParent() || {};
        Ext.apply(state, {
            value: this.getValue()
        });
        console.log('Save state for '+ this.text+ 'to ', state);
        return state;
    },
    applyState: function(state) {
        console.log('Apply state for '+ this.text+ 'to ', state);
        if (state) {
            this.setValue(state.value);
        }
    },
    listeners: {
        change: function() {
            this.saveState();
        }
    }
});

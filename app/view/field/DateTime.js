/**
 * Form field with combined date and time picker
 */
Ext.define('TrackAnnot.view.field.DateTime', {
	extend : 'NLeSC.form.field.DateTime',
	alias : 'widget.datetimefield',
    getState: function() {
        var state = this.callParent() || {};
        Ext.apply(state, {
            value: this.getValue()
        });
        return state;
    },
    applyState: function(state) {
        this.callParent(arguments);
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

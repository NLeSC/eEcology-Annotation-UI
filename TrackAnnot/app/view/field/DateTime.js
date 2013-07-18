Ext.define('TrackAnnot.view.field.DateTime', {
	extend : 'Ext.form.field.Text',
	alias : 'widget.datetimefield',
	vtype : 'datetime',
	valueToRaw : function(value) {
		if (value === undefined) {
			return value;
		}
		return value.toISOString();
	},
	rawToValue : function(raw) {
		return new Date(raw);
	}
});

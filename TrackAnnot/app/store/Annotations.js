Ext.define('TrackAnnot.store.Annotations', {
	extend : 'Ext.data.Store',
	model : 'TrackAnnot.model.Annotation',
	constructor: function(config) {
        this.callParent(arguments);
        this.initConfig(config);
    },
	exportText: function(trackStore) {
	    var data = []

	    // for all timepoints inside an annotation create a row.
	    this.each(function(annotation) {
	        trackStore.eachRange(annotation.data.start, annotation.data.end, function(timepoint) {
	            data.push({
	                id: trackStore.trackerId,
	                ts: timepoint.date_time.toISOString(),
	                'class': annotation.data.class_id
	            });
	        })
	    });

        return Ext.JSON.encode(data);
	},
	importText: function(text) {
	    var me = this;
	    var data = Ext.JSON.decode(text);

	    // TODO filter on trackStore.trackerId and date range.
	    data.forEach(function(d) {
	        d.ts = new Date(d.ts);
	    });
	    // order on timestamp
	    data.sort(function(a, b) {
	        return a.ts - b.ts;
	    });

	    // find ranges of same class and create annotation records for them
        var classStore = Ext.StoreMgr.get('Classifications');
	    var beginAnnotation = data[0];
	    var prevAnnotation = null;
	    data.forEach(function(d) {
	       if (d['class'] != beginAnnotation['class']) {
	           me.add({
	               start: beginAnnotation.ts,
	               end: prevAnnotation.ts,
	               class_id: prevAnnotation['class'],
	               classification: classStore.getById(prevAnnotation['class']).data
	           });
               beginAnnotation = d;
	       }
	       prevAnnotation = d;
	    });
	    // add last annotation
	    me.add({
            start: beginAnnotation.ts,
            end: data[data.length-1].ts,
            class_id: data[data.length-1]['class'],
            classification: classStore.getById(data[data.length-1]['class']).data
        });
	}
});

/**
 * Store for annotations
 */
Ext.define('TrackAnnot.store.Annotations', {
	extend : 'Ext.data.Store',
	model : 'TrackAnnot.model.Annotation',
	exportText: function(trackStore) {
	    var sep = ",";
	    var linesep = "\n";
	    var text = ['id', 'ts', 'class'].join(sep) + linesep;

	    // for all timepoints inside an annotation create a row.
	    this.each(function(annotation) {
	        trackStore.eachRange(annotation.data.start, annotation.data.end, function(timepoint) {
	            text += [trackStore.trackerId,
	                     timepoint.date_time.toISOString(),
	                     annotation.data.class_id].join(sep) + linesep;
	        });
	    });

        return text;
	},
	importText: function(text, trackStore) {
	    var me = this;
	    var data = d3.csv.parse(text, function(d) {
	        return {
	            ts: new Date(d['ts']),
	            'class': +d['class'],
	            id: +d['id']
	        };
	    });

	    /*
	     * Track:
	     * t0
	     * t1
	     * t2
	     *
	     * Ex1:
	     * t0=a1
	     * ->
	     * a1,t0,t0
	     *
	     * Ex2:
	     * t0=a1
	     * t1=a1
	     * ->
	     * a1,t0,t1
	     *
	     * Ex3:
	     * t0=a1
	     * t1=a2
	     * ->
	     * a1,t0,t0
	     * a2,t1,t1
	     *
	     * Ex4:
	     * t0=a1
	     * t2=a1
	     * ->
	     * a1,t0,t0
	     * a1,t2,t2
	     *
	     * Ex5
	     * t0=a1
	     * t0=a2
	     * ->
	     * a1,t0,t0
	     *
	     * Ex6
	     * t3=a1
	     * ->
	     * a1,t3,t3
	     *
	     */

	    // find ranges of same class and create annotation records for them

        // map data to trackStore so we know for each trackStore row the class
        var anTracks = d3.map();
        trackStore.data.forEach(function(trackRecord) {
            anTracks.set(trackRecord.date_time, {ts:trackRecord.date_time, 'class': null});
        });
        data.forEach(function(annotation) {
            if (annotation.id === trackStore.trackerId && anTracks.has(annotation.ts)) {
                anTracks.set(annotation.ts, {ts:annotation.ts, 'class': annotation['class']});
            }
        });

        // grow annotation until class is null or diff, on change add annotation to store.
        var classStore = Ext.StoreMgr.get('Classifications');
        var startTs = null;
        var prevClass = null;
        var prevTs = null;
        var ats = anTracks.values().sort(function(a, b) {
            return a.ts - b.ts;
        });
        ats.forEach(function(d, i) {
            var classification = null;
            if (prevClass === null && d['class'] !== null) {
                startTs = d['ts'];
            }
            if (prevClass !== null && d['class'] !== prevClass) {
                classification = classStore.getById(prevClass);
                if (classification === null) {
                    throw new Error('Annotation class with "'+prevClass+'" identifier is unknown');
                }
                me.add({
                    start: startTs,
                    end: prevTs,
                    class_id: prevClass,
                    classification: classification.data
                });
                if (d['class'] !== null) {
                    startTs = d['ts'];
                }
            }
            prevTs = d['ts'];
            prevClass = d['class'];
        });
        // end annotation if annotation has begon
        if (prevClass !== null) {
            classification = classStore.getById(prevClass);
            if (classification === null) {
                throw new Error('Annotation class with "'+prevClass+'" identifier is unknown');
            }
            me.add({
                start: startTs,
                end: ats[ats.length-1]['ts'],
                class_id: prevClass,
                classification: classification.data
            });
        }
	},
	/**
	 * Returns classifcation model if date_time is found.
	 * Returns null when date_time is not annotated.
	 */
	getClassificationAtDateTime: function(date_time) {
		var classification = null;
		this.data.each(function(r) {
            if (r.data.start <= date_time && date_time <= r.data.end) {
            	classification = r.data.classification;
            }
        });
		return classification;
	}
});

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
	getAnnotationAtDateTime: function(date_time) {
		var annotation;
		this.each(function(r) {
            if (r.data.start <= date_time && date_time <= r.data.end) {
            	annotation = r;
            	return false;
            }
        });
		return annotation;
	},
	/**
	 * Returns classifcation model if date_time is found.
	 * Returns falsy when date_time is not annotated.
	 */
	getClassificationAtDateTime: function(date_time) {
		var annotation = this.getAnnotationAtDateTime(date_time);
		if (annotation) {
			return annotation.data.classification;
		}
	},
	removeClassificationAt: function(date_time, trackStore) {
		var index2remove = this.findBy(function(r) {
			return (r.data.start <= date_time && date_time <= r.data.end);
		});
		if (index2remove !== -1) {
			this.removeAt(index2remove);
		}
	},
	getAnnotationAtPreviousDateTime: function(date_time, trackStore) {
		var prev_date_time = trackStore.getPreviousDateTime(date_time);
		var prev_annotation = this.getAnnotationAtDateTime(prev_date_time);
		return prev_annotation;
	},
	getAnnotationAtNextDateTime: function(date_time, trackStore) {
		var next_date_time = trackStore.getNextDateTime(date_time);
		var next_annotation = this.getAnnotationAtDateTime(next_date_time);
		return next_annotation;
	},
	setClassificationAt: function(date_time_in, classification, trackStore) {
		date_time = trackStore.closestDate(date_time_in);
		if (!date_time) {
			console.error('Date time ' + date_time_in + ' not found on track');
			return;
		}
		if (!classification) {
			this.removeClassificationAt(date_time, trackStore);
		} else {
			var annot_on_dt = this.getAnnotationAtDateTime(date_time);
			var prev_annotation = this.getAnnotationAtPreviousDateTime(date_time, trackStore);
			var next_annotation = this.getAnnotationAtNextDateTime(date_time, trackStore);
			if (annot_on_dt && annot_on_dt.classification === classification) {
			    // already correct so do nothing
			} else if (annot_on_dt) {
				annot_on_dt.set('class_id', classification.id);
				annot_on_dt.set('classification', classification);
			} else if (prev_annotation && prev_annotation.data.classification === classification){
				prev_annotation.set('end', date_time);
			} else if (next_annotation && next_annotation.data.classification === classification){
				next_annotation.set('start', date_time);
			} else {
				var r = {
		            start: date_time,
		            end: date_time,
		            class_id: classification.id,
		            classification: classification
		        };
		        this.insert(0, r);
			}
		}
	},
	setClassificationDuring: function(start_time, end_time, classification, trackStore) {
		start_time = trackStore.closestDate(start_time);
		end_time = trackStore.closestDate(end_time);
		var r = {
            start: start_time,
            end: end_time,
            class_id: classification.id,
            classification: classification
        };
        this.insert(0, r);
	}
});

/**
 * Store for annotations
 */
Ext.define('TrackAnnot.store.Annotations', {
    extend : 'Ext.data.Store',
    requires : ['Ext.data.StoreManager'],
    model : 'TrackAnnot.model.Annotation',
    mode: 'local',
    config: {
      trackStore: 'Track'
    },
    applyTrackStore: function(store) {
      store = Ext.data.StoreManager.lookup(store);
      return store;
    },
    enableRemoteMode: function(annotationsUrl) {
      this.mode = 'remote';
      this.annotationsUrl = annotationsUrl;
      this.getTrackStore().on('load', this.load, this);
    },
    load: function(trackStore) {
      var params = {
        id: trackStore.getTrackerId(),
        start: trackStore.getStart().toISOString(),
        end: trackStore.getEnd().toISOString()
      };
      if (this.fireEvent('beforeload', this) !== false) {
        this.removeAll();
        this.loading = true;
        Ext.Ajax.request({
          url: this.annotationsUrl + '?' +  Ext.Object.toQueryString(params),
          success: this.onLoad,
          scope: this
        });
      }
    },
    onLoad: function(response) {
      // make sure that during loading there where no annotations added.
      this.removeAll();
      this.importText(response.responseText, this.getTrackStore());
      this.commitChanges();
      this.fireEvent('load', this, [], true);
    },
    hasChangedRemoteAnnotations: function() {
       return this.mode === 'remote' && (this.getModifiedRecords().length > 0 || this.getRemovedRecords().length > 0);
    },
    onLoadFailure: function() {
      console.error('Failed to download annotations');
    },
    exportText: function(trackStore) {
        var sep = ",";
        var linesep = "\n";
        var text = ['device_info_serial', 'date_time', 'class_id'].join(sep) + linesep;

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
                ts: new Date(d.date_time),
                'class': +d.class_id,
                id: +d.device_info_serial
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
            if (annotation.id == trackStore.trackerId && anTracks.has(annotation.ts)) {
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
                startTs = d.ts;
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
                    startTs = d.ts;
                }
            }
            prevTs = d.ts;
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
                end: ats[ats.length-1].ts,
                class_id: prevClass,
                classification: classification.data
            });
        }
    },
    getAnnotationIndexAtDataTime: function(date_time) {
        return this.findBy(function(r) {
            return (r.data.start <= date_time && date_time <= r.data.end);
        });
    },
    getAnnotationAtDateTime: function(date_time) {
        var annotation_index = this.getAnnotationIndexAtDataTime(date_time);
        return this.getAt(annotation_index);
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
    setClassificationAt: function(date_time_in, classification, trackStore) {
        date_time = trackStore.closestDate(date_time_in);
        if (!date_time) {
            console.error('Date time ' + date_time_in + ' not found on track');
            return;
        }
        var current_annotation = this.getAnnotationAtDateTime(date_time);
        var current_annotation_index = this.indexOf(current_annotation);
        var prev_date_time = trackStore.getPreviousDateTime(date_time);
        var next_date_time = trackStore.getNextDateTime(date_time);
        var prev_annotation = this.getAnnotationAtDateTime(prev_date_time);
        var next_annotation = this.getAnnotationAtDateTime(next_date_time);
        var end_of_next_annotation;
        if (classification) {
            if (current_annotation && current_annotation.data.classification === classification) {
                // already correct so do nothing
            } else if (
                current_annotation &&
                current_annotation === prev_annotation &&
                current_annotation === next_annotation
            ) {
                end_of_next_annotation = next_annotation.data.end;

                // make previous annotation shorter
                prev_annotation.set('end', prev_date_time);
                prev_annotation.commit();

                // add current annotation
                this.insert(current_annotation_index + 1, {
                    start: date_time,
                    end: date_time,
                    class_id: classification.id,
                    classification: classification
                });

                // add next annotation
                this.insert(current_annotation_index + 2, {
                    start: next_date_time,
                    end: end_of_next_annotation,
                    class_id: prev_annotation.data.class_id,
                    classification: prev_annotation.data.classification
                });
            } else if (
                prev_annotation && next_annotation &&
                prev_annotation.data.classification === next_annotation.data.classification &&
                prev_annotation.data.classification === classification
            ) {
                if (current_annotation) {
                    this.remove(current_annotation);
                }
                var new_end = next_annotation.data.end;
                this.remove(next_annotation);
                prev_annotation.set('end', new_end);
                prev_annotation.commit();
            } else if (prev_annotation && prev_annotation.data.classification === classification){
                if (current_annotation && next_annotation && current_annotation === next_annotation) {
                    next_annotation.set('start', next_date_time);
                    next_annotation.commit();
                }
                prev_annotation.set('end', date_time);
                prev_annotation.commit();
            } else if (next_annotation && next_annotation.data.classification === classification){
                if (current_annotation && prev_annotation && current_annotation === prev_annotation) {
                    prev_annotation.set('end', prev_date_time);
                    prev_annotation.commit();
                }
                next_annotation.set('start', date_time);
                next_annotation.commit();
            } else if (current_annotation &&
                    prev_annotation &&
                    prev_annotation.data.classification === current_annotation.data.classification
            ) {
                prev_annotation.set('end', prev_date_time);
                prev_annotation.commit();

                // add current annotation
                this.insert(current_annotation_index + 1, {
                    start: date_time,
                    end: date_time,
                    class_id: classification.id,
                    classification: classification
                });
            } else if (current_annotation &&
                    next_annotation &&
                    next_annotation.data.classification === current_annotation.data.classification
            ) {
                next_annotation.set('start', next_date_time);
                next_annotation.commit();

                // add current annotation
                this.insert(current_annotation_index, {
                    start: date_time,
                    end: date_time,
                    class_id: classification.id,
                    classification: classification
                });
            } else if (current_annotation) {
                // dt has classification, but is different
                current_annotation.set('class_id', classification.id);
                current_annotation.set('classification', classification);
                current_annotation.commit();
            } else {
                var r = {
                    start: date_time,
                    end: date_time,
                    class_id: classification.id,
                    classification: classification
                };
                this.insert(0, r);
            }
        } else {
            if (current_annotation &&
                    current_annotation === prev_annotation &&
                    current_annotation === next_annotation) {
                end_of_next_annotation = next_annotation.data.end;

                // make previous annotation shorter
                prev_annotation.set('end', prev_date_time);
                prev_annotation.commit();

                // add next annotation
                this.insert(current_annotation_index + 2, {
                    start: next_date_time,
                    end: end_of_next_annotation,
                    class_id: prev_annotation.data.class_id,
                    classification: prev_annotation.data.classification
                });
            } else if (current_annotation &&
                    prev_annotation &&
                current_annotation.data.classification === prev_annotation.data.classification
            ) {
                prev_annotation.set('end', prev_date_time);
                prev_annotation.commit();
            } else if (current_annotation &&
                    next_annotation &&
                    current_annotation.data.classification === next_annotation.data.classification) {
                next_annotation.set('start', next_date_time);
                next_annotation.commit();
            } else {
                this.remove(current_annotation);
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

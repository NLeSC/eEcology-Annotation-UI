/**
 * Store for track data
 *
 * The track data is loaded from the eEcology DB using a webservice
 */
Ext.define('TrackAnnot.store.Track', {
    extend: 'Ext.data.AbstractStore',
    data: [],
    requires: ['Ext.data.StoreManager'],
    model : 'TrackAnnot.model.Annotation', // TODO dummy model
    config: {
        storeId: 'track',
        /**
         * @cfg {Number} trackerId Identifier of tracker
         */
        trackerId: null,
        /**
         * @cfg {Date} start Start of tracker data
         */
        start: null,
        /**
         * @cfg {Date} end End of tracker data
         */
        end: null,
        /**
         * @cfg {Array}
         */
        format: null,
        urlTemplate: '/aws/tracker/{trackerId}/{start}/{end}'
    },
    constructor: function(config) {
       this.callParent(arguments);

       /**
        * @event load
        * Fires whener the store reads data from a remote data source
        * @param {TrackAnnot.store.Track} this
        * @param {Array} data
        * @param {Boolean} successful True if the operation was successful.
        */
       this.addEvents(['load', 'loadFailure']);
       this.initConfig(config);
    },
    load: function() {
        var me = this;
        Ext.Ajax.request({
            url: this.getUrl(),
            success: this.success,
            failure: this.failure,
            scope: me,
            timeout: 300000
        });
    },
    getUrl: function() {
        var tpl = new Ext.Template(this.urlTemplate);
        return tpl.apply({
            trackerId: this.trackerId,
            start: this.start.toISOString(),
            end: this.end.toISOString()
        });
    },
    loadData: function(data) {
        var me = this;
        this.data = data;
        var isLoaded = true;
        if (!this.data) {
            isLoaded = false;
            this.fireEvent('loadFailure', 'Unable to parse response');
            return;
        }
        this.dt2index = {};
        var minLon = Number.MAX_VALUE;
        var maxLon = -Number.MAX_VALUE;
        var minLat = Number.MAX_VALUE;
        var maxLat = -Number.MAX_VALUE;
        this.data.forEach(function(d, i) {
            d.date_time = new Date(d.date_time);
            me.dt2index[d.date_time.toISOString()] = i;
            minLon = Math.min(minLon, d.lon);
            maxLon = Math.max(maxLon, d.lon);
            minLat = Math.min(minLat, d.lat);
            maxLat = Math.max(maxLat, d.lat);
        });
        this.minLon = minLon;
        this.maxLon = maxLon;
        this.minLat = minLat;
        this.maxLat = maxLat;

        if (this.data.length === 0) {
            this.fireEvent('loadFailure', 'Server returned zero timepoints');
            return;
        }
        this.fireEvent('load', this, this.data, isLoaded);
    },
    success: function(response) {
        var data = Ext.decode(response.responseText);
        this.loadData(data);
    },
    failure: function(response) {
        this.fireEvent('loadFailure', response.statusText);
    },
    getTimeExtent: function() {
        return [this.getStart(), this.getEnd()];
    },
    getLongitudeExtent: function() {
        return [this.minLon, this.maxLon];
    },
    getLatitudeExtent: function() {
        return [this.minLat, this.maxLat];
    },
    /**
     * Generate new axis.
     * Uses configured format.
     */
    getAxis: function() {
        return d3.svg.axis().tickFormat(this.getFormat()).tickSubdivide(2);
    },
    /**
     *
     * @param {Date} current
     * @param {Number} before
     * @param {Number} after
     */
    getSurrounding: function(current, before, after) {
        return [];
    },
    get: function(index) {
      return this.data[index];
    },
    length: function() {
      return this.data.length;
    },
    getIndexByDateTime: function(date_time) {
        var date_str = date_time.toISOString();
        return this.dt2index[date_str];
    },
    getPreviousDateTime: function(date_time) {
        var index = this.getIndexByDateTime(date_time);
        if (index > 0) {
            var prev_index = index - 1;
            var prev_record = this.get(prev_index);
            return prev_record.date_time;
        }
    },
    getNextDateTime: function(date_time) {
        var index = this.getIndexByDateTime(date_time);
        if (index < this.length() - 1) {
            var next_index = index + 1;
            var next_record = this.get(next_index);
            return next_record.date_time;
        }
    },
    closestIndex: function(newdate) {
        // lookup index of timepoint closest to current
        var bisectDate = d3.bisector(function(d) { return d.date_time;}).left;
        var index = bisectDate(this.data, newdate, 1);
        if (index >= this.data.length) {
            index = this.data.length - 1;
        }
        if (index > 0) {
            var diff = Math.abs(this.data[index].date_time - newdate);
            var diff_prev = Math.abs(newdate - this.data[index-1].date_time);
            if (diff_prev < diff) {
                index = index - 1;
            }
        }
        return index;
    },
    closestDate: function(newdate) {
        var index = this.getIndexByDateTime(newdate);
        if (index === undefined) {
            index = this.closestIndex(newdate);
        }
        if (index === -1) {
            return;
        }
        return this.data[index].date_time;
    },
    eachRange: function(start, end, callback, scope) {
        if (!scope) {
            scope = this;
        }
        var startId = this.closestIndex(start);
        var endId = this.closestIndex(end);
        for (var i = startId, len = endId; i <= len; i++) {
            callback.call(scope, this.data[i], i);
        }
    },
    isEmpty: function() {
        return this.data.length === 0;
    },
    isfilled: function() {
        return this.data.length > 0;
    }
});

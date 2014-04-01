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
	success: function(response) {
	    this.data = Ext.decode(response.responseText);
        var isLoaded = true;
	    if (!this.data) {
	        isLoaded = false;
            this.fireEvent('loadFailure', 'Unable to parse response');
            return;
	    }
        this.data.forEach(function(d) {
            d.date_time = new Date(d.date_time);
        });
	    if (this.data.length == 0) {
            this.fireEvent('loadFailure', 'Server returned zero timepoints');
            return;
	    }
	    this.fireEvent('load', this, this.data, isLoaded);
	},
	failure: function(response) {
	    this.fireEvent('loadFailure', response.statusText);
	},
	getTimeExtent: function() {
	    return [this.getStart(), this.getEnd()];
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
	closestIndex: function(newdate) {
        // lookup index of timepoint closest to current
        var bisectDate = d3.bisector(function(d) { return d.date_time;}).left;
        var index = bisectDate(this.data, newdate, 1);
        return index;
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
	    return this.data.length == 0;
	}
});
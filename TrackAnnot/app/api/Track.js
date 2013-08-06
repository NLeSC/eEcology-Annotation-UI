Ext.define('TrackAnnot.api.Track', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
	data: [],
	config: {
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
	},
	constructor: function(config) {
       this.addEvents('load');
       this.initConfig(config);
       /**
        * @event load
        * Fires whener the store reads data from a remote data source
        * @param {TrackAnnot.store.Track} this
        * @param {Array} data
        * @param {Boolean} successful True if the operation was successful.
        */


       this.mixins.observable.constructor.call(this, config);
	},
	load: function() {
	    var me = this;
	    Ext.Ajax.request({
	        url: this.getUrl(),
	        success: this.success,
	        failure: this.failure,
	        scope: me
	    });
	},
	getUrl: function() {
	    // TODO replace with server url
	    return '../355.2010-06-28.json';
	},
	success: function(response) {
	    this.data = Ext.decode(response.responseText);
	    this.data.forEach(function(d) {
	        d.date_time = new Date(d.date_time);
	    });
	    this.fireEvent('load', this, this.data, true);
	    console.log('Track fetched');
	},
	failure: function() {
	    this.fireEvent('load', this, this.data, false);
	},
	getTimeExtent: function() {
	    return [this.getStart(), this.getEnd()];
	},
	/**
	 * Generate new axis.
	 * Uses configured format.
	 */
	getAxis: function() {
	    return d3.svg.axis().tickFormat(this.getFormat()).tickSubdivide(3);
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
        var bisectDate = d3.bisector(function(d) { return d.date_time }).left;
        var index = bisectDate(this.data, newdate, 1);
        return index;
	}
});
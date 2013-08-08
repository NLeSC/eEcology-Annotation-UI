Ext.define("TrackAnnot.view.GoogleEarth", {
    extend: 'Ext.ux.GEarthPanel',
    alias: 'widget.googleearth',
    mixins : {
        bindable : 'Ext.util.Bindable'
    },
    requires: [
        'Ext.window.Window',
        'Ext.tree.Panel',
        'Ext.layout.container.Accordion',
        'Ext.form.field.Trigger',
        'Ext.form.field.Checkbox',
        'Ext.data.StoreManager',
    ],
    config: {
    	time: {
    	   start: null,
    	   stop: null
        },
    	url: window.location.href.replace('chart.html', 'S355_museumplein.kml'),
    	location: 'Amsterdam',
        annotationStore : null
    },
    constructor : function(config) {
    	this.callParent(arguments);
    	this.initConfig(config);
    },
    onEarthFailure: function() {
        console.log('Google Earth failed to instantiate');
    },
    initComponent : function() {
        this.callParent(arguments);

        var store = Ext.data.StoreManager.lookup(this.getAnnotationStore());
        this.setAnnotationStore(store);
        this.bindStore(this.getAnnotationStore());

        this.on('kmlLoaded', this.kmlLoaded, this);
    },
    earthLayers: {
        LAYER_BUILDINGS: true,
        LAYER_TERRAIN: true
    },
    earthOptions: {
        setStatusBarVisibility: false,
        setAtmosphereVisibility: true,
        setMouseNavigationEnabled: true
    },
    annotate: function(record) {
        var begin = record.data.start;
        var end = record.data.end;
        // Convert rgb(rr, gg, bb) to FFbbggrr
        var color = d3.rgb(record.data.classification.color);
        var abgr = 'ff'+color.b.toString(16)+color.g.toString(16)+color.r.toString(16);

        // Only the first placemark is shown initially
        // to see all placemarks the time has to be set to a time span
    	// can't set time to whole extent during fetchkml callback
    	// so do it here
        var timespan = this.earth.getTime().getControl().getExtents();
        this.earth.getTime().setTimePrimitive(timespan);

        Ext.Array.forEach(this.placemarks, function(placemark) {
        	var ts_begin = placemark.begin;
        	var ts_end = placemark.end;
        	if (
                    (ts_begin>=begin && ts_begin<=end) ||
                    (ts_end>=begin && ts_end<=end) ||
                    (ts_begin<=begin && ts_end>=end)
                    && abgr != undefined
            ) {
        		placemark.orig_color = placemark.color.get()
                placemark.color.set(abgr);
            }
        });
    },
    onEarthReady: function() {
    	this.callParent(arguments);

    	this.getEarth().getNavigationControl().setVisibility(this.getEarth().VISIBILITY_HIDE);
        // this.getEarth().getTime().getControl().setVisibility(this.getEarth().VISIBILITY_HIDE);

 		// Create options window
        var earth_options = Ext.create('Ext.window.Window', {
            title: 'Google Earth options',
            width: 280,
            height: 600,
            margins: '5 5 5 5',
            layout: 'accordion',
            layoutConfig: {
                animate: true
            },
            defaults: {
                bodyStyle: 'padding: 10px'
            }
         });
         earth_options.add(this.getKmlPanel());
         earth_options.add(this.getLocationPanel());
         earth_options.add(this.getLayersPanel());
         earth_options.add(this.getOptionsPanel());
         this.options = earth_options;
    },
    load: function() {
        this.fetchKml(this.getUrl());
        this.findLocation(this.getLocation());
    },
    kmlLoaded: function(kmlObject) {
    	//this.callParent(arguments);
    			// can not set timeslider to whole timerange of kml placemarks
		// timespan is empty
        //var timespan = this.earth.getTime().getControl().getExtents();
        //this.earth.getTime().setTimePrimitive(timespan);

        // cache the place marks in javascript
        // walking through kml on the fly (during annotate()) to change colors is too slow
        this.placemarks = [];
        var placemarks = this.earth.getFeatures().getFirstChild().getFeatures().getChildNodes();
        for(var i = 0; i < placemarks.getLength(); i++) {
        	var item = placemarks.item(i);
        	if (!item.getTimePrimitive()) {
                continue;
            }
        	this.placemarks.push({
        		begin: new Date(item.getTimePrimitive().getBegin().get()),
        		end: new Date(item.getTimePrimitive().getEnd().get()),
        		color: item.getStyleSelector().getIconStyle().getColor()
        	});
        }

//        this.setLoading(false);
    },
	  bindStore : function(store) {
	    var me = this;
	    me.mixins.bindable.bindStore.apply(me, arguments);
	  },
	  getStoreListeners : function() {
	      // skip update as it is fired multiple times during dragging and GoogleEarth can't keep up refreshing.
	      // TODO changing color of classification does not get updated into GoogleEarth
	    return {
          load : this.drawAnnotations,
	      write : this.drawAnnotations,
	      add : this.drawAnnotations,
	      bulkremove : this.drawAnnotations,
	      clear : this.drawAnnotations
	    };
	  },
	  drawAnnotations: function() {
        // restore track to original color
        Ext.Array.forEach(this.placemarks, function(placemark) {
        	if (placemark.orig_color != undefined) {
                placemark.color.set(placemark.orig_color);
                placemark.orig_color = undefined;
        	}
        });

		this.getAnnotationStore().each(this.annotate, this);
	  }
});
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
    	trackStore: 'Track',
        annotationStore : 'Annotations'
    },
    constructor : function(config) {
    	this.callParent(arguments);
    	this.initConfig(config);
    },
    onEarthFailure: function() {
        console.log('Google Earth failed to instantiate');
    },
    applyAnnotationStore: function(store) {
        store = Ext.data.StoreManager.lookup(store);
        this.bindStore(store);
        return store;
    },
    applyTrackStore: function(store) {
        store = Ext.data.StoreManager.lookup(store);
        store.on('load', this.loadData, this);
        return store;
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
        var me = this;
        var begin = record.data.start.toISOString();
        var end = record.data.end.toISOString();
        this.styleMaps[record.data.class_id] = this.getStyleMap(record.data.classification.color);

        Ext.Array.forEach(this.placemarks, function(placemark) {
        	var ts = placemark.id;
        	if (ts >= begin && ts <= end) {
        	    placemark.class_id = record.data.class_id;
        	    placemark.placemark.setStyleSelector(me.styleMaps[record.data.class_id]);
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
    getStyleMap: function(color, normalAlpha, highlightAlpha) {
        var ge = this.earth;
        // Convert rgb(rr, gg, bb) to bbggrr
        var color = d3.rgb(color);
        var z = color.b;
        color.b = color.r;
        color.r = z;
        var bgr = color.toString().slice(1);

        normalAlpha = typeof normalAlpha !== 'undefined' ? normalAlpha : '88';
        highlightAlpha = typeof highlightAlpha !== 'undefined' ? highlightAlpha : 'dd';

        // Create a style map.
        var styleMap = ge.createStyleMap('');

        // Create normal style for style map.
        var normalStyle = ge.createStyle('');
        var normalIcon = ge.createIcon('');
        normalIcon.setHref('http://maps.google.com/mapfiles/kml/pal2/icon26.png');
        normalStyle.getIconStyle().setIcon(normalIcon);
        normalStyle.getIconStyle().setScale(0.4);
        normalStyle.getIconStyle().getColor().set(normalAlpha + bgr);

        // Create highlight style for style map.
        var highlightStyle = ge.createStyle('');
        var highlightIcon = ge.createIcon('');
        highlightIcon.setHref('http://maps.google.com/mapfiles/kml/pal2/icon26.png');
        highlightStyle.getIconStyle().setIcon(highlightIcon);
        highlightStyle.getIconStyle().setScale(0.4);
        highlightStyle.getIconStyle().getColor().set(highlightAlpha + bgr);

        styleMap.setNormalStyle(normalStyle);
        styleMap.setHighlightStyle(highlightStyle);

        return styleMap;
    },
    loadData: function(store, rows) {
        var me = this;
        var ge = this.earth;

        this.clearFeatures();

        var latitude = d3.mean(rows, function(d) { return d.latitude});
        var longitude = d3.mean(rows, function(d) { return d.longitude});

        ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
        var lookAt = ge.createLookAt('');
        lookAt.set(latitude, longitude, 100, ge.ALTITUDE_RELATIVE_TO_GROUND, 0, 60, 40000);
        ge.getView().setAbstractView(lookAt);

        // create the line string placemark
        var lineStringPlacemark = ge.createPlacemark('');

        // create the line string geometry
        var lineString = ge.createLineString('');
        lineStringPlacemark.setGeometry(lineString);
        lineStringPlacemark.setStyleSelector(ge.createStyle(''));
        lineStringPlacemark.getStyleSelector().getLineStyle().getColor().set('8800ffff');  // aabbggrr format
        lineStringPlacemark.getStyleSelector().getLineStyle().setWidth(3);
        lineString.setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND);

        var lineCoord = lineString.getCoordinates();

        // styles will be filled by annotation Store changes and marks will be updated
        this.styleMaps = [];
        this.styleMaps[-1] = this.getStyleMap('yellow');

        var placemark, point, ts;
        this.placemarks = [];
        rows.forEach(function(row) {
           placemark = ge.createPlacemark('');
           ts = ge.createTimeStamp('');
           ts.getWhen().set(row.date_time.toISOString());
           placemark.setTimePrimitive(ts);
           placemark.setStyleSelector(me.styleMaps[-1]);

           point = ge.createPoint('');
           point.setLatLngAlt(row.latitude, row.longitude, row.altitude);
           point.setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND);
           point.setExtrude(true);
           point.setTessellate(true);
           placemark.setGeometry(point);

           lineCoord.pushLatLngAlt(row.latitude, row.longitude, row.altitude);

           ge.getFeatures().appendChild(placemark);
           me.placemarks.push({
               id: row.date_time.toISOString(),
               class_id: -1,
               placemark: placemark
           });
        });
        ge.getFeatures().appendChild(lineStringPlacemark);
    },
    clearFeatures: function() {
      var features = this.earth.getFeatures();
      var nodes = features.getChildNodes();
      var len = nodes.getLength()-1;
      for (var i = len; i > 0; i--) {
          features.removeChild(nodes.item(i))
      }
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
	      var me = this;
        // restore track to original color
        Ext.Array.forEach(this.placemarks, function(placemark) {
        	if (placemark.class_id != -1) {
        	    placemark.class_id = -1;
                placemark.placemark.setStyleSelector(me.styleMaps[-1]);
        	}
        });

		this.getAnnotationStore().each(this.annotate, this);
	  },
	  dateFocus: function(date) {
	      var earth_time = this.earth.getTime();
	      // can only set time primitive after kml has loaded.
          var t = earth_time.getTimePrimitive();
          if (t.getType() != 'KmlTimeSpan') {
              t = earth_time.getControl().getExtents();
          }
          t.getEnd().set(date.toISOString());
          earth_time.setTimePrimitive(t);
	  },
      destroy: function() {
          this.getTrackStore().un('load', this.loadData, this);
          this.mixins.bindable.bindStore(null);
          this.callParent();
      }
});
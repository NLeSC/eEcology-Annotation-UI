Ext.define("TrackAnnot.view.GoogleEarth", {
    extend: 'Ext.Component',
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
        'Ext.data.StoreManager'
    ],
    earth: null,
    config: {
        earthLayers: {
            LAYER_BUILDINGS: true,
            LAYER_TREES: true,
            LAYER_TERRAIN: true
        },
        earthOptions: {
            setStatusBarVisibility: false,
            setAtmosphereVisibility: true,
            setMouseNavigationEnabled: true
        },
        trackStore: 'Track',
        annotationStore : 'Annotations',
        /**
         * Altitude under which the points will be clamped to ground
         */
        clipAltitude: 10
    },
    constructor : function(config) {
        this.callParent(arguments);
        this.initConfig(config);
    },
    initComponent : function() {
        this.callParent(arguments);
        this.addEvents(['earthLoaded']);
        // TODO when marker is clicked on map then focus date to that markers date.
        this.placemarks = [];
    },
    afterFirstLayout : function() {
        google.earth.createInstance(this.getEl().dom, Ext.bind(this.onEarthReady, this), Ext.bind(this.onEarthFailure, this));
    },
    onEarthReady: function(earth) {
        this.earth = earth;
        this.earth.getWindow().setVisibility(true);
        this.earth.getNavigationControl().setVisibility(this.earth.VISIBILITY_AUTO);
        this.earth.getTime().getControl().setVisibility(this.earth.VISIBILITY_AUTO);
        this.setLayers(this.earthLayers);
        this.setOptions(this.earthOptions);
        this.fireEvent('earthLoaded', this);
    },
    setLayers: function(layers) {
        var me = this;
        var root = this.earth.getLayerRoot();
        Ext.Object.each(layers, function(layerId, visibility) {
            root.enableLayerById(me.earth[layerId], visibility);
        });
    },
    setOptions: function(options) {
        var geopt = this.earth.getOptions();
        Ext.Object.each(options, function(optionFunc, args) {
            geopt[optionFunc](args);
        });
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
    getStyleMap: function(color, normalAlpha, highlightAlpha) {
        var ge = this.earth;
        // Convert rgb(rr, gg, bb) to bbggrr
        color = d3.rgb(color);
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

        var lat = d3.mean(rows, function(d) { return d.lat;});
        var lon = d3.mean(rows, function(d) { return d.lon;});

        ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
        var lookAt = ge.createLookAt('');
        lookAt.set(lat, lon, 100, ge.ALTITUDE_RELATIVE_TO_GROUND, 0, 60, 40000);
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
           placemark = ge.createPlacemark(row.date_time.toISOString());
           ts = ge.createTimeStamp('');
           ts.getWhen().set(row.date_time.toISOString());
           placemark.setTimePrimitive(ts);
           placemark.setStyleSelector(me.styleMaps[-1]);

           point = ge.createPoint('');
           point.setLatLngAlt(row.lat, row.lon, row.altitude);
           if (row.altitude < this.clipAltitude) {
               point.setAltitudeMode(ge.ALTITUDE_CLAMP_TO_GROUND);
               lineCoord.pushLatLngAlt(row.lat, row.lon, 0);
           } else {
               point.setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND);
               lineCoord.pushLatLngAlt(row.lat, row.lon, row.altitude);
           }
           point.setExtrude(true);
           point.setTessellate(true);
           placemark.setGeometry(point);


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
          features.removeChild(nodes.item(i));
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

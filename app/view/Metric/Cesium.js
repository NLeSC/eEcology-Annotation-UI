Ext.define('TrackAnnot.view.Metric.Cesium', {
    extend: 'Ext.Component',
    alias: 'widget.cesium',
    mixins : {
        bindable : 'Ext.util.Bindable'
    },
    requires : ['Ext.data.StoreManager'],
    viewer: null,
    annotationSegments: null,
    annotationId2Segments: {},
    positions: [],
    config: {
        time: null,
        currentMarkerIconUrl: "http://maps.google.com/mapfiles/kml/pal4/icon50.png",
        trackColor: '#bbbb33',
        trackColorAlpha: 200,
        trackWallColorAlpha: 100,
        trackWidth: 2.0,
        annotationWidth: 8.0,
        trackStore: 'Track',
        annotationStore : 'Annotations',
        bingMapsKey: 'AulxzgIzcGgz3Naz5gpUG8INt63d-oNLv2OhmeeSvXV3xa_qOi6quDpzK1EoYTI3',
        viewerOptions: {
            timeline: false,
            animation: false,
            fullscreenButton: false,
            automaticallyTrackDataSourceClocks: false,
            homeButton: false,
            geocoder: false
        }
    },
    constructor : function(config) {
        this.callParent(arguments);
        this.initConfig(config);
    },
    updateBingMapsKey: function(key) {
        Cesium.BingMapsApi.defaultKey = key;
    },
    initComponent : function() {
        this.callParent(arguments);
        this.annotationSegments = new Cesium.PolylineCollection();
        this.wallPrimitive = null;
    },
    afterComponentLayout : function(w, h){
        this.callParent(arguments);
        this.redraw();
    },
    redraw: function(){
        if (this.viewer) {
            this.viewer.resize();
        }
    },
    applyTrackStore: function(store) {
        store = Ext.data.StoreManager.lookup(store);
        store.on('load', this.loadData, this);
        return store;
    },
    applyAnnotationStore: function(store) {
        store = Ext.data.StoreManager.lookup(store);
        this.bindStore(store);
        return store;
    },
    afterRender : function() {
        var dom = this.getEl().dom;
        this.viewerOptions.terrainProvider = new Cesium.CesiumTerrainProvider({
            url: '//cesiumjs.org/stk-terrain/tilesets/world/tiles',
            credit: '© Analytical Graphics, Inc., CGIAR-CSI'
        });
        this.viewer = new Cesium.Viewer(dom, this.viewerOptions);
        this.viewer.scene.primitives.add(this.annotationSegments);
    },
    loadData : function(trackStore, rows) {
        var me = this;
        var ellipsoid = this.viewer.centralBody.ellipsoid;

        this.positions = [];
        var cPositions = [];
        rows.forEach(function(item, index) {
            me.positions.push(ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(item.lon, item.lat, item.altitude)));
            cPositions.push(item.date_time.toISOString(), item.lon, item.lat, item.altitude);
        });

        this.centerOnTrack();

        var trackRGB = d3.rgb(this.trackColor);
        var start = trackStore.getStart().toISOString();
        var end = trackStore.getEnd().toISOString();
        var builtInCzml = [{
            "id" : "tracker",
            "availability" : start+'/'+end,
            "billboard" : {
                "eyeOffset" : {
                    "cartesian" : [0.0, 0.0, 0.0]
                },
                "horizontalOrigin" : "CENTER",
                "image" : this.currentMarkerIconUrl,
                "pixelOffset" : {
                    "cartesian2" : [0.0, 0.0]
                },
                "scale" : 0.8333333333333334,
                "show" : [{
                    "interval" : start+'/'+end,
                    "boolean" : true
                }],
                "verticalOrigin" : "CENTER"
            },
            "path":{
                "color":[
                  {
                    "rgba":[
                       trackRGB.r, trackRGB.g, trackRGB.b, this.trackColorAlpha
                    ]
                  }
                ],
                "outlineWidth":0.0,
                "width":[
                  {
                    "number": this.trackWidth
                  }
                ],
                "show":[
                  {
                    "boolean":true
                  }
                ]
              },
            "position" : {
                "cartographicDegrees" : cPositions
            }
        }];

        czmlDataSource = new Cesium.CzmlDataSource();
        czmlDataSource.load(builtInCzml, 'source');
        this.viewer.dataSources.removeAll();
        this.viewer.dataSources.add(czmlDataSource);

        var wallColor = Cesium.Color.fromCssColorString(this.trackColor);
        wallColor.alpha = this.trackWallColorAlpha / 255.0;
        var wall = new  Cesium.GeometryInstance({
            geometry: new Cesium.WallGeometry({
                positions: me.positions
            }),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(wallColor)
            }
        });

        this.viewer.scene.primitives.remove(this.wallPrimitive);
        this.wallPrimitive = new Cesium.Primitive({
            geometryInstances: [wall],
            appearance: new Cesium.PerInstanceColorAppearance({
                translucent: true
            })
        });
        this.viewer.scene.primitives.add(this.wallPrimitive);

        this.redrawAnnotations();
    },
    bindStore : function(store) {
        var me = this;
        me.mixins.bindable.bindStore.apply(me, arguments);
    },
    getStoreListeners : function() {
        return {
            load : this.loadAnnotations,
            update : this.updateAnnotation,
            add : this.addAnnotations,
            remove : this.removeAnnotation,
            clear : this.removeAllAnnotations
        };
    },
    loadAnnotations: function(store, records) {
        this.annotationSegments.removeAll();
        records.forEach(this.addAnnotation, this);
    },
    getPositionsOfAnnotation: function(record) {
        var startIndex = this.getTrackStore().closestIndex(record.data.start);
        var endIndex = this.getTrackStore().closestIndex(record.data.end) + 1;
        return this.positions.slice(startIndex, endIndex + 1);
    },
    addAnnotations: function(store, records) {
        var me = this;
        records.forEach(function(record) {
            me.addAnnotation(record);
        });
    },
    addAnnotation: function(record) {
        this.annotationId2Segments[record.id] = this.annotationSegments.add({
            positions: this.getPositionsOfAnnotation(record),
            width: this.annotationWidth,
            material : Cesium.Material.fromType('Color', {
                color : Cesium.Color.fromCssColorString(record.data.classification.color)
            })
        });
    },
    getAnnotationSegment: function(record) {
        return this.annotationId2Segments[record.id];
    },
    updateAnnotation: function(store, record) {
        var annotationSegment = this.getAnnotationSegment(record);
        annotationSegment.positions = this.getPositionsOfAnnotation(record);
        annotationSegment.material =  Cesium.Material.fromType('Color', {
            color : Cesium.Color.fromCssColorString(record.data.classification.color)
        });
    },
    removeAnnotation: function(store, record) {
        var annotationSegment = this.getAnnotationSegment(record);
        this.annotationSegments.remove(annotationSegment);
    },
    removeAllAnnotations: function() {
        this.annotationSegments.removeAll();
    },
    redrawAnnotations: function() {
        // new data force redraw of annotations
        this.removeAllAnnotations();
        var astore = this.getAnnotationStore();
        this.addAnnotations(astore, astore.data.items);
    },
    dateFocus: function(current) {
        if (this.positions.length == 0) {
            return;
        }
        this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(current, Cesium.TimeStandard.UTC);
    },
    destroy: function() {
        this.getTrackStore().un('load', this.loadData, this);
        this.mixins.bindable.bindStore(null);
        this.viewer.destroy();
        this.callParent();
    },
    centerOnTrack: function() {
        var scene = this.viewer.scene;
        var ellipsoid = this.viewer.centralBody.ellipsoid;
        var trackStore = this.getTrackStore();
        var latExtent = trackStore.getLatitudeExtent();
        var lonExtent = trackStore.getLongitudeExtent();
        scene.camera.viewExtent(Cesium.Extent.fromDegrees(
            lonExtent[0], latExtent[0],
            lonExtent[1], latExtent[1]
        ), ellipsoid);
    }
});
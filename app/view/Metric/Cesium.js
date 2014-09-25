/**
 * Plot track on Cesium Globe and any annotations
 */
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
        //currentMarkerIconUrl: "http://maps.google.com/mapfiles/kml/pal4/icon50.png",
//        currentMarkerIconUrl: 'data:image/png;base64,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',
        // source http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_red.png
        currentMarkerIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAUCAYAAAC58NwRAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHESURBVHjajJI/LENRFMZP+96j2qIkNFENwkAMQiIREhIMGBg6MBhFgsFGBxazSVKRGAxisFktFolIhPgXOqBSJIikVKWt6ru+8/peQhU9ye/l3XO+795z/5joe7SCIVCjj6/AOthO05EJLABRIMuis6hEdAOHrAjOgSUgfTX4uDDuqhL3rT1CdHk0Htt6xWR5tWFaJt3VDhYnyqrIV99MdgkpVYVEkE3JoZ5SN4XfY7QbDjVBt2PGZ9AGkbeylij5kRIbwf8fCZpGrVBWOONhQ2WD3UHledbvYiOESs7cPGrMd/DIzYZkTE1qLfwegjQNpmTD6eHrMx1FwtiR9FNrlugctf1wiEd+NqyikZj34gSLYBWT6cthp/69lyeUECLBWp7yCTxfRN/6gtE3GnC6tb61kGQa8x/Q2sMtj6bAhtHDHi9+GHnpcKCtlmInZjfTyl2AZgNnXJ8Hc5l2t8U3fYsLi7T3C1euhU9iHyiGIH2X/riqjtglhYLxKFq54dwo5/84QtqssFhFnTWfZz/W39mfMay/HWaGsogK8K4bmrMx8N0EAG6SCtKLcgYDX8IDiOmmfw0cId1I2RqugS1T4VOAAQDkdp2PrH9XuAAAAABJRU5ErkJggg==',
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
            geocoder: false,
            navigationHelpButton: false
        },
        annotatePoints: true,
        annotateLine: true,
        /**
         * Toggles for which items to draw on screen
         */
        toggles: {
            current: true,
            line: true,
            points: true,
            wall: true
        }
    },
    constructor : function(config) {
        this.callParent(arguments);
        this.annotationSegments = new Cesium.PolylineCollection();
        this.wallPrimitive = null;
        this.pointBillboards = [];
        this.initConfig(config);
    },
    updateBingMapsKey: function(key) {
        Cesium.BingMapsApi.defaultKey = key;
    },
    initComponent : function() {
        this.callParent(arguments);
        this.addEvents('pointclick');
    },
    afterComponentLayout : function(w, h) {
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
        var defaultTerrainProvider = new Cesium.CesiumTerrainProvider({
            url: '//cesiumjs.org/stk-terrain/tilesets/world/tiles'
        });
        this.viewer = new Cesium.Viewer(dom, this.viewerOptions);
        this.viewer.scene.primitives.add(this.annotationSegments);
        this.viewer.scene.terrainProvider = defaultTerrainProvider;
        this.viewer.clock.shouldAnimate = false;
    },
    loadData : function(trackStore, rows) {
        var me = this;

        this.positions = [];
        me.czmlPositions = [];
        var groundLevels = [];
        rows.forEach(function(item) {
            me.positions.push(Cesium.Cartesian3.fromDegrees(item.lon, item.lat, item.altitude));
            me.czmlPositions.push(item.date_time.toISOString(), item.lon, item.lat, item.altitude);
            groundLevels.push(item.ground_elevation);
        });

        this.centerOnTrack();

        this.drawCurrentAndLine();

        this.drawWall(groundLevels);

        this.drawPoints();

        this.redrawAnnotations();
    },
    drawCurrentAndLine: function() {
        var trackRGB = d3.rgb(this.getTrackColor());
        var trackStore = this.getTrackStore();
        var start = trackStore.getStart().toISOString();
        var end = trackStore.getEnd().toISOString();
        var showCurrent = this.getToggles().current;
        var showLine = this.getToggles().line;
        var builtInCzml = [{
            "id": "document",
            "version": "1.0"
        }, {
            "id" : "tracker",
            "availability" : start+'/'+end,
            "billboard" : {
                "eyeOffset" : {
                    "cartesian" : [0.0, 0.0, 8.0]
                },
                "horizontalOrigin" : "CENTER",
                "image" : this.getCurrentMarkerIconUrl(),
                "pixelOffset" : {
                    "cartesian2" : [0.0, 0.0]
                },
                "scale" : 1.2,
                "show" : [{
                    "interval" : start+'/'+end,
                    "boolean" : showCurrent
                }],
                "verticalOrigin" : "BOTTOM"
            },
            "path":{
                "material": {
                    "solidColor": {
                        "color":[{
                            "rgba":[
                                trackRGB.r, trackRGB.g, trackRGB.b, this.getTrackColorAlpha()
                            ]
                        }]
                    }
                },
                "outlineWidth":10.0,
                "width":[
                  {
                    "number": this.getTrackWidth()
                  }
                ],
                "show":[
                  {
                    "boolean": showLine
                  }
                ]
            },
            "position" : {
                "cartographicDegrees" : this.czmlPositions
            }
        }];

        var czmlDataSource = new Cesium.CzmlDataSource();
        czmlDataSource.load(builtInCzml, 'source');
        this.viewer.dataSources.removeAll();
        this.viewer.dataSources.add(czmlDataSource);
    },
    getCurrentMarker: function() {
        if (this.viewer) {
            var czmlDataSource = this.viewer.dataSources.get(0);
            if (czmlDataSource) {
                var entity = czmlDataSource.entities.getById('tracker');
                return entity.billboard;
            }
        }
        return null;
    },
    toggleCurrent: function(shown) {
        if (shown === undefined) {
            return this.getToggles().current;
        }
        this.getToggles().current = shown;
        var currentMarker = this.getCurrentMarker();
        if (currentMarker) {
            currentMarker.show.intervals.get(0).data = shown;
        }
    },
    getLine: function() {
        if (this.viewer) {
            var czmlDataSource = this.viewer.dataSources.get(0);
            if (czmlDataSource) {
                var entity = czmlDataSource.entities.getById('tracker');
                return entity.path;
            }
        }
        return null;
    },
    toggleLine: function(shown) {
        if (shown === undefined) {
            return this.getToggles().line;
        }
        this.getToggles().line = shown;
        var line = this.getLine();
        if (line) {
            line.show.setValue(shown);
        }
    },
    drawWall: function(groundLevels) {
        var wallColor = Cesium.Color.fromCssColorString(this.getTrackColor());
        wallColor.alpha = this.getTrackWallColorAlpha() / 255.0;
        var wall = new Cesium.GeometryInstance({
            geometry: new Cesium.WallGeometry({
                positions: this.positions,
                minimumHeights: groundLevels
            }),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(wallColor)
            }
        });
        if (this.wallPrimitive !== null) {
            this.viewer.scene.primitives.remove(this.wallPrimitive);
        }
        var showWall = this.getToggles().wall;
        this.wallPrimitive = new Cesium.Primitive({
            geometryInstances: [wall],
            appearance: new Cesium.PerInstanceColorAppearance({
                translucent: true
            }),
            show: showWall
        });
        this.viewer.scene.primitives.add(this.wallPrimitive);
    },
    getWall: function() {
        return this.wallPrimitive;
    },
    toggleWall: function(shown) {
        if (shown === undefined) {
            return this.getToggles().wall;
        }
        this.getToggles().wall = shown;
        if (this.wallPrimitive) {
            this.wallPrimitive.show = shown;
        }
    },
    getPointBillboards: function() {
        return this.pointBillboards;
    },
    drawPoints: function() {
        var me = this;
        var canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        var context2D = canvas.getContext('2d');
        context2D.beginPath();
        context2D.arc(8, 8, 8, 0, Cesium.Math.TWO_PI, true);
        context2D.closePath();
        context2D.fillStyle = 'rgb(255, 255, 255)';
        context2D.fill();

        var color = Cesium.Color.fromCssColorString(this.getTrackColor());
        var scene = this.viewer.scene;
        if (this.pointsPrimitive !== null) {
            this.viewer.scene.primitives.remove(this.pointsPrimitive);
        }
        this.pointsPrimitive = scene.primitives.add(new Cesium.BillboardCollection());
        this.pointBillboards = [];
        var showPoints = this.getToggles().points;
        this.positions.forEach(function(position, index) {
            var pointBillboard = me.pointsPrimitive.add({
                id: new Date(me.czmlPositions[index*4]),
                image: canvas,
                position: position,
                scale: 0.7,
                color: color,
                show: showPoints
            });
            me.pointBillboards.push(pointBillboard);
        });

        // When point is clicked fire a pointclick event
        handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        handler.setInputAction(
            function (event) {
                var pickedObject = scene.pick(event.position);
                if (Cesium.defined(pickedObject) && pickedObject.id instanceof Date) {
                    var dt = pickedObject.id;
                    me.fireEvent('pointclick', dt, me);
                }
            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK
        );
    },
    togglePoints: function(shown) {
        if (shown === undefined) {
            return this.getToggles().points;
        }
        this.getToggles().points = shown;
        this.pointBillboards.forEach(function(point) {
            point.show = shown;
        });
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
    getPointsOfAnnotation: function(record) {
        var startIndex = this.getTrackStore().closestIndex(record.data.start);
        var endIndex = this.getTrackStore().closestIndex(record.data.end);
        return this.pointBillboards.slice(startIndex, endIndex + 1);
    },
    addAnnotations: function(store, records) {
        var me = this;
        records.forEach(function(record) {
            me.addAnnotation(record);
        });
    },
    addAnnotation: function(record) {
        var color = Cesium.Color.fromCssColorString(record.data.classification.color);
        if (this.getAnnotateLine()) {
            this.annotationId2Segments[record.id] = this.annotationSegments.add({
                positions: this.getPositionsOfAnnotation(record),
                width: this.annotationWidth,
                material: Cesium.Material.fromType('Color', {
                    color: color
                })
            });
        }
        if (this.getAnnotatePoints()) {
            var points = this.getPointsOfAnnotation(record);
            points.forEach(function(point) {
                point.color = color;
            });
        }
    },
    getAnnotationSegment: function(record) {
        return this.annotationId2Segments[record.id];
    },
    updateAnnotation: function(store, record) {
        if (this.getAnnotateLine()) {
            var annotationSegment = this.getAnnotationSegment(record);
            annotationSegment.positions = this.getPositionsOfAnnotation(record);
            annotationSegment.material =  Cesium.Material.fromType('Color', {
                color : Cesium.Color.fromCssColorString(record.data.classification.color)
            });
        }

        if (this.getAnnotatePoints()) {
            // if annotation was made smaller, then need to change points outside annotation to default color
            // but dont know which points so redraw all points
            this.redrawAnnotationsAsPoints();
        }
    },
    removeAnnotation: function(store, record) {
        if (this.getAnnotateLine()) {
            var annotationSegment = this.getAnnotationSegment(record);
            this.annotationSegments.remove(annotationSegment);
            delete(this.annotationId2Segments[record.id]);
        }
        if (this.getAnnotatePoints()) {
            var defaultColor = Cesium.Color.fromCssColorString(this.getTrackColor());
            var points = this.getPointsOfAnnotation(record);
            points.forEach(function(point) {
                point.color = defaultColor;
            });
        }
    },
    removeAllAnnotations: function() {
        this.annotationSegments.removeAll();
        this.annotationId2Segments = {};
        var defaultColor = Cesium.Color.fromCssColorString(this.getTrackColor());
        this.pointBillboards.forEach(function(point) {
            point.color = defaultColor;
        });
    },
    redrawAnnotations: function() {
        // new data force redraw of annotations
        this.removeAllAnnotations();
        var astore = this.getAnnotationStore();
        this.addAnnotations(astore, astore.data.items);
    },
    redrawAnnotationsAsPoints: function() {
        var astore = this.getAnnotationStore();
        var defaultColor = Cesium.Color.fromCssColorString(this.getTrackColor());
        if (!this.pointBillboards) {
            return;
        }
        this.pointBillboards.forEach(function(point) {
            var label = astore.getClassificationAtDateTime(point.id);
            if (label) {
                point.color = Cesium.Color.fromCssColorString(label.color);
            } else {
                point.color = defaultColor;
            }
         });
    },
    toggleAnnotateLine: function(val) {
        if (val === undefined) {
            return this.getAnnotateLine();
        }
        return this.setAnnotateLine(val);
    },
    toggleAnnotatePoints: function(val) {
        if (val === undefined) {
            return this.getAnnotatePoints();
        }
        return this.setAnnotatePoints(val);
    },
    updateAnnotateLine: function(newVal, oldVal) {
        this.redrawAnnotations();
    },
    updateAnnotatePoints: function(newVal, oldVal) {
        this.redrawAnnotations();
    },
    dateFocus: function(current) {
        if (this.positions.length === 0) {
            return;
        }
        this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(current);
    },
    destroy: function() {
        this.getTrackStore().un('load', this.loadData, this);
        this.mixins.bindable.bindStore(null);
        this.viewer.destroy();
        this.callParent();
    },
    centerOnTrack: function() {
        var scene = this.viewer.scene;
        var trackStore = this.getTrackStore();
        var latExtent = trackStore.getLatitudeExtent();
        var lonExtent = trackStore.getLongitudeExtent();
        scene.camera.viewRectangle(Cesium.Rectangle.fromDegrees(
            lonExtent[0], latExtent[0],
            lonExtent[1], latExtent[1]
        ));
    }
});

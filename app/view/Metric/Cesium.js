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
    groundLevels: [],
    config: {
        time: null,
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
            navigationInstructionsInitiallyVisible: false,
            navigationHelpButton: true
        },
        annotatePoints: true,
        annotateLine: false,
        /**
         * Toggles for which items to draw on screen
         */
        toggles: {
            current: true,
            line: true,
            points: true,
            wall: true
        },
        enableLighting: false
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
    getTrackColorAsHex: function() {
       return this.getTrackColor().substr(1);
    },
    setTrackColorAsHex: function(hex) {
      this.setTrackColor('#' + hex);
      // redraw when Cesium widget is rendered and there is a track loaded
      if (this.viewer && this.positions.length) {
        this.drawAll();
      }
    },
    afterRender : function() {
        var dom = this.getEl().dom;
        this.viewer = new Cesium.Viewer(dom, this.viewerOptions);
        this.viewer.scene.primitives.add(this.annotationSegments);
        // overwrite STK World Terrain so it does not have a water mask
        this.viewer.baseLayerPicker.viewModel.terrainProviderViewModels[1] = new Cesium.ProviderViewModel({
            name : 'STK World Terrain meshes',
            iconUrl : Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/STK.png'),
            tooltip : 'High-resolution, mesh-based terrain for the entire globe. Free for use on the Internet. Closed-network options are available.\nhttp://www.agi.com',
            creationFunction : function() {
                return new Cesium.CesiumTerrainProvider({
                    url : '//assets.agi.com/stk-terrain/world',
                    requestWaterMask : false,
                    requestVertexNormals : true
                });
            }
        });
        // select 'STK World Terrain meshes' by default
        this.viewer.baseLayerPicker.viewModel.selectedTerrain = this.viewer.baseLayerPicker.viewModel.terrainProviderViewModels[1];
        this.viewer.clock.shouldAnimate = false;
        this.viewer.scene.globe.enableLighting = this.enableLighting;
    },
    loadData : function(trackStore, rows) {
        var me = this;

        this.positions = [];
        this.czmlPositions = [];
        this.groundLevels = [];
        rows.forEach(function(item) {
            me.positions.push(Cesium.Cartesian3.fromDegrees(item.lon, item.lat, item.altitude));
            me.czmlPositions.push(item.date_time.toISOString(), item.lon, item.lat, item.altitude);
            me.groundLevels.push(item.ground_elevation);
        });

        this.centerOnTrack();

        this.drawAll();
    },
    drawAll: function() {
      this.drawCurrentAndLine();

      this.drawWall();

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
    drawWall: function() {
        var wallColor = Cesium.Color.fromCssColorString(this.getTrackColor());
        wallColor.alpha = this.getTrackWallColorAlpha() / 255.0;
        var wall = new Cesium.GeometryInstance({
            geometry: new Cesium.WallGeometry({
                positions: this.positions,
                minimumHeights: this.groundLevels
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
    },
    updateEnableLighting: function(newVal) {
      if (this.viewer) {
        var viewer = this.viewer;
        viewer.scene.globe.enableLighting = newVal;
      }
    }
});

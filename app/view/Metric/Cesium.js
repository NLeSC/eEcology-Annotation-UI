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
            geocoder: false,
            navigationHelpButton: false
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
        this.addEvents('pointclick');
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
        var cPositions = [];
        var groundLevels = [];
        rows.forEach(function(item, index) {
            me.positions.push(Cesium.Cartesian3.fromDegrees(item.lon, item.lat, item.altitude));
            cPositions.push(item.date_time.toISOString(), item.lon, item.lat, item.altitude);
            groundLevels.push(item.ground_elevation);
        });

        this.centerOnTrack();

        var trackRGB = d3.rgb(this.trackColor);
        var start = trackStore.getStart().toISOString();
        var end = trackStore.getEnd().toISOString();
        var builtInCzml = [{
        	"id": "document",
        	"version": "1.0"
        }, {
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
            	"material": {
            		"solidColor": {
                        "color":[{
						    "rgba":[
						        trackRGB.r, trackRGB.g, trackRGB.b, this.trackColorAlpha
						    ]
						}],
            		} 
            	},
                "outlineWidth":10.0,
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

        this.drawWall(groundLevels);
        
        this.drawPoints(cPositions);

        this.redrawAnnotations();
    },
    drawWall: function(groundLevels) {
        var wallColor = Cesium.Color.fromCssColorString(this.trackColor);
        wallColor.alpha = this.trackWallColorAlpha / 255.0;
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
        this.wallPrimitive = new Cesium.Primitive({
            geometryInstances: [wall],
            appearance: new Cesium.PerInstanceColorAppearance({
                translucent: true
            })
        });
        this.viewer.scene.primitives.add(this.wallPrimitive);
    },
    drawPoints: function(cPositions) {
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
    	
    	var color = Cesium.Color.fromCssColorString(this.trackColor);
        var scene = this.viewer.scene;
        this.points = scene.primitives.add(new Cesium.BillboardCollection());
        this.pointBillboards = [];
        this.positions.forEach(function(position, index) {
        	var pointBillboard = me.points.add({
        		id: new Date(cPositions[index*4]),
        		image: canvas,
        		position: position,
        		scale: 0.7,
        		color: color
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
        this.cPositions = cPositions;
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
        var endIndex = this.getTrackStore().closestIndex(record.data.end) + 1;
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
        this.annotationId2Segments[record.id] = this.annotationSegments.add({
            positions: this.getPositionsOfAnnotation(record),
            width: this.annotationWidth,
            material: Cesium.Material.fromType('Color', {
                color: color
            })
        });
        var points = this.getPointsOfAnnotation(record);
        points.forEach(function(point) {
        	point.color = color;
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
        
        // if annotation was made smaller, then need to change points outside annotation to default color
        // but dont know which points so redraw all points
        this.redrawAnnotationsAsPoints();
    },
    removeAnnotation: function(store, record) {
        var annotationSegment = this.getAnnotationSegment(record);
        this.annotationSegments.remove(annotationSegment);
        var defaultColor = Cesium.Color.fromCssColorString(this.trackColor);
        var points = this.getPointsOfAnnotation(record);
        points.forEach(function(point) {
        	point.color = defaultColor;
        });
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
    redrawAnnotationsAsPoints: function() {
    	 var astore = this.getAnnotationStore();
         //this.addAnnotations(astore, astore.data.items);
         var defaultColor = Cesium.Color.fromCssColorString(this.trackColor);
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
    dateFocus: function(current) {
        if (this.positions.length == 0) {
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
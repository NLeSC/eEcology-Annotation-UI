Ext.define('TrackAnnot.view.Metric.GoogleMap', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.googlemap',
    mixins : {
        bindable : 'Ext.util.Bindable'
    },
    requires : ['Ext.data.StoreManager'],
    map: null,
    markers: [],
    config: {
        time: null,
        markerColor: 'yellow',
        markerIconPath: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
        trackStore: 'Track',
        annotationStore : 'Annotations',
        mapOptions: {
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            zoom: 8
        }
    },
    constructor : function(config) {
        this.callParent(arguments);
        this.initConfig(config);
    },
    initComponent : function() {
        this.callParent(arguments);
        this.addEvents('focusDate');
    },
    afterComponentLayout : function(w, h){
        this.callParent(arguments);
        this.redraw();
    },
    redraw: function(){
        var map = this.map;
        if (map) {
            google.maps.event.trigger(map, 'resize');
        }
    },
    applyTrackStore: function(store) {
        store.on('load', this.loadData, this);
        return store;
    },
    applyAnnotationStore: function(store) {
        store = Ext.data.StoreManager.lookup(store);
        this.bindStore(store);
        return store;
    },
    afterFirstLayout : function() {
        this.map = new google.maps.Map(this.body.dom, this.mapOptions);
    },
    loadData : function(trackStore, rows) {
        var me = this;

        var latitude = d3.mean(rows, function(d) { return d.latitude});
        var longitude = d3.mean(rows, function(d) { return d.longitude});
        this.map.setCenter(new google.maps.LatLng(latitude, longitude));
                
        var polyOptions = {
            strokeColor: '#aaa',
            strokeOpacity: 0.4,
            strokeWeight: 3
        };
        var poly = new google.maps.Polyline(polyOptions);
        poly.setMap(this.map);
        var path = poly.getPath();
        
        this.markers = [];
        var marker, position;
        rows.forEach(function(row) {
            position = new google.maps.LatLng(row.latitude, row.longitude);
            path.push(position);
            marker = new google.maps.Marker({
               position: position,
               map: me.map,
               icon: {
                   path: me.markerIconPath,
                   strokeColor: me.markerColor,
                   scale: 2,
                   rotation: row.direction
               }
            });
            me.markers.push([row.date_time, marker]);
        });
    },
    bindStore : function(store) {
        var me = this;
        me.mixins.bindable.bindStore.apply(me, arguments);
    },
    getStoreListeners : function() {
        return {
            load : this.drawAnnotations,
            update : this.drawAnnotations,
            add : this.drawAnnotations,
            bulkremove : this.drawAnnotations,
            clear : this.drawAnnotations
        };
    },
    drawAnnotations : function() {
        var me = this;
        if (!this.markers.length) {
            return;
        }
        
        // remove all annotation colors
        this.markers.forEach(function(marker) {
            var icon = marker[1].getIcon();
            if (icon.strokeColor != me.markerColor) {
                icon.strokeColor = me.markerColor;
                marker[1].setIcon(icon);
            }
        });
        
        // per annotation color each marker
        this.getAnnotationStore().each(this.annotate, this);
    },
    annotate: function(record) {
        var start = record.data.start;
        var end = record.data.end;
        this.markers.forEach(function(marker) {
            var ts = marker[0];
            if (ts>=start && ts<=end) {
                var icon = marker[1].getIcon();
                icon.strokeColor = record.data.classification.color;
                marker[1].setIcon(icon);
            }
        });
    },
});
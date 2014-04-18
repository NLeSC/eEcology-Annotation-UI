Ext.define('TrackAnnot.view.Metric.GoogleMap', {
    extend: 'Ext.Component',
    alias: 'widget.googlemap',
    mixins : {
        bindable : 'Ext.util.Bindable'
    },
    requires : ['Ext.data.StoreManager'],
    map: null,
    markers: [],
    date2markers: {},
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
        // TODO when marker is clicked on map then focus date to that markers date.
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
        this.map = new google.maps.Map(dom, this.mapOptions);
    },
    loadData : function(trackStore, rows) {
        var me = this;

        var lat = d3.mean(rows, function(d) { return d.lat;});
        var lon = d3.mean(rows, function(d) { return d.lon;});
        this.map.setCenter(new google.maps.LatLng(lat, lon));

        var polyOptions = {
            strokeColor: '#aaa',
            strokeOpacity: 0.4,
            strokeWeight: 3
        };
        var poly = new google.maps.Polyline(polyOptions);
        poly.setMap(this.map);
        var path = poly.getPath();

        this.markers = [];
        this.date2markers = {};
        var marker, position;
        rows.forEach(function(row) {
            position = new google.maps.LatLng(row.lat, row.lon);
            path.push(position);
            marker = new google.maps.Marker({
               position: position,
               map: me.map,
               icon: {
                   path: me.markerIconPath,
                   strokeColor: me.markerColor,
                   scale: 1,
                   rotation: row.direction
               }
            });
            me.markers.push([row.date_time, marker]);
            me.date2markers[row.date_time] = marker;
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
    dateFocus: function(current) {
        if (this.markers.length == 0) {
            return;
        }
        if (this.oldCurrent) {
            var oldMarker = this.date2markers[this.oldCurrent];
            var oldIcon = oldMarker.getIcon();
            oldIcon.scale = 1;
            oldMarker.setIcon(oldIcon);
        }

        var newMarker = this.date2markers[current];
        var newIcon = newMarker.getIcon();
        newIcon.scale = 4;
        newMarker.setIcon(newIcon);

        this.oldCurrent = current;
    },
    destroy: function() {
        this.getTrackStore().un('load', this.loadData, this);
        this.mixins.bindable.bindStore(null);
        this.callParent();
    }
});
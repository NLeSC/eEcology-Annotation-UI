/**
 * 
 */
Ext.define("TrackAnnot.view.Metric.Properties", {
	extend: 'Ext.Panel',
    requires : ['Ext.data.StoreManager'],
    alias: 'widget.trackprops',
    autoScroll: true,
    tpl: [
       'DT: {[values.date_time.toISOString()]}, Lon: {lon}, Lat: {lat}, ',
       'Alt: {altitude}, Temp: {temperature}, ',
       'Ground: {ground_elevation}, ',
       'Instantaneous speed: {speed}, Instantaneous direction: {direction}, ',
       'Delta instantaneous direction: {delta_direction}, ',
       'Traject speed: {tspeed}, Traject direction: {tdirection}, ',
       'Acceleration: <tpl if="time_acceleration"><table>',
       '<tr><th>O</th><tpl for="time_acceleration"><td>{.}</td></tpl></tr>',
       '<tr><th>X</th><tpl for="x_acceleration"><td>{.}</td></tpl></tr>',
       '<tr><th>Y</th><tpl for="y_acceleration"><td>{.}</td></tpl></tr>',
       '<tr><th>Z</th><tpl for="z_acceleration"><td>{.}</td></tpl></tr>',
       '<tpl else>NA</tpl>'
    ],
    config: {
    	trackStore: 'Track'
    },
    constructor : function(config) {
        this.callParent(arguments);
        this.initConfig(config);
    },
    applyTrackStore: function(store) {
        store = Ext.data.StoreManager.lookup(store);
        return store;
    },
    dateFocus: function(current) {
    	var index = this.trackStore.closestIndex(current);
    	var data = this.trackStore.get(index);
    	this.update(data);
    }
});

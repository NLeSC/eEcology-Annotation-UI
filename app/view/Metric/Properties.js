/**
 *
 */
Ext.define("TrackAnnot.view.Metric.Properties", {
    extend: 'Ext.Panel',
    requires : ['Ext.data.StoreManager'],
    alias: 'widget.trackprops',
    autoScroll: true,
    tpl: [
       '<div>DT: {[values.date_time.toISOString()]}, Lon: {lon}, Lat: {lat}, ',
       'Alt: {altitude}, Temp: {temperature}, ',
       'Ground: {ground_elevation}, ',
       'Instantaneous speed: {speed}, Instantaneous direction: {idirection}, ',
       'Delta instantaneous direction: {delta_idirection}, ',
       'Traject speed: {tspeed}, Traject direction: {tdirection}, ',
       'Delta traject direction: {delta_tdirection}, ',
       'Acceleration: <tpl if="time_acceleration"><table>',
       '<tr><th>O</th><tpl for="time_acceleration"><td>{.}</td></tpl></tr>',
       '<tr><th>X</th><tpl for="x_acceleration"><td>{.}</td></tpl></tr>',
       '<tr><th>Y</th><tpl for="y_acceleration"><td>{.}</td></tpl></tr>',
       '<tr><th>Z</th><tpl for="z_acceleration"><td>{.}</td></tpl></tr>',
       '</table><tpl else>NA</tpl></div>',
       '<svg height="100" width="100">',
       '<polygon points="50,5 40,95 60,95" style="fill:none;stroke:steelblue;" transform="rotate({idirection} 50 50)"/>',
       '<polygon points="50,5 40,95 60,95" style="fill:none;stroke:chocolate;" transform="rotate({tdirection} 50 50)"/>',
       '</svg>'
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

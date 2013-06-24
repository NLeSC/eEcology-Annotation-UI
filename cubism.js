Ext.define('Esc.cubism.Chart', {
    extend : 'Ext.Component',
    initComponent: function() {
        this.callParent(arguments);

        this.addEvents(
            'focusDate'
        );
    },
    onResize: function(width, height, oldWidth, oldHeight) {
        if (oldWidth == undefined && oldHeight == undefined) {
            return;
        }
        this.draw();
    },
    afterRender: function() {
      this.draw();
    },
    draw: function() {
        console.log('drawing');
        var me = this;
        var context = cubism.context()
        .serverDelay(new Date(2011, 6, 28) - Date.now())
        .step(864e5)
        .size(1280)
        .stop();

        var dom = this.getEl().dom;

        d3.select(dom).selectAll(".axis")
	        .data(["top", "bottom"])
	      .enter().append("div")
	        .attr("class", function(d) { return d + " axis"; })
	        .each(function(d) { d3.select(this).call(context.axis().ticks(12).orient(d)); });

	    d3.select(dom).append("div")
	        .attr("class", "rule")
	        .call(context.rule());


	    me.data = [];
	    var format = d3.time.format("%Y-%m-%d %H:%M:%S");
	    d3.dsv(';', 'text/plain')('355.tracking.csv', function(rows) {
	        me.data = rows.map(function(d) { d.date_time = format.parse(d.date_time);return d;});
	        var metric_names = ["latitude", "longitude", "altitude","pressure","temperature","satellites_used","gps_fixtime","positiondop","h_accuracy",
            "v_accuracy","x_speed","y_speed","z_speed"
            ];
	        var metrics = metric_names.map(function(name) {
                return context.metric(function(start, stop, step, callback) {
                    var values = me.data
                                .filter(function(d) { return d.date_time > start && d.date_time < stop; })
                                .map(function(d) { return [d.date_time, d[name]] });
                    callback(null, values);
                    console.log(name, start, stop, step, values);
                }, name);
            });
	        d3.select(dom).selectAll(".horizon")
	        .data(metrics)
	      .enter().insert("div", ".bottom")
	        .attr("class", "horizon")
	      .call(context.horizon()
	        .format(d3.format("+,.2p")));
	    });

    }
});

Ext.onReady(function() {
    Ext.create('Ext.window.Window', {
        width : 1500,
        height : 500,
        title: 'Cubism charts',
        maximizable: true,
        x: 10,
        y: 10,
        autoShow: true,
        layout: 'fit',
        items: Ext.create('Esc.cubism.Chart')
    });
});

Ext.define('TrackAnnot.controller.Main', {
	extend : 'Ext.app.Controller',
	requires : ['Ext.window.Window',
	            "TrackAnnot.view.Timeline",
	            "TrackAnnot.view.Annotations",
			"TrackAnnot.view.Metric.Temperature",
			"TrackAnnot.view.Metric.Acceleration",
			'Ext.ux.GEarthPanel',
			"TrackAnnot.view.GoogleEarth",
			"TrackAnnot.view.Popcorn"
			],
    stores: [
             'Annotations'
    ],
	init : function() {
    	// There is no datetime field in ExtJS, so use a textfield with ISO 8601
    	// validator
    	Ext.apply(Ext.form.field.VTypes, {
    		// vtype validation function
    		datetime : function(val, field) {
    			return Ext.Date.parse(val, 'c', true) != null;
    		},
    		// vtype Text property: The error text to display when the
    		// validation function returns false
    		datetimeText : 'Not a valid date.  Must be in the ISO 8601 date format.',
    		// vtype Mask property: The keystroke filter mask
    		datetimeMask : /[\d\.,-:+TZ]/
    	});

		var initDates = [new Date('2010-06-28T00:00:33Z'),
				new Date('2010-06-29T00:35:33Z')];

		function timeFormat(formats) {
			return function(date) {
				var i = formats.length - 1, f = formats[i];
				while (!f[1](date))
					f = formats[--i];
				return f[0](date);
			};
		}
	    var customTimeFormat = timeFormat([
            [d3.time.format("%Y"), function() { return true; }],
            [d3.time.format("%B"), function(d) { return d.getMonth(); }],
            [d3.time.format("%b %d"), function(d) { return d.getDate() != 1; }],
            [d3.time.format("%x"), function(d) { return d.getDay() && d.getDate() != 1; }],
            [d3.time.format("%H:%M"), function(d) { return d.getHours(); }],
            [d3.time.format("%H:%M"), function(d) { return d.getMinutes(); }],
            [d3.time.format(":%S"), function(d) { return d.getSeconds(); }],
            [d3.time.format(".%L"), function(d) { return d.getMilliseconds(); }]
        ]);

		var agrid = Ext.create("TrackAnnot.view.Annotations");
		var awin = Ext.create('Ext.window.Window', {
			x : 20,
			y : 550,
			width : 840,
			height : 300,
			closable : false,
			title : 'Annotations',
			layout : 'fit',
			maximizable : true,
			collapsible : true,
			items : [agrid]
		});
		awin.show();

	    var twin = Ext.create('Ext.window.Window', {
            x: 880,
            y: 550,
            width : 980,
            height : 300,
            autoShow: true,
            title : 'Timeline',
            layout: 'fit',
            maximizable: true,
            collapsible: true,
            closable: false,
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                defaults: {
                    xtype: 'datetimefield',
                    width: 170,
                    labelAlign: 'top'
                },
                items: [{
                    fieldLabel: 'From',
                    id: 'from_date',
                    value: initDates[0],
                    validator: function(value) {
                        var t = Ext.getCmp('to_date').getValue();
                        var c = Ext.getCmp('current_time').getValue();
                        if (value > t) {
                            return 'From must be before To';
                        }
                        return true;
                    },
                    listeners: {
                        change: function(t, n, o) {
                            var date = new Date(n);
                            Ext.ComponentQuery.query('accelchart')[0].from(date);
                            Ext.ComponentQuery.query('tempchart')[0].from(date);
                            Ext.ComponentQuery.query('timeline')[0].setFromDate(date);

                            // keep current time inside visible range
                            var c = Ext.getCmp('current_time');
                            if (c.getValue() < date) {
                                c.setValue(date);
                            }
                        }
                    }
                }, {
                    fieldLabel: 'Current',
                    id: 'current_time',
                    value: initDates[0],
                    listeners: {
                        change: function(t, n, o) {
                            var date = new Date(n);
                            Ext.ComponentQuery.query('accelchart')[0].dateFocus(date);
                            Ext.ComponentQuery.query('tempchart')[0].dateFocus(date);
                            Ext.ComponentQuery.query('timeline')[0].dateFocus(date);

                            var earth_time = Ext.ComponentQuery.query('googleearth')[0].getEarth().getTime();
                            var t = earth_time.getTimePrimitive();
                            if (t.getType() != 'KmlTimeSpan') {
                                t = earth_time.getControl().getExtents();
                            }
                            t.getEnd().set(date.toISOString());
                            earth_time.setTimePrimitive(t);

                            var video = Ext.ComponentQuery.query('popcorn')[0];
                            var newValue = date.getTime();
                            var minValue = Ext.getCmp('from_date').getValue().getTime();
                            var maxValue = Ext.getCmp('to_date').getValue().getTime();
                            // video is much shorter than data from db
                            // scale video range to visible time range
                            var newct = video.pop.duration() * (newValue-minValue) / (maxValue-minValue);
                            video.pop.currentTime(newct);
                        }
                    }
                }, {
                    fieldLabel: 'To',
                    id: 'to_date',
                    value: initDates[1],
                    validator: function(value) {
                        var f = Ext.getCmp('from_date').getValue();
                        var c = Ext.getCmp('current_time').getValue();
                        if (value < f) {
                            return 'To must be after From';
                        }
                        return true;
                    },
                    listeners: {
                        change: function(t, n, o) {
                            var date = new Date(n);
                            Ext.ComponentQuery.query('accelchart')[0].to(date);
                            Ext.ComponentQuery.query('tempchart')[0].to(date);
                            Ext.ComponentQuery.query('timeline')[0].setToDate(date);

                            // keep current time inside visible range
                            var c = Ext.getCmp('current_time');
                            if (c.getValue() > date) {
                                c.setValue(date);
                            }
                        }
                    }
                }]
            }],
            items: [{
                xtype: 'timeline',
                lanes: 1,
                time: {
                    current: initDates[0],
                    start: initDates[0],
                    stop: initDates[1],
                    format: customTimeFormat
        	    },
        	    annotationStore: this.getAnnotationsStore(),
                listeners: {
                    boxready: function(t) {
                       t.draw();
                    }
                }
            }]
        });

	    var dateConfig = {
            start: initDates[0],
            stop: initDates[1],
            format: customTimeFormat
	    };

        var win = Ext.create('Ext.window.Window', {
            x: 20,
            y: 30,
            width : 800,
            height : 240,
    		closable: false,
            title : 'Temperature',
            layout: 'fit',
            maximizable: true,
            collapsible: true,
            items: [{
                xtype: 'tempchart',
                time: dateConfig,
                url: '../355.2010-06-28.csv',
                annotationStore: this.getAnnotationsStore(),
                listeners: {
                	focusDate: function(date) {
                		//Ext.ComponentQuery.query('accelchart')[0].dateFocus(date);
                	}
                }
            }]
        })
        win.show();

        var win2 = Ext.create('Ext.window.Window', {
        	x: 20,
            y: 290,
            width : 800,
            height : 240,
    		closable: false,
            collapsible: true,
            title : 'Accelerometers',
            layout: 'fit',
            maximizable: true,
            items: [{
                xtype: 'accelchart',
                time: dateConfig,
                url: '../355.2010-06-28.accel0.csv',
                annotationStore: this.getAnnotationsStore(),
                listeners: {
                    focusDate: function(date) {
                     //   Ext.ComponentQuery.query('tempchart')[0].dateFocus(date);
                    }
                }
            }]
        })
        win2.show();

    	win3 = Ext.create('Ext.window.Window', {
    		width : 500,
    		height : 500,
    		x: 840,
    		y: 30,
    		closable: false,
            collapsible: true,
    		title : 'GPS',
    		layout: 'fit',
    		maximizable: true,
    		items: [{
    			xtype: "googleearth",
    			time: dateConfig,
    			annotationStore: this.getAnnotationsStore(),
    			url: window.location.href + '../S355_museumplein.kml',
    			location: 'Amsterdam'
    		}]
    	});
    	win3.show();

		var win4 = Ext.create('Ext.window.Window', {
    		width : 500,
    		height : 500,
    		x: 1360,
    		y: 30,
    		closable: false,
    		collapsible: true,
    		title: 'Video',
    		layout: 'fit',
    		maximizable: true,
    		items: [{
    			xtype: 'popcorn',
    			startDate: initDates[0],
    			annotationStore: this.getAnnotationsStore(),
    			url: ["../92968607.mp4", "../92968607.webm"]
    		}]
    	});
    	win4.show();
	},
});

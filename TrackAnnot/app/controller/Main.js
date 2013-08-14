Ext.define('TrackAnnot.controller.Main', {
	extend : 'Ext.app.Controller',
	requires : ['Ext.window.Window',
	            "TrackAnnot.view.Timeline",
	            "TrackAnnot.view.Annotations",
    			"TrackAnnot.view.Metric.Temperature",
    			"TrackAnnot.view.Metric.Acceleration",
    			'Ext.ux.GEarthPanel',
    			"TrackAnnot.view.GoogleEarth",
    			"TrackAnnot.view.Popcorn",
    			'TrackAnnot.view.Classifications',
    			'TrackAnnot.api.Track',
    			'TrackAnnot.view.Metric.GoogleMap',
    			'TrackAnnot.view.Metric.Cesium',
    			],
    stores: ['Annotations', 'Classifications'],
	init : function() {
	    var me = this;
        this.control({
        	'annotations button[action=classes]': {
        	    click: this.showTypesPanel
        	},
        	'button[action=switch]': {
        	    click: function() {
        	        me.trackStore.load();
        	    }
        	}
        });


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


		var initDates = [new Date('2010-06-28T00:00:33Z'),
				new Date('2010-06-29T00:35:33Z')];
		var trackerId = 355;

		this.trackStore = Ext.create('TrackAnnot.api.Track', {
	        trackerId: trackerId,
	        start: initDates[0],
	        end: initDates[1],
	        format: customTimeFormat
		});

		var agrid = Ext.create("TrackAnnot.view.Annotations");
		var awin = Ext.create('Ext.window.Window', {
			x : 1220,
			y : 560,
			width : 500,
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
            x: 20,
            y: 560,
            width : 1180,
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
                    disabled: true,
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

//                            var video = Ext.ComponentQuery.query('popcorn')[0];
//                            var newValue = date.getTime();
//                            var minValue = Ext.getCmp('from_date').getValue().getTime();
//                            var maxValue = Ext.getCmp('to_date').getValue().getTime();
//                            // video is much shorter than data from db
//                            // scale video range to visible time range
//                            var newct = video.pop.duration() * (newValue-minValue) / (maxValue-minValue);
//                            video.pop.currentTime(newct);
                        }
                    }
                }, {
                    fieldLabel: 'To',
                    id: 'to_date',
                    disabled: true,
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
                }, {
                    xtype: 'button',
                    width: 16,
                    tooltip: 'Move current time to closest previous time point',
                    iconCls: 'x-tbar-page-prev',
                    handler: function() {
                        me.moveCurrentTime(-1);
                    }
                }, {
                    xtype: 'button',
                    width: 16,
                    tooltip: 'Move current time to closest next time point',
                    iconCls: 'x-tbar-page-next',
                    handler: function() {
                        me.moveCurrentTime(1);
                    }
                }]
            }],
            items: [{
                xtype: 'timeline',
                time: {
                    current: initDates[0],
                    start: initDates[0],
                    stop: initDates[1],
                    format: customTimeFormat
        	    },
        	    trackStore: this.trackStore,
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
            y: 40,
            width : 1180,
            height : 240,
    		closable: false,
            title : 'Temperature',
            layout: 'fit',
            maximizable: true,
            collapsible: true,
            items: [{
                xtype: 'tempchart',
                trackStore: this.trackStore,
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
            y: 300,
            width : 1180,
            height : 240,
    		closable: false,
            collapsible: true,
            title : 'Accelerometers',
            layout: 'fit',
            maximizable: true,
            items: [{
                xtype: 'accelchart',
                trackStore: this.trackStore,
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
    		x: 1220,
    		y: 40,
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
//    	win3.show();

    	var gmap = Ext.create('TrackAnnot.view.Metric.GoogleMap', {
    	    time: dateConfig,
            trackStore: this.trackStore,
            annotationStore: this.getAnnotationsStore(),
    	});
        win3b = Ext.create('Ext.window.Window', {
            width : 500,
            height : 500,
            x: 220,
            y: 40,
            closable: false,
            collapsible: true,
            title : 'Google Map',
            maximizable: true,
            layout: 'fit',
            border: false,
            items: gmap
        });
        win3b.show();

		var win4 = Ext.create('Ext.window.Window', {
    		width : 500,
    		height : 500,
    		x: 1360,
    		y: 40,
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
//    	win4.show();

		this.typesPanel = Ext.create('Ext.window.Window', {
			title: 'Classifications',
            width : 300,
            height : 500,
            x: 760,
            y: 340,
            layout: 'fit',
            closeAction: 'hide',
			items: [{
	            border: false,
			    xtype: 'classifications'
			}]
		});

		var classifications = [{
		    id: 1,
		    name: 'flying',
		    color: 'rgb(180, 112, 197)'
		}, {
            id: 2,
            name: 'sitting',
            color: 'rgb(112, 180, 197)'
        }, {
            id: 3,
            name: 'walking',
            color: 'rgb(197, 112, 110)'
        }, {
            id: 4,
            name: 'floating',
            color: 'rgb(117, 112, 180)'
		}];
		this.getClassificationsStore().loadRawData(classifications);
		this.getClassificationsStore().on('update', this.classificationsChanged, this);
	},
	showTypesPanel: function() {
		this.typesPanel.show();
	},
	/**
	 * When classifications are altered, this change is pushed to the annotations,
	 * but the annotation store did not see the change so
	 * force a update event for all annotations which had their classification changed.
	 */
	classificationsChanged: function(cstore, crecord) {
	    var astore = this.getAnnotationsStore();
	    var arecords = astore.query('class_id', crecord.data.id);
	    arecords.each(function(arecord) {
            astore.fireEvent('update', astore, arecord, Ext.data.Model.EDIT, ['classification']);
        });
	},
	moveCurrentTime: function(stepsize) {
	    var comp = Ext.getCmp('current_time');
	    var index = this.trackStore.closestIndex(comp.getValue());
	    current = this.trackStore.get(index+stepsize).date_time;
	    comp.setValue(current);
	}
});

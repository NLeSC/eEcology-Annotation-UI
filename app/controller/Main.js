Ext.define('TrackAnnot.controller.Main', {
	extend : 'Ext.app.Controller',
	requires : ['Ext.window.Window',
	            "TrackAnnot.view.window.Timeline",
    			"TrackAnnot.view.window.Temperature",
    			"TrackAnnot.view.window.Accelerometers",
    			"TrackAnnot.view.window.GoogleEarth",
    			'TrackAnnot.view.Classifications',
    			'TrackAnnot.view.window.Annotations',
    			'TrackAnnot.view.window.GoogleMap',
    			"TrackAnnot.view.window.Direction",
    			'TrackAnnot.view.window.Speed',
    			'TrackAnnot.view.window.Altitude',
    			'TrackAnnot.view.menu.Metric'
    			],
    stores: ['Annotations', 'Classifications', 'Track', 'Trackers'],
	init : function() {
	    var me = this;
	    this.addEvents('from_date_change',
	            'current_date_change',
	            'to_date_change',
	            'tracker_change'
	            );
        this.control({
        	'annotations': {
        	    classconfig: this.showTypesPanel,
        	    load: this.loadAnnotations,
        	    save: this.saveAnnotations
        	},
        	'button[action=loadTrack]': {
        	    click: me.loadTrack
        	},
        	'#prev_timepoint': {
        	    click: function() {
        	        me.moveCurrentTime(-1);
        	    }
        	},
            '#next_timepoint': {
                click: function() {
                    me.moveCurrentTime(1);
                }
            },
            '#prev_window': {
                click: this.onPrevWindow
            },
            '#zoom_in_window': {
                click: this.onZoomInWindow
            },
            '#zoom_out_window': {
                click: this.onZoomOutWindow
            },
            '#next_window': {
                click: this.onNextWindow
            },
            'timelinewindow': {
                currentDate: function(date) {
                    me.setCurrentTime(date);
                }
            },
            '#windows menuitem[action=resetlayout]': {
                click: this.resetLayoutConfirm
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
        this.customTimeFormat = timeFormat([
            [d3.time.format.utc("%Y"), function() { return true; }],
            [d3.time.format.utc("%B"), function(d) { return d.getUTCMonth(); }],
            [d3.time.format.utc("%b %d"), function(d) { return d.getUTCDate() != 1; }],
            [d3.time.format.utc("%x"), function(d) { return d.getUTCDay() && d.getUTCDate() != 1; }],
            [d3.time.format.utc("%H:%M"), function(d) { return d.getUTCHours(); }],
            [d3.time.format.utc("%H:%M"), function(d) { return d.getUTCMinutes(); }],
            [d3.time.format.utc(":%S"), function(d) { return d.getUTCSeconds(); }],
            [d3.time.format.utc(".%L"), function(d) { return d.getUTCMilliseconds(); }]
        ]);

        this.trackStore = this.getTrackStore().setFormat(this.customTimeFormat);

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
            id: 'floating',
            color: 'rgb(117, 112, 180)'
        }, {
            id: 'flying',
            color: 'rgb(180, 112, 197)'
        }, {
            id: 'sitting',
            color: 'rgb(112, 180, 197)'
        }, {
            id: 'standing',
            color: 'rgb(112, 180, 107)'
        }, {
            id: 'walking',
            color: 'rgb(197, 112, 110)'
		}];
		this.getClassificationsStore().loadRawData(classifications);
		this.getClassificationsStore().on('update', this.classificationsChanged, this);

		// set remote urls
		this.setupUrls('/aws/trackers', '/aws/tracker/{trackerId}/{start}/{end}');
		// For developing without server use demo data, by uncommenting below
		// this.setupUrls('demo/trackers.json', 'demo/tracker.json');

		// After track data is loaded set current time to start time.
        this.trackStore.on('load', function(store, data, isLoaded) {
            if (!isLoaded) {
                return;
            }
            if (store.getStart() < me.currentTime && me.currentTime < store.getEnd()) {
                me.setCurrentTime(me.currentTime);
            } else {
                me.setCurrentTime(store.getStart());
            }
        });
	},
	setupUrls: function(trackers, tracker) {
	    Ext.StoreMgr.get('Trackers').getProxy().url = trackers;
	    this.trackStore.setUrlTemplate(tracker);
	},
	setupWindows: function() {
	    /**
	     * All windows with metrics
	     */
        this.windows = [];

        this.addAnnotationsWindow();
        this.addTimelineWindow();

        this.registerMetricWindow("TrackAnnot.view.window.Accelerometers", {
            title: 'Accelerometers',  // Title of menuitem and window
            x: 20,
            y: 430,
            width : 1180,
            height : 140,
            autoShow: true // Show menu and check menuitem
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.Speed", {
            title: 'Speed',  // Title of menuitem and window
            x: 20,
            y: 300,
            width : 1180,
            height : 120,
            autoShow: true // Show menu and check menuitem
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.Altitude", {
            title: 'Altitude',  // Title of menuitem and window
            x: 20,
            y: 170,
            width : 1180,
            height : 120,
            autoShow: true // Show menu and check menuitem
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.Temperature", {
            title: 'Temperature',  // Title of menuitem and window
            x: 20,
            y: 40,
            width : 1180,
            height : 120,
            autoShow: true // Show menu and check menuitem
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.Direction", {
            title: 'Direction',  // Title of menuitem and window
            x: 20,
            y: 170,
            width : 1180,
            height : 120,
            autoShow: false // Show menu and check menuitem
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.GoogleEarth", {
            title: 'Google Earth',  // Title of menuitem and window
            width : 500,
            height : 530,
            x: 1220,
            y: 40,
            autoShow: true // Show menu and check menuitem
        }, function(chart, trackStore, currentTime) {
            chart.on('earthLoaded', function() {
                chart.loadData(trackStore, trackStore.data);
                chart.drawAnnotations();
                chart.dateFocus(currentTime);
            }, chart, {single: true});
        });

        this.registerMetricWindow("TrackAnnot.view.window.GoogleMap", {
            title: 'Google Map',  // Title of menuitem and window
            width : 500,
            height : 530,
            x: 1220,
            y: 40,
            autoShow: false // Show menu and check menuitem
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });
	},
	addAnnotationsWindow: function() {
        var annotations = Ext.create("TrackAnnot.view.window.Annotations", {
            x : 1220,
            y : 580,
            width : 500,
            height : 300
        });

        this.windows.push(annotations);
        var annotationsGrid =  annotations.getAnnotations();
        this.on('current_date_change', annotationsGrid.dateFocus, annotationsGrid);
	},
	addTimelineWindow: function() {
	    var timelineWindow = Ext.create('TrackAnnot.view.window.Timeline', {
	        x: 20,
	        y: 580,
	        width : 1180,
	        height : 300
	    });

        this.windows.push(timelineWindow);
        this.on('current_date_change', timelineWindow.dateFocus, timelineWindow);
	},
	registerMetricWindow: function(className, config, fill) {
	    Ext.apply(config, {
	        stateId: 'window-' + config.title
	    });
	    var me = this;
	    var menu = this.getViewport().getWindowsMenu();
	    var item = menu.add({
	       xtype: 'metricmenu',
	       text: config.title,
	       checked: config.autoShow,
	       stateId: 'menu-' + config.title,
	       listeners: {
	           checkchange: function(t, checked) {
	               var chart;
	               if (checked) {
	                   // construct it
	                   t.window = Ext.create(className, config);
                       t.window.show();
	                   // window can be closed with X -> unchecks menu item
                       t.window.on('close', function() {
                           t.setChecked(false);
                       });
	                   chart = t.window.getChart();
	                   me.on('current_date_change', chart.dateFocus, chart);
	                   // when there is data to show fill it.
	                   if (me.trackStore.data.length > 0) {
	                       fill(chart, me.trackStore, me.currentTime);
	                   }
	               } else {
	                   // destroy it
	                   chart = t.window.getChart();
	                   me.un('current_date_change', chart.dateFocus, chart);
	                   t.window.destroy();
	               }
	           }
	       }
	    });
	    if (item.checked) {
	        item.fireEvent('checkchange', item, true);
	    }
	},
	onLaunch: function() {
        this.setupWindows();

	    this.windows.forEach(function(w) {
	      w.show();
	    });

	    var trackerId = this.getTrackerId();
	    if (!trackerId.getValue()) {
	        trackerId.setValue(355);
	    }
	    var from = this.getFromDate();
	    if (!from.getValue()) {
	        from.setValue(new Date('2010-06-28T00:00:00.000Z'));
	    }
	    var to = this.getToDate();
	    if (!to.getValue()) {
	        to.setValue(new Date('2010-06-29T00:00:00.000Z'));
	    }
	},
	setCurrentTime: function(date) {
	    this.currentTime = date;
        this.fireEvent('current_date_change', date);
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
	    var index = this.trackStore.closestIndex(this.currentTime);
	    var current = this.trackStore.get(index+stepsize).date_time;
	    this.setCurrentTime(current);
	},
	getTrackerId: function() {
	    return Ext.ComponentQuery.query('#trackerId')[0];
	},
	getFromDate: function() {
	    return Ext.ComponentQuery.query('#from_date')[0];
	},
	getToDate: function() {
	    return Ext.ComponentQuery.query('#to_date')[0];
	},
	getFromTime: function() {
	    return this.getFromDate().getValue().getTime();
	},
    getToTime: function() {
        return this.getToDate().getValue().getTime();
    },
	setTrackRange: function(from ,to) {
        this.getFromDate().setValue(new Date(from));
        this.getToDate().setValue(new Date(to));
	},
	loadTrack: function(button) {
        var trackerId = this.getTrackerId().getValue();
        var start = this.getFromDate().getValue();
        var end = this.getToDate().getValue();

        this.trackStore.setConfig({
            trackerId: trackerId,
            start: start,
            end: end
        });
        button.setLoading(true);
        this.trackStore.on('load', function() {
            button.setLoading(false);
        }, this, {single: true});
        this.trackStore.on('loadFailure', function(error) {
            button.setLoading(false);
            Ext.Msg.show({
                title: 'Loading track failed',
                msg: error,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ALERT
           });
        }, this, {single: true});
        this.trackStore.load();
    },
    getViewport: function() {
        return Ext.ComponentQuery.query('viewport')[0];
    },
    loadAnnotations: function(grid) {
        var me = this;
        Ext.MessageBox.show({
            title: 'Load',
            msg: 'Please paste text below',
            width: 300,
            buttons: Ext.MessageBox.OKCANCEL,
            multiline: true,
            fn: function(btn, text) {
                if (btn == 'ok') {
                    var store = grid.getStore();
                    store.importText(text, me.trackStore);
                }
           }
        });
    },
    saveAnnotations: function(grid) {
        var store = grid.getStore();
        Ext.MessageBox.show({
           title: 'Save',
           msg: 'Please save text below',
           width: 300,
           buttons: Ext.MessageBox.OK,
           multiline: true,
           value: store.exportText(this.trackStore)
       });
    },
    resetLayoutConfirm: function() {
        var me = this;
        Ext.Msg.confirm('Reset layout', 'Reset the layout, will reload page', function(buttonId) {
            if (buttonId == 'yes') {
                me.resetLayout();
            }
        });
    },
    resetLayout: function() {
        var provider = Ext.state.Manager.getProvider();
        var data = provider.readLocalStorage();
        Ext.Object.each(data, function(d) {
           provider.clear(d);
        });
        window.location.reload();
    },
    onPrevWindow: function() {
        var ostart = this.getFromTime();
        var oend = this.getToTime();
        var start = ostart - (oend - ostart);
        var end = oend - (oend - ostart);
        this.setTrackRange(start, end);
    },
    onZoomInWindow: function() {
        var ostart = this.getFromTime();
        var oend = this.getToTime();
        var start = ostart + (oend - ostart) / 4;
        var end = oend - (oend - ostart) / 4;
        this.setTrackRange(start, end);
    },
    onZoomOutWindow: function() {
        var ostart = this.getFromTime();
        var oend = this.getToTime();
        var start = ostart - (oend - ostart) / 2;
        var end = oend + (oend - ostart) / 2;
        this.setTrackRange(start, end);
    },
    onNextWindow: function() {
        var ostart = this.getFromTime();
        var oend = this.getToTime();
        var start = ostart + (oend - ostart);
        var end = oend + (oend - ostart);
        this.setTrackRange(start, end);
    }
});

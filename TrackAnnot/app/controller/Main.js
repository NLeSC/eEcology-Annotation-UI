Ext.define('TrackAnnot.controller.Main', {
	extend : 'Ext.app.Controller',
	requires : ['Ext.window.Window',
	            "TrackAnnot.view.window.Timeline",
    			"TrackAnnot.view.window.Temperature",
    			"TrackAnnot.view.window.Accelerometers",
    			"TrackAnnot.view.window.GoogleEarth",
    			'TrackAnnot.view.Classifications',
    			'TrackAnnot.view.window.Annotations',
    			],
    stores: ['Annotations', 'Classifications', 'Track', 'Esc.ee.store.TrackerIds'],
	init : function() {
	    var me = this;
	    this.addEvents('from_date_change',
	            'current_date_change',
	            'to_date_change',
	            'tracker_change'
	            );
        this.control({
        	'annotations button[action=classes]': {
        	    click: this.showTypesPanel
        	},
        	'button[action=switch]': {
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
            'timeline': {
                'currentDate': function(date) {
                    me.setCurrentTime(date);
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
        this.customTimeFormat = timeFormat([
            [d3.time.format("%Y"), function() { return true; }],
            [d3.time.format("%B"), function(d) { return d.getMonth(); }],
            [d3.time.format("%b %d"), function(d) { return d.getDate() != 1; }],
            [d3.time.format("%x"), function(d) { return d.getDay() && d.getDate() != 1; }],
            [d3.time.format("%H:%M"), function(d) { return d.getHours(); }],
            [d3.time.format("%H:%M"), function(d) { return d.getMinutes(); }],
            [d3.time.format(":%S"), function(d) { return d.getSeconds(); }],
            [d3.time.format(".%L"), function(d) { return d.getMilliseconds(); }]
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

		this.setupWindows();
	},
	setupWindows: function() {
	    /**
	     * All windows with metrics
	     */
        this.windows = [];

        this.addAnnotationsWindow();
        this.addTimelineWindow();
        this.addTemperatureWindow();
        this.addAccelerometersWindow();
        this.addGoogleEarthWindow();
	},
	addAnnotationsWindow: function() {
        var annotations = Ext.create("TrackAnnot.view.window.Annotations", {
            x : 1220,
            y : 560,
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
	        y: 560,
	        width : 1180,
	        height : 300
	    });

        this.windows.push(timelineWindow);
        this.on('current_date_change', timelineWindow.dateFocus, timelineWindow);
	},
	addTemperatureWindow: function() {
	    var temperatureWindow = Ext.create("TrackAnnot.view.window.Temperature", {
	        x: 20,
	        y: 40,
	        width : 1180,
	        height : 240
	    });

	    this.windows.push(temperatureWindow);
	    var chart = temperatureWindow.getChart();
	    this.on('current_date_change', chart.dateFocus, chart);
	},
	addAccelerometersWindow: function() {
        var accelerometersWindow = Ext.create("TrackAnnot.view.window.Accelerometers", {
            x: 20,
            y: 300,
            width : 1180,
            height : 240
        });

        this.windows.push(accelerometersWindow);
        var chart = accelerometersWindow.getChart();
        this.on('current_date_change', chart.dateFocus, chart);
	},
	addGoogleEarthWindow: function() {
        var googleEarthWindow = Ext.create("TrackAnnot.view.window.GoogleEarth", {
            width : 500,
            height : 500,
            x: 1220,
            y: 40
        });

        this.windows.push(googleEarthWindow);
        var chart = googleEarthWindow.getChart();
        this.on('current_date_change', chart.dateFocus, chart);
	},
	onLaunch: function() {
	    this.windows.forEach(function(w) {
	      w.show();
	    });
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
	loadTrack: function() {
	    var me = this;
        var initDates = [Ext.ComponentQuery.query('#from_date')[0].getValue(),
                         Ext.ComponentQuery.query('#to_date')[0].getValue()];
        var trackerId = Ext.ComponentQuery.query('#trackerId')[0].getValue();

        // Google Earth uses kml file instead of TrackStore
        // TODO use TrackStore in Google Earth
        Ext.ComponentQuery.query('googleearth')[0]
            .setTime({
                start: initDates[0],
                stop: initDates[1]
            })
            .setUrl(window.location.href + '../S355_museumplein.kml')
            .setLocation('Amsterdam').load();

        this.trackStore.setConfig({
            trackerId: trackerId,
            start: initDates[0],
            end: initDates[1],
        });

        // After track data is loaded set current time to start time.
        this.trackStore.on('load', function(store) {
            me.setCurrentTime(store.getStart());
        });
        this.trackStore.load();
    }
});

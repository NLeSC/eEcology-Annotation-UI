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
    			],
    stores: ['Annotations', 'Classifications', 'Track'],
    dateAwareComponents: [],
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
        	'#from_date': {
        	    change: function(t, n, o) {
                  var date = new Date(n);
                  me.fireEvent('from_date_change', date);
                  Ext.ComponentQuery.query('accelchart')[0].from(date);
                  Ext.ComponentQuery.query('tempchart')[0].from(date);
                  Ext.ComponentQuery.query('timeline')[0].setFromDate(date);

                  // keep current time inside visible range
                  var c = Ext.getCmp('current_time');
                  if (c.getValue() < date) {
                      c.setValue(date);
                  }
                }
        	},
        	'#current_time': {
        	    change: function(t, n, o) {
                  var date = new Date(n);
                  me.setCurrentTime(date);
               }
        	},
        	'#to_date': {
        	    change: function(t, n, o) {
                    var date = new Date(n);
                    me.fireEvent('to_date_change', date);
                    Ext.ComponentQuery.query('accelchart')[0].to(date);
                    Ext.ComponentQuery.query('tempchart')[0].to(date);
                    Ext.ComponentQuery.query('timeline')[0].setToDate(date);

                    // keep current time inside visible range
                    var c = Ext.getCmp('current_time');
                    if (c.getValue() > date) {
                      c.setValue(date);
                    }
            	}
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
	},
	onLaunch: function() {
	    Ext.ComponentQuery.query('timeline')[0].getTime().format = this.customTimeFormat;
	    this.dateAwareComponents = [
	         Ext.ComponentQuery.query('#current_time')[0],
	         Ext.ComponentQuery.query('accelchart')[0],
	         Ext.ComponentQuery.query('tempchart')[0],
	         Ext.ComponentQuery.query('timeline')[0],
	         Ext.ComponentQuery.query('googleearth')[0],
             Ext.ComponentQuery.query('annotations')[0]
	    ];
	},
	setCurrentTime: function(date) {
	    this.dateAwareComponents.forEach(function(component) {
	        component.dateFocus(date);
	    });
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
	    var comp = Ext.getCmp('current_time');
	    var index = this.trackStore.closestIndex(comp.getValue());
	    current = this.trackStore.get(index+stepsize).date_time;
	    comp.setValue(current);
	},
	loadTrack: function() {
	    var me = this;
        var initDates = [Ext.ComponentQuery.query('#from_date')[0].getValue(),
                         Ext.ComponentQuery.query('#to_date')[0].getValue()];
        var trackerId = Ext.ComponentQuery.query('#trackerId')[0].getValue();

        this.trackStore.setConfig({
            trackerId: trackerId,
            start: initDates[0],
            end: initDates[1],
        });

        Ext.ComponentQuery.query('#current_time')[0].setValue(initDates[0]);
        Ext.ComponentQuery.query('timeline')[0].setTime({
              current: initDates[0],
              start: initDates[0],
              stop: initDates[1]
        });

        var dateConfig = {
            start: initDates[0],
            stop: initDates[1]
        };

        Ext.ComponentQuery.query('googleearth')[0]
            .setTime(dateConfig)
            .setUrl(window.location.href + '../S355_museumplein.kml')
            .setLocation('Amsterdam').load();

        Ext.ComponentQuery.query('popcorn')[0]
            .setStartDate(initDates[0])
            .setUrl(["../92968607.mp4", "../92968607.webm"])
            ;

        me.trackStore.load();
    }
});

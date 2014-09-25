/**
 * Track annotation main controller
 */
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
                'TrackAnnot.view.window.Direction',
                'TrackAnnot.view.window.DeltaDirection',
                'TrackAnnot.view.window.Speed',
                'TrackAnnot.view.window.Altitude',
                'TrackAnnot.view.window.Cesium',
                'TrackAnnot.view.menu.Metric',
                'TrackAnnot.view.dialog.ImportAnnotations',
                'TrackAnnot.view.window.Properties',
                'TrackAnnot.view.window.Video'
                ],
    stores: ['Annotations', 'Classifications', 'Track', 'Trackers'],
    uses: ['TrackAnnot.store.writer.File'],
    init : function() {
        var me = this;
        this.addEvents(
            'from_date_change',
            'current_date_change',
            'current_snapped_date_change',
            'to_date_change',
            'tracker_change'
        );
        
        // uncomment to see all c events fired in console
        // Ext.util.Observable.capture(this, function() { console.error(arguments);return true;});
        
        this.control({
            'annotations': {
                classconfig: this.showTypesPanel,
                load: this.showLoadAnnotationsDialog,
                save: this.saveAnnotations,
                pickclass: this.pickAnnotationClass,
                createitem: this.createAnnotation,
                removeitem: this.removeAnnotation,
                start2current: this.setAnnotationStart2Current,
                end2current: this.setAnnotationEnd2Current,
                edit: this.editAnnotation
            },
            '#import-annotations': {
                click: this.importAnnotations
            },
            'button[action=loadTrack]': {
                click: me.beforeLoadTrack
            },
            '#prev_timepoint': {
                click: me.moveCurentTimeBackward
            },
            '#next_timepoint': {
                click: me.moveCurentTimeForward
            },
            '#first_timepoint': {
                click: me.setCurrentTime2Start
            },
            '#last_timepoint': {
                click: me.setCurrentTime2End
            },
            '#prev_window': {
                click: this.onPrevWindow
            },
            '#zoom_in_window': {
                click: this.onZoomInWindow
            },
            '#center2current_window': {
                click: this.onCenterWindowOnCurrent
            },
            '#zoom_out_window': {
                click: this.onZoomOutWindow
            },
            '#next_window': {
                click: this.onNextWindow
            },
            'timelinewindow': {
                currentDate: me.setCurrentTime,
                currentSnappedDate: me.setCurrentSnappedTime
            },
            '#windows menuitem[action=resetlayout]': {
                click: this.resetLayoutConfirm
            },
            '#import-classifications': {
                click: this.importClassifications
            },
            "menuitem[action=addvideo]": {
                click: this.addVideoWindow
            },
            'accelchart': {
                burstclick: this.fillAccelBurstMenu,
                burstcontextclick: this.createAnnotationFromAccelBurst
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
            [d3.time.format.utc("%b %d"), function(d) { return d.getUTCDate() !== 1; }],
            [d3.time.format.utc("%x"), function(d) { return d.getUTCDay() && d.getUTCDate() !== 1; }],
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
            id: 1,
            label: 'floating',
            color: 'rgb(117, 112, 180)'
        }, {
            id: 2,
            label: 'flying',
            color: 'rgb(180, 112, 197)'
        }, {
            id: 3,
            label: 'sitting',
            color: 'rgb(112, 180, 197)'
        }, {
            id: 4,
            label: 'standing',
            color: 'rgb(112, 180, 107)'
        }, {
            id: 5,
            label: 'walking',
            color: 'rgb(197, 112, 110)'
        }];
        this.getClassificationsStore().loadRawData(classifications);
        this.getClassificationsStore().on('update', this.classificationsChanged, this);

        // set remote urls
        this.setupUrls('/aws/trackers', '/aws/tracker/{trackerId}/{start}/{end}');
        // For developing without server use demo data, by uncommenting below
//        this.setupUrls('demo/trackers.json', 'demo/tracker.json');

        // After track data is loaded set current time to start time.
        this.trackStore.on('load', function(store, data, isLoaded) {
            if (!isLoaded) {
                return;
            }
            if (store.getStart() < me.currentTime && me.currentTime < store.getEnd()) {
                me.setCurrentSnappedTime(me.currentTime);
            } else {
                me.setCurrentSnappedTime(store.getStart());
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
            title: 'Accelerometers',
            x: 20,
            y: 430,
            width : 1180,
            height : 140,
            autoShow: true
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.Speed", {
            title: 'Speed',
            x: 20,
            y: 300,
            width : 1180,
            height : 120,
            autoShow: true
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.Altitude", {
            title: 'Altitude',
            x: 20,
            y: 170,
            width : 1180,
            height : 120,
            autoShow: true
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.Temperature", {
            title: 'Temperature',
            x: 20,
            y: 40,
            width : 1180,
            height : 120,
            autoShow: true
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.Direction", {
            title: 'Direction',
            x: 20,
            y: 170,
            width : 1180,
            height : 120,
            autoShow: false
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.DeltaDirection", {
            title: 'Δ direction',
            x: 20,
            y: 40,
            width : 1180,
            height : 120,
            autoShow: false
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.GoogleEarth", {
            title: 'Google Earth',
            width : 500,
            height : 530,
            x: 1220,
            y: 40,
            autoShow: false
        }, function(chart, trackStore, currentTime) {
            chart.on('earthLoaded', function() {
                chart.loadData(trackStore, trackStore.data);
                chart.drawAnnotations();
                chart.dateFocus(currentTime);
            }, chart, {single: true});
        });

        this.registerMetricWindow("TrackAnnot.view.window.GoogleMap", {
            title: 'Google Map',
            width : 500,
            height : 530,
            x: 1220,
            y: 40,
            autoShow: false
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });

        this.registerMetricWindow("TrackAnnot.view.window.Cesium", {
            title: 'Cesium 3D Globe',
            width : 500,
            height : 530,
            x: 1220,
            y: 40,
            autoShow: true,
            listeners: {
                pointclick: this.setCurrentTime,
                scope: this
            }
        }, function(chart, trackStore, currentTime) {
            chart.loadData(trackStore, trackStore.data);
            chart.drawAnnotations();
            chart.dateFocus(currentTime);
        });
        
        this.registerMetricWindow("TrackAnnot.view.window.Properties", {
            title: 'Track properties',
            width : 1700,
            height : 70,
            x: 20,
            y: 890,
            autoShow: false
        }, function(chart, trackStore, currentTime) {
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
        this.annotationsGrid =  annotations.getAnnotations();
    },
    addTimelineWindow: function() {
        var timelineWindow = Ext.create('TrackAnnot.view.window.Timeline', {
            x: 20,
            y: 580,
            width : 1180,
            height : 300
        });
        this.timelineWindow = timelineWindow;
        this.windows.push(timelineWindow);
        this.on('current_date_change', timelineWindow.dateFocus, timelineWindow);
        this.on('current_snapped_date_change', timelineWindow.dateSnappedFocus, timelineWindow);
    },
    addVideoWindow: function() {
        this.videoWindow = Ext.create("TrackAnnot.view.window.Video", {
            width : 500,
            height : 530,
            x: 1220,
            y: 40
        });
        this.videoWindow.setStart(this.currentTime);
        this.videoWindow.on('timeupdate', this.setCurrentTime, this);
        this.on('current_date_change', this.videoWindow.dateFocus, this.videoWindow);
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
                       if (t.window && !t.window.isDestroyed) {
                           return;
                       }
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
                       if (t.window) {
                           chart = t.window.getChart();
                           me.un('current_date_change', chart.dateFocus, chart);
                           t.window.destroy();
                       }
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
            trackerId.setValue(1);
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
    setCurrentTime: function(date, source) {
        if (date === this.currentTime) {
            // don't fire event when nothing has changed
            return;
        }
        this.currentTime = date;
        this.fireEvent('current_date_change', date, source);
    },
    setCurrentSnappedTime: function(date, source) {
        if (date === this.currentTime) {
            // don't fire event when nothing has changed
            return;
        }
        this.currentTime = date;
        this.fireEvent('current_date_change', date, source);
        this.fireEvent('current_snapped_date_change', date, source);
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
    moveCurrentTime: function(nrsteps) {
        var index = 0;
        var current = this.currentTime;
        var timestepsize = this.timelineWindow.getTimestepSize();

        if (timestepsize.data.type === 'timepoint') {
            index = this.trackStore.closestIndex(this.currentTime) + (nrsteps * timestepsize.data.value);
        } else if (timestepsize.data.type === 'ms') {
            current = new Date(this.currentTime.getTime() + (nrsteps * timestepsize.data.value));
            index = this.trackStore.closestIndex(current);
        }
        current = this.trackStore.get(index).date_time;
        this.setCurrentSnappedTime(current);
    },
    moveCurentTimeForward: function() {
        this.moveCurrentTime(1);
    },
    moveCurentTimeBackward: function() {
        this.moveCurrentTime(-1);
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
    /**
     * Loads track with optional confirm.
     * When annotations are present and tracker has changed will ask for confirmation.
     */
    beforeLoadTrack: function(button) {
        var trackerId = this.getTrackerId().getValue();
        var old_trackerId = this.trackStore.getTrackerId();
        var astore = this.getAnnotationsStore();
        if (trackerId != old_trackerId && astore.count() > 0) {
            var title = 'Remove existing annotations?';
            var msg = 'Tracker has changed causing existing annotations to become invalid. All the annotations will be removed. Continue loading track?';
            var fn = function(choice) {
                if (choice === 'yes') {
                    this.loadTrack(button);
                }
            };
            Ext.MessageBox.confirm(title, msg, fn, this);
        } else {
            this.loadTrack(button);
        }
    },
    loadTrack: function(button) {
        var trackerId = this.getTrackerId().getValue();
        var start = this.getFromDate().getValue();
        var end = this.getToDate().getValue();

        var old_trackerId = this.trackStore.getTrackerId();
        if (trackerId !== old_trackerId) {
            var astore = this.getAnnotationsStore();
            astore.removeAll();
        }
        
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
    showLoadAnnotationsDialog: function() {
        var c = Ext.create('TrackAnnot.view.dialog.ImportAnnotations');
        c.show();
    },
    importAnnotations: function(button) {
        var overwrite = Ext.getCmp('import-annotations-overwrite').checked;
        var text = Ext.getCmp('import-annotations-text').getValue();
        var store = this.getAnnotationsStore();
        if (overwrite) {
            store.removeAll();
        }
        try {
            store.importText(text, this.trackStore);
        } catch(e) {
            Ext.Msg.show({
                title: 'Importing annotations failed',
                msg: e.message,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.WARNING
            });
        }
        button.up('window').close();
    },
    saveAnnotations: function(grid) {
        var store = grid.getStore();
        var value = store.exportText(this.trackStore);
        var writer = Ext.create('TrackAnnot.store.writer.File', {
            filename: 'annotations.csv',
            data: value,
            mime_type: 'text/csv'
        });
        var download_link = writer.getDownloadLink();
        Ext.MessageBox.show({
           title: 'Save',
           msg: 'Please save text below or download ' + download_link,
           width: 300,
           buttons: Ext.MessageBox.OK,
           multiline: true,
           value: value
       });
    },
    resetLayoutConfirm: function() {
        var me = this;
        Ext.Msg.confirm('Reset layout', 'Reset the layout, will reload page', function(buttonId) {
            if (buttonId === 'yes') {
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
    onCenterWindowOnCurrent: function() {
        var ostart = this.getFromTime();
        var oend = this.getToTime();
        var cur = this.currentTime;
        var start = cur - (oend - ostart) / 2;
        var end = cur + (oend - ostart) / 2;
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
    },
    importClassifications: function(button) {
        var overwrite = Ext.getCmp('import-classifications-overwrite').checked;
        var text = Ext.getCmp('import-classifications-text').getValue();
        var store = this.getClassificationsStore();
        if (overwrite) {
            store.removeAll();
        }
        store.importText(text);
        button.up('window').close();
    },
    pickAnnotationClass: function(menu) {
        var store = this.getClassificationsStore();
        var classes = [];
        store.data.each(function(record) {
            classes.push({
                style: 'background: ' + record.data.color,
                text: record.data.label,
                classification: record.data
            });
        });
        menu.removeAll();
        menu.add(classes);
    },
    cancelAnnotationEdit: function() {
        var grid = this.annotationsGrid;
        var editing = grid.getPlugin('editing');
        editing.cancelEdit();
    },
    createAnnotation: function(grid, classification) {
        var track_store = this.getTrackStore();
        // Create a model instance which starts at current and ends at current + 2 hours
        // snap the date to a gps fix
        var start_time = this.currentTime;
        var max_time = new Date(this.getToTime());
        var end_time = new Date(start_time.getTime() + 1000*60*60*2);
        if (max_time < end_time) {
           end_time = max_time;
        }
        this.cancelAnnotationEdit();

        var store = this.getAnnotationsStore();
        store.setClassificationDuring(start_time, end_time, classification, track_store);
    },
    removeAnnotation: function(grid, rowIndex) {
        var store = this.getAnnotationsStore();
        store.remove(store.getAt(rowIndex));
    },
    setAnnotationStart2Current: function(grid, rowIndex) {
        var store = this.getAnnotationsStore();
        var rec = store.getAt(rowIndex);
        if (this.currentTime <= rec.data.end) {
            rec.data.start = this.currentTime;
            rec.save();
        }
    },
    setAnnotationEnd2Current: function(grid, rowIndex) {
        var store = this.getAnnotationsStore();
        var rec = store.getAt(rowIndex);
        if (this.currentTime >= rec.data.start) {
            rec.data.end = this.currentTime;
            rec.save();
        }
    },
    /**
     * When field=class then set classifcation object
     * When field=start then set start to date of closest track row
     * When field=end then set end to date of closest track row
     */
    editAnnotation: function(editor, context) {
        var class_id = context.newValues['class_id'];
        var store = this.getClassificationsStore();
        var classification = store.getById(class_id);
        context.record.set('classification', classification.data);

        var start = this.trackStore.closestDate(context.newValues['start']);
        context.record.set('start', start);

        var end = this.trackStore.closestDate(context.newValues['end']);
        context.record.set('end', end);

        context.record.endEdit();
        context.record.commit();
        context.record.save();
    },
    setCurrentTime2Start: function() {
        var current = this.trackStore.get(0).date_time;
        this.setCurrentSnappedTime(current);
    },
    setCurrentTime2End: function() {
        var current = this.trackStore.get(this.trackStore.length()-1).date_time;
        this.setCurrentSnappedTime(current);
    },
    fillAccelBurstMenu: function(menu, burstData) {
        var store = this.getClassificationsStore();
        var astore = this.getAnnotationsStore();
        var classification = astore.getClassificationAtDateTime(burstData.date_time);

        var classes = [{
            'text': 'Not annotated', 
            checked: !classification,
            date_time: burstData.date_time
        }];
        
        store.data.each(function(record) {
            classes.push({
                style: 'background: ' + record.data.color,
                text: record.data.label,
                classification: record.data,
                date_time: burstData.date_time,
                checked: record.data === classification
            });
        });
        menu.removeAll();
        menu.add(classes);
    },
    createAnnotationFromAccelBurst: function(menucheckitem) {
        var track_store = this.getTrackStore();
        var classification = menucheckitem.classification;
        var date_time = menucheckitem.date_time;
        
        this.cancelAnnotationEdit();
        
        var store = this.getAnnotationsStore();
        store.setClassificationAt(date_time, classification, track_store);
    }
});

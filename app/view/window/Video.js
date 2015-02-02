Ext.define("TrackAnnot.view.window.Video", {
    extend : 'TrackAnnot.view.window.Abstract',
    layout: {
        type: 'border'
    },
    requires: [
        'Ext.layout.container.Border'
    ],
    autoShow: true,
    initComponent: function() {
        var me = this;

        // uncomment to see all application events fired in console
        //Ext.util.Observable.capture(this, function() { console.error(arguments);return true;});

        this.videoCanvas = Ext.create('Ext.Component', {
            autoEl: {
                tag: 'video',
                width: '100%',
                height: '100%',
                controls: true
            },
            region: 'center'
        });

        this.labelField = Ext.create('Ext.form.field.Text', {
            fieldLabel: 'Label',
            value: 'Video 1',
            listeners: {
                change: this.onLabelChange,
                scope: this
            }
        });

        this.startTimeField = Ext.create('TrackAnnot.view.field.DateTime', {
            fieldLabel: 'Start',
            value: new Date()
        });
        this.start2CurrentButton = Ext.create('Ext.button.Button', {
            iconCls: 'icon-start2current',
            tooltip: 'Set Start time to current time',
            handler: me.setStart2Current,
            scope: me
        });

        this.fileField = Ext.create('Ext.form.field.File', {
            fieldLabel: 'Source',
            text: 'Browse ...',
            listeners: {
                change: this.onFileFieldChange,
                scope: this
            }
        });

        this.settingsPanel = Ext.create('Ext.panel.Panel', {
            title: 'Settings',
            region: 'south',
            collapsible: true,
            layout: 'form',
            items: [this.fileField,
                    {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        items: [this.startTimeField, this.start2CurrentButton]
                    },
                    this.labelField
            ]
        });

        this.items = [this.videoCanvas, this.settingsPanel];

        this.actionsMenu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Speed',
                menu: {
                    defaults : {
                        checked: false,
                        group: 'speed',
                        listeners: {
                            checkchange: me.onSpeedCheckChange,
                            scope: me
                        }
                    },
                    items: [{
                        text: '0.125'
                    }, {
                        text: '0.25'
                    }, {
                        text: '0.5'
                    }, {
                        text: '1',
                        checked: true
                    }, {
                        text: '2'
                    }, {
                        text: '4'
                    }, {
                        text: '8'
                    }]
                }
            }]
        });

        this.tools = [{
            type: 'gear',
            tooltip: 'Toggle',
            handler: function(event) {
                me.actionsMenu.showAt(event.getXY());
            }
        }];

        this.callParent();
        this.addEvents('start2current', 'timeupdate');
        this.setTitle(this.labelField.getValue());
    },
    afterRender: function() {
        this.callParent();
        this.initializeVideoCanvasListeners();
    },
    initializeVideoCanvasListeners: function() {
        var vid = this.getVideoCanvasElement();
        vid.addEventListener("error", this.onError.bind(this));
        vid.addEventListener("loadedData", this.onLoadedData.bind(this));
        vid.addEventListener("timeupdate", this.onTimeUpdate.bind(this));
    },
    onError: function() {
        Ext.Msg.alert('Video error', 'Opening or playing video failed');
    },
    onLoadedData: function() {
        console.log('onLoadedData');
    },
    onTimeUpdate: function() {
        this.fireEvent('timeupdate', this.getAnnotationTime(), this);
    },
    getVideoCanvasElement: function() {
        if (!this.videoCanvas.el) {
            // return null when dom element is not ready
            return;
        }
        return this.videoCanvas.el.dom;
    },
    getFilesOfFileField: function() {
        return this.fileField.button.fileInputEl.dom.files;
    },
    onFileFieldChange: function(field, event) {
        var files = this.getFilesOfFileField();
        var file = files[0];
        var vid = this.getVideoCanvasElement();
        vid.src = URL.createObjectURL(file);
    },
    onLabelChange: function(field, value) {
        this.setTitle(value);
    },
    setStart: function(datetime) {
        this.startTimeField.setValue(datetime);
    },
    getAnnotationTime: function() {
        var start = this.startTimeField.getValue().getTime();
        var vid = this.getVideoCanvasElement();
        return new Date(start + (vid.currentTime * 1000));
    },
    dateFocus: function(current, source) {
        if (source == this) {
            // dont change when 'this' was the source of the event
            return;
        }
        this.currentTime = current;
        var curt = current.getTime();
        var vid = this.getVideoCanvasElement();
        if (!vid) {
            return;
        }
        var startDate = this.startTimeField.getValue();
        if (!startDate) {
            return;
        }
        var start = startDate.getTime();
        var dur = vid.duration * 1000; // duration is in seconds, time is in ms.
        var end = start + dur;
        if (curt >= start && curt <= end) {
            vid.currentTime = (curt - start)/1000;
        } else {
            // do nothing, as it is not the videos time window
            // TODO show placeholder when video is not active
        }
    },
    setStart2Current: function() {
        this.setStart(this.currentTime);
    },
    onSpeedCheckChange: function(field, checked) {
        if (checked) {
            var vid = this.getVideoCanvasElement();
            vid.playbackRate = field.text * 1;
        }
    }
});

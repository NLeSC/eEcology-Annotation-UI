/**
 * The viewport shows:
 * * on top, the track/timerange picker
 * * top left, metric plots
 * * top right, Cesium globe
 * * bottom left, timeline
 * * bottom right, annotations
 */
Ext.define('TrackAnnot.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'NLeSC.eEcology.form.field.TrackerCombo',
        'TrackAnnot.view.field.DateTime'
    ],
    items: [{
        xtype: 'toolbar',
        items: ['<b>A</b>nnotation <b>M</b>ovement <b>A</b>ccelerometer','-', {
            text: 'Windows',
            itemId: 'windows',
            menu: {
                xtype: 'menu',
                items: [{
                    text: 'Add',
                    menu: {
                        items: [{
                            text: 'Video',
                            action: 'addvideo'
                        }, {
                            text: 'Custom data',
                            action: 'addcustom'
                        }]
                    }
                }, {
                    text: 'Reset layout',
                    action: 'resetlayout'
                  }, {
                      text: 'Close all',
                      action: 'closewindows'
                }, {
                    xtype: 'menuseparator'
                }]
            }
        }, '-', {
            xtype: 'trackercombo',
            itemId: 'trackerId',
            stateful: true,
            stateId: 'trackerId',
            labelWidth: 50,
            width: 110,
            store: 'Trackers',
            valueField: 'id',
            queryMode: 'remote',
            triggerAction: 'all',
            typeAhead: true,
            getState: function() {
                return {value: this.getValue()};
            },
            applyState: function(state) {
                this.setValue(state.value);
            }
        }, {
            xtype: 'datetimefield',
            fieldLabel: 'From',
            itemId: 'from_date',
            stateful: true,
            stateId: 'from_date',
            labelWidth: 30,
            width: 220
        }, {
            xtype: 'datetimefield',
            fieldLabel: 'To',
            labelWidth: 20,
            width: 210,
            itemId: 'to_date',
            stateful: true,
            stateId: 'to_date'
        }, {
            xtype: 'button',
            tooltip: 'Move one time window backwards',
            iconCls: 'x-tbar-page-prev',
            itemId: 'prev_window'
        }, {
            xtype: 'button',
            tooltip: 'Zoom in x2',
            iconCls: 'icon-zoom-in',
            itemId: 'zoom_in_window'
        }, {
            xtype: 'button',
            tooltip: 'Center around current time',
            iconCls: 'icon-center2current',
            itemId: 'center2current_window'
        }, {
            xtype: 'button',
            tooltip: 'Zoom out x2',
            iconCls: 'icon-zoom-out',
            itemId: 'zoom_out_window'
        }, {
            xtype: 'button',
            tooltip: 'Move one time window forward',
            iconCls: 'x-tbar-page-next',
            itemId: 'next_window'
        }, {
            text: 'Load tracker',
            iconCls: 'icon-load-tracker',
            action: 'loadTrack'
        }]
    }],
    getWindowsMenu: function() {
        return this.query('toolbar #windows')[0].menu;
    }
});

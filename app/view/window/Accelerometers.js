/**
 * Accelerometer window
 */
Ext.define("TrackAnnot.view.window.Accelerometers", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Acceleration", 'Ext.menu.Menu'],
    stateId: 'accel-window',
    stateEvents: ['beforechange','afterchange'],
    initComponent: function() {
        var me = this;
        this.chart = Ext.create("TrackAnnot.view.Metric.Acceleration");
        this.on('beforechange', this.chart.setBefore, this.chart);
        this.on('afterchange', this.chart.setAfter, this.chart);
        this.items = [this.chart];

        this.actionsMenu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Before',
                tooltip: 'Number of plots before current time',
                menu: {
                    defaults: {
                        group: 'before',
                        checkHandler: this.onBeforeCheck,
                        scope: me
                    },
                    items: [{
                        text: '0',
                        checked: 0 == this.chart.before
                    }, {
                        text: '1',
                        checked: 1 == this.chart.before
                    }, {
                        text: '3',
                        checked: 3 == this.chart.before
                    }, {
                        text: '4',
                        checked: 4 == this.chart.before
                    }, {
                        text: '5',
                        checked: 5 == this.chart.before
                    }, {
                        text: '10',
                        checked: 10 == this.chart.before
                    }, {
                        text: '15',
                        checked: 15 == this.chart.before
                    }, {
                        text: '30',
                        checked: 30 == this.chart.before
                    }]
                }
            } ,{
                text: 'After',
                tooltip: 'Number of plots after current time',
                menu: {
                    defaults: {
                        group: 'after',
                        checkHandler: this.onAfterCheck,
                        scope: me
                    },
                    items: [{
                        text: '0',
                        checked: 0 == this.chart.after
                    }, {
                        text: '1',
                        checked: 1 == this.chart.after
                    }, {
                        text: '3',
                        checked: 3 == this.chart.after
                    }, {
                        text: '4',
                        checked: 4 == this.chart.after
                    }, {
                        text: '5',
                        checked: 5 == this.chart.after
                    }, {
                        text: '10',
                        checked: 10 == this.chart.after
                    }, {
                        text: '15',
                        checked: 15 == this.chart.after
                    }, {
                        text: '30',
                        checked: 30 == this.chart.after
                    }]
                }
            }]
        });

        this.tools = [{
            type: 'gear',
            tooltip: 'Alter number of plot before and after current time',
            handler: function(event) {
                me.actionsMenu.showAt(event.getXY());
            }
        }];

        this.addEvents('beforechange','afterchange');

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    },
    onBeforeCheck: function(item, checked) {
        if (!checked) {
            return;
        }
        this.fireEvent('beforechange', item.text*1, item);
    },
    onAfterCheck: function(item, checked) {
        if (!checked) {
            return;
        }
        this.fireEvent('afterchange', item.text*1, item);
    },
    getState: function() {
        var state = this.callParent();
        state['after'] =  this.chart.getAfter();
        state['before'] = this.chart.getBefore();
        return state;
    },
    getBeforeMenu: function() {
        return this.actionsMenu.down('[text=Before]');
    },
    getAfterMenu: function() {
        return this.actionsMenu.down('[text=After]');
    },
    setBefore: function(nr) {
        var item = this.getBeforeMenu().down('[text=' + nr + ']');
        item.setChecked(true);
    },
    setAfter: function(nr) {
        var item = this.getAfterMenu().down('[text=' + nr + ']');
        item.setChecked(true);
    },
    applyState: function(state) {
        this.callParent(state);
        this.setBefore(state.before);
        this.setAfter(state.after);
    }
});
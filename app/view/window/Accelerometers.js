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

        var currentBefore = this.chart.getBefore();
        var currentAfter = this.chart.getAfter();
        this.actionsMenu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Plots before',
                itemId: 'accplotsbefore',
                tooltip: 'Number of plots before current time',
                menu: {
                    defaults: {
                        group: 'before',
                        checkHandler: this.onBeforeCheck,
                        scope: me
                    },
                    items: [{
                        text: '0',
                        checked: 0 === currentBefore
                    }, {
                        text: '1',
                        checked: 1 === currentBefore
                    }, {
                        text: '3',
                        checked: 3 === currentBefore
                    }, {
                        text: '4',
                        checked: 4 === currentBefore
                    }, {
                        text: '5',
                        checked: 5 === currentBefore
                    }, {
                        text: '10',
                        checked: 10 === currentBefore
                    }, {
                        text: '15',
                        checked: 15 === currentBefore
                    }, {
                        text: '30',
                        checked: 30 === currentBefore
                    }]
                }
            } ,{
                text: 'Plots after',
                itemId: 'accplotsafter',
                tooltip: 'Number of plots after current time',
                menu: {
                    defaults: {
                        group: 'after',
                        checkHandler: this.onAfterCheck,
                        scope: me
                    },
                    items: [{
                        text: '0',
                        checked: 0 === currentAfter
                    }, {
                        text: '1',
                        checked: 1 === currentAfter
                    }, {
                        text: '3',
                        checked: 3 === currentAfter
                    }, {
                        text: '4',
                        checked: 4 === currentAfter
                    }, {
                        text: '5',
                        checked: 5 === currentAfter
                    }, {
                        text: '10',
                        checked: 10 === currentAfter
                    }, {
                        text: '15',
                        checked: 15 === currentAfter
                    }, {
                        text: '30',
                        checked: 30 === currentAfter
                    }]
                }
            }, '-', {
                text: 'z, heave, up/down',
                checked: true,
                checkChangeDisabled: true,
                cls: 'accz'
            }, {
                text: 'y, sway, side-to-side',
                checked: true,
                checkChangeDisabled: true,
                cls: 'accy'
            }, {
                text: 'x, surge, front/back',
                checked: true,
                checkChangeDisabled: true,
                cls: 'accx'
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
    getBeforeMenu: function() {
        return this.actionsMenu.getComponent('accplotsbefore');
    },
    getAfterMenu: function() {
        return this.actionsMenu.getComponent('accplotsafter');
    },
    setBefore: function(nr) {
        var item = this.getBeforeMenu().down('[text=' + nr + ']');
        item.setChecked(true);
    },
    setAfter: function(nr) {
        var item = this.getAfterMenu().down('[text=' + nr + ']');
        item.setChecked(true);
    },
    getState: function() {
        var state = this.callParent();
        state.after =  this.chart.getAfter();
        state.before = this.chart.getBefore();
        return state;
    },
    applyState: function(state) {
        this.callParent(arguments);
        this.setBefore(state.before);
        this.setAfter(state.after);
    }
});

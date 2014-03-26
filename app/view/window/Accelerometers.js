Ext.define("TrackAnnot.view.window.Accelerometers", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: ["TrackAnnot.view.Metric.Acceleration", 'Ext.menu.Menu'],
    stateId: 'accel-window',
    initComponent: function() {
        var me = this;
        this.chart = Ext.create("TrackAnnot.view.Metric.Acceleration");
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

        this.callParent();
    },
    getChart: function() {
        return this.chart;
    },
    onBeforeCheck: function(item, checked) {
        if (!checked) {
            return;
        }
        this.chart.setBefore(item.text*1);
        this.chart.sliceBursts();
    },
    onAfterCheck: function(item, checked) {
        if (!checked) {
            return;
        }
        this.chart.setAfter(item.text*1);
        this.chart.sliceBursts();
    }
});
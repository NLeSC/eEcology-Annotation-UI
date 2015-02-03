/**
 * Cesium globe window
 */
Ext.define('TrackAnnot.view.window.Cesium', {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: [
        'TrackAnnot.view.Metric.Cesium',
        'Ext.menu.Menu'
    ],
    stateId: 'cesium-window',
    initComponent: function() {
        this.chart = Ext.create('TrackAnnot.view.Metric.Cesium');
        this.items = [this.chart];

        this.setupActionsMenu();

        this.chart.on('pointclick', this.onPointClick, this);

        this.addEvents('pointclick');
        this.callParent();
    },
    setupActionsMenu: function() {
        var me = this;
        var c = this.getChart();
        this.actionsMenu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Center on track',
                listeners: {
                    click: me.centerOnTrack,
                    scope: me
                }
            },'-', {
                text: 'Current',
                itemId: 'toggleCurrent',
                checked: c.toggleCurrent(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }, {
                text: 'Points',
                itemId: 'togglePoints',
                checked: c.togglePoints(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }, {
                text: 'Line',
                itemId: 'toggleLine',
                checked: c.toggleLine(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }, {
                text: 'Wall',
                itemId: 'toggleWall',
                checked: c.toggleWall(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }, '-', {
                text: 'Annotate segments',
                itemId: 'toggleAnnotateLine',
                checked: c.toggleAnnotateLine(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }, {
                text: 'Annotate points',
                itemId: 'toggleAnnotatePoints',
                checked: c.toggleAnnotatePoints(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }]
        });
        this.tools = [{
            type: 'gear',
            tooltip: 'Center map and change how track and annotations are visualized',
            handler: function(event) {
                me.actionsMenu.showAt(event.getXY());
            }
        }];
        this.addStateEvents('togglechange');
        this.addEvents('togglechange');
    },
    getChart: function() {
        return this.chart;
    },
    onPointClick: function(date, source) {
        this.fireEvent('pointclick', date, source);
    },
    centerOnTrack: function() {
        this.getChart().centerOnTrack();
    },
    toggleItem: function(item, checked) {
        var name = item.itemId;
        this.getChart()[name](checked);
        this.fireEvent('togglechange', item, checked);
    },
    getState: function() {
        var state = this.callParent();
        var c = this.getChart();
        state.toggleCurrent = c.toggleCurrent();
        state.togglePoints = c.togglePoints();
        state.toggleLine = c.toggleLine();
        state.toggleWall = c.toggleWall();
        state.toggleAnnotateLine = c.toggleAnnotateLine();
        state.toggleAnnotatePoints = c.toggleAnnotatePoints();
        return state;
    },
    applyState: function(state) {
        var me = this;
        this.callParent(arguments);
        // forward state to chart and menu item
        var applyToggleState = function(name) {
            if (!(name in state)) {
                return;
            }
            var checked = state[name];
            var menuitem = me.actionsMenu.getComponent(name);
            menuitem.setChecked(checked);
            var chart = me.getChart();
            chart[name](checked);
        };
        applyToggleState('toggleCurrent');
        applyToggleState('togglePoints');
        applyToggleState('toggleLine');
        applyToggleState('toggleWall');
        applyToggleState('toggleAnnotateLine');
        applyToggleState('toggleAnnotatePoints');
    }
});

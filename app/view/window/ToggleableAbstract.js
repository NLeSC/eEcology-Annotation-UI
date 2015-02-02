/**
 * Abstract window with instantaneous and traject visibility toggles.
 * The toggles are statefull when sub-class sets the stateId property.
 */
Ext.define('TrackAnnot.view.window.ToggleableAbstract', {
    extend: 'TrackAnnot.view.window.Abstract',
    requires: [
        'Ext.menu.Menu',
        'Ext.menu.CheckItem'
    ],
    stateEvents: ['visibilitychange'],
    config: {
        chart: null
    },
    initComponent: function() {
        // convert chart from class name to instance
        this.setChart(this.getChart());

        this.items = [this.getChart()];

        this.setupActionsMenu();

        this.addEvents('visibilitychange');

        this.callParent(arguments);
    },
    applyChart: function(chart) {
        if (Ext.isString(chart)) {
            chart = Ext.create(chart);
        }
        return chart;
    },
    setupActionsMenu: function() {
        var me = this;
        var chart = this.getChart();
        this.instantaneousToggle = Ext.create('Ext.menu.CheckItem', {
            text: 'Instantaneous',
            cls: 'iline',
            checked: chart.getVisibilityOfInstantaneous(),
            listeners: {
                checkchange: me.onChangeVisibilityOfInstantaneous,
                scope: me
            }
        });

        this.trajectToggle = Ext.create('Ext.menu.CheckItem', {
            text: 'Traject',
            cls: 'tline',
            checked: chart.getVisibilityOfTraject(),
            listeners: {
                checkchange: me.onChangeVisibilityOfTraject,
                scope: me
            }
        });

        this.actionsMenu = Ext.create('Ext.menu.Menu', {
            items: [
                this.instantaneousToggle,
                this.trajectToggle
            ]
        });

        this.tools = [{
            type: 'gear',
            tooltip: 'Toggle',
            handler: function(event) {
                me.actionsMenu.showAt(event.getXY());
            }
        }];
    },
    getInstantaneousToggle: function() {
        return this.instantaneousToggle;
    },
    setVisibilityOfInstantaneous: function(checked) {
        var item = this.getInstantaneousToggle();
        item.setChecked(checked);
    },
    getTrajectToggle: function() {
        return this.trajectToggle;
    },
    setVisibilityOfTraject: function(checked) {
        var item = this.getTrajectToggle();
        item.setChecked(checked);
    },
    onChangeVisibilityOfInstantaneous: function(item, checked) {
        this.getChart().setVisibilityOfInstantaneous(checked);
        this.fireEvent('visibilitychange', item, checked);
    },
    onChangeVisibilityOfTraject: function(item, checked) {
        this.getChart().setVisibilityOfTraject(checked);
        this.fireEvent('visibilitychange', item, checked);
    },
    getState: function() {
        var state = this.callParent();
        var chart = this.getChart();
        state.visibleI =  chart.getVisibilityOfInstantaneous();
        state.visibleT = chart.getVisibilityOfTraject();
        return state;
    },
    applyState: function(state) {
        this.callParent(arguments);
        this.setVisibilityOfInstantaneous(state.visibleI);
        this.setVisibilityOfTraject(state.visibleT);
    }
});

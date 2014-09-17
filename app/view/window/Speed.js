/**
 * Speed window with menu to toggle speed types.
 */
Ext.define("TrackAnnot.view.window.Speed", {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: [
       'TrackAnnot.view.Metric.Speed', 
       'Ext.menu.Menu', 
       'Ext.menu.CheckItem'
    ],
    stateId: 'speed-window',
    stateEvents: ['visibilitychange'],
    initComponent: function() {
        var me = this;
        this.chart = Ext.create("TrackAnnot.view.Metric.Speed");
        this.items = [this.chart];

        this.instantaneousToggle = Ext.create('Ext.menu.CheckItem', {
            text: 'Instantaneous',
            cls: 'iline',
            checked: this.chart.getVisibilityOfInstantaneous(),
            listeners: {
            	checkchange: me.onChangeVisibilityOfInstantaneous,
            	scope: me
            }
        });
        
        this.trajectToggle = Ext.create('Ext.menu.CheckItem', {
            text: 'Traject',
            cls: 'tline',
            checked: this.chart.getVisibilityOfTraject(),
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

        this.addEvents('visibilitychange');
        
        this.callParent();
    },
    getChart: function() {
        return this.chart;
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
    	state['visibleI'] =  this.chart.getVisibilityOfInstantaneous();
        state['visibleT'] = this.chart.getVisibilityOfTraject();
    	return state;
    },
    applyState: function(state) {
    	this.callParent(arguments);
    	this.setVisibilityOfInstantaneous(state.visibleI);
    	this.setVisibilityOfTraject(state.visibleT);
    }
});
describe('TrackAnnot.view.window.ToggleableAbstract', function() {
    'use strict';

    var instance = null, chart = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.window.ToggleableAbstract", function() {
            this.callParent = jasmine.createSpy('callParent');
            this.addEvents = jasmine.createSpy('addEvents');
            this.on = jasmine.createSpy('on');
            this.fireEvent = jasmine.createSpy('fireEvent');
            this.instantaneousToggle = jasmine.createSpyObj('Ext.menu.CheckItem', ['setChecked']);
            this.trajectToggle = jasmine.createSpyObj('Ext.menu.CheckItem', ['setChecked']);
            ExtSpec.Jasmine.createConfigSpies(this);
        });
		chart = {
			setVisibilityOfInstantaneous: function(v) {
				this.i = v;
			}, 
			setVisibilityOfTraject: function(v) {
				this.t = v;
			}, 
			getVisibilityOfInstantaneous: function() {
				return this.i;
			}, 
			getVisibilityOfTraject: function() {
				return this.t;
			} 
		};
		instance.getChart = function() { 
			return chart;
		};
		instance.setChart = function(newchart) {
			chart = newchart;
		};
    });
    
    describe('setVisibilityOfInstantaneous', function() {
    	it('should call setChecked of toggle', function() {
    		instance.setVisibilityOfInstantaneous(true);
    		
    		expect(instance.instantaneousToggle.setChecked).toHaveBeenCalledWith(true);
    	});
    });
    
    describe('setVisibilityOfTraject', function() {
    	it('should call setChecked of toggle', function() {
    		instance.setVisibilityOfTraject(true);
    		
    		expect(instance.trajectToggle.setChecked).toHaveBeenCalledWith(true);
    	});
    });
    
    describe('onChangeVisibilityOfInstantaneous, toggling visibility of Instantaneous speed', function() {
    	it('should hide in chart and fire event', function() {
    		instance.onChangeVisibilityOfInstantaneous('instantaneous', false);

    		expect(chart.i).toBeFalsy();
    		expect(instance.fireEvent).toHaveBeenCalledWith('visibilitychange', 'instantaneous', false);
    	});
    	
    	it('should show in chart and fire event', function() {
    		instance.onChangeVisibilityOfInstantaneous('instantaneous', true);

    		expect(chart.i).toBeTruthy();
    		expect(instance.fireEvent).toHaveBeenCalledWith('visibilitychange', 'instantaneous', true);
    	});
    });
    
    describe('onChangeVisibilityOfTraject, toggling visibility of traject speed', function() {
    	it('should hide in chart and fire event', function() {
    		instance.onChangeVisibilityOfTraject('traject', false);

    		expect(chart.t).toBeFalsy();
    		expect(instance.fireEvent).toHaveBeenCalledWith('visibilitychange', 'traject', false);
    	});
    	
    	it('should show in chart and fire event', function() {
    		instance.onChangeVisibilityOfTraject('traject', true);

    		expect(chart.t).toBeTruthy();
    		expect(instance.fireEvent).toHaveBeenCalledWith('visibilitychange', 'traject', true);
    	});
    });
    
    describe('getState', function() {
    	beforeEach(function() {
    		instance.callParent = function() { return {}};
    		chart.i = true;
    		chart.t = true;
    	})
    	
    	it('should return chart visibility', function() {
    		var state = instance.getState();
    		
    		var expected = {visibleT: true, visibleI: true};
    		expect(state).toEqual(expected);
    	});
    });
    
    describe('applyState', function() {
    	it('should turn on the toggles', function() {
    		var state = {visibleI: true, visibleT: true};
    		
    		instance.applyState(state);
    		
    		expect(instance.callParent).toHaveBeenCalledWith([state]);
    		expect(instance.instantaneousToggle.setChecked).toHaveBeenCalledWith(true);
    		expect(instance.trajectToggle.setChecked).toHaveBeenCalledWith(true);
    	});
    });
});
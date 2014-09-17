describe('TrackAnnot.view.Metric.Speed', function() {
    'use strict';

    var instance = null, chart = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.Metric.Speed", function() {
            this.callParent = jasmine.createSpy('callParent');
            this.addEvents = jasmine.createSpy('addEvents');
            this.initConfig = jasmine.createSpy('initConfig');
            this.on = jasmine.createSpy('on');
            this.fireEvent = jasmine.createSpy('fireEvent');
            ExtSpec.Jasmine.createConfigSpies(this);
        });
    });

    describe('updateVisibility with filled track store', function() {
    	beforeEach(function() {
    		spyOn(instance, 'draw');
    		instance.trackStore = {isEmpty: function() {return false;}};
    	})

    	describe('updateVisibilityOfInstantaneous', function() {
	    	it('should not call draw() when unchanged', function() {
	    		instance.updateVisibilityOfInstantaneous(true, true);
	    		
	    		expect(instance.draw).not.toHaveBeenCalled();
	    	});
	    	
	    	it('should call draw() when changed', function() {
	    		instance.updateVisibilityOfInstantaneous(true, false);
	    		
	    		expect(instance.draw).toHaveBeenCalled();
	    	});
	    });
    
	    describe('updateVisibilityOfTraject', function() {
	    	it('should not call draw() when unchanged', function() {
	    		instance.updateVisibilityOfTraject(true, true);
	    		
	    		expect(instance.draw).not.toHaveBeenCalled();
	    	});
	    	
	    	it('should call draw() when changed', function() {
	    		instance.updateVisibilityOfTraject(true, false);
	    		
	    		expect(instance.draw).toHaveBeenCalled();
	    	});
	    });
    });
    
    describe('updateVisibility with empty track store', function() {
    	beforeEach(function() {
    		spyOn(instance, 'draw');
    		instance.trackStore = {isEmpty: function() {return true;}};
    	})

    	describe('updateVisibilityOfInstantaneous', function() {
	    	it('should not call draw() when changed', function() {
	    		instance.updateVisibilityOfInstantaneous(true, false);
	    		
	    		expect(instance.draw).not.toHaveBeenCalled();
	    	});
	    });
    
	    describe('updateVisibilityOfTraject', function() {
	    	it('should not call draw() when changed', function() {
	    		instance.updateVisibilityOfTraject(true, false);
	    		
	    		expect(instance.draw).not.toHaveBeenCalled();
	    	});
	    });
    });
});
    
describe('TrackAnnot.view.window.Speed', function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.window.Accelerometers", function() {
            this.callParent = jasmine.createSpy('callParent');
            this.addEvents = jasmine.createSpy('addEvents');
            this.on = jasmine.createSpy('on');
            this.fireEvent = jasmine.createSpy('fireEvent');
            ExtSpec.Jasmine.createConfigSpies(this);
        });
    });
    
    it('getChart', function() {
    	instance.chart = 12345;
    	
    	var chart = instance.getChart();
    	
    	expect(chart).toBe(12345);
    });
});
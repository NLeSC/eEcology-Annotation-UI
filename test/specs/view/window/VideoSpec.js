describe('TrackAnnot.view.window.Video', function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.window.Video", function() {
            this.setTitle = jasmine.createSpy('setTitle');
            ExtSpec.Jasmine.createConfigSpies(this);
        });
    });
    
    it('onLabelChange', function() {
    	var field = null, value = 'new title';
    	
    	instance.onLabelChange(field, value);
    	
    	expect(instance.setTitle).toHaveBeenCalledWith('new title');
    });
    
    describe('onSpeedCheckChange', function() {
    	beforeEach(function() {
    		// mock video canvas dom element
    	    instance.videoCanvas = {
    				el: {
    					dom: {
    						playbackRate: 1
    					}
    				}
    		};
    	});
    	
    	it('should not change playrate when unchecked', function() {
    		instance.onSpeedCheckChange({text: 4}, false);
    		
    		expect(instance.videoCanvas.el.dom.playbackRate).toEqual(1);
    	});
    	
    	it('should change playrate when checked', function() {
    		instance.onSpeedCheckChange({text: 4}, true);
    		
    		expect(instance.videoCanvas.el.dom.playbackRate).toEqual(4);
    	});
    });
});
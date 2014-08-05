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
});
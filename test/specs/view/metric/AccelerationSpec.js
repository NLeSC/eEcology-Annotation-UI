describe("TrackAnnot.view.Metric.Acceleration", function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.Metric.Acceleration", function() {
            this.callParent = jasmine.createSpy('callParent');
            this.initConfig = jasmine.createSpy('initConfig');
            this.addEvents = jasmine.createSpy('addEvents');
            ExtSpec.Jasmine.createConfigSpies(this);
        });
    });

    it('constructor', function() {
        var config = 1234;
        instance.constructor(config);
            
        expect(instance.callParent).toHaveBeenCalled();
        expect(instance.initConfig).toHaveBeenCalledWith(config);
    });
    
    it('initComponent', function() {
        instance.initComponent();

        expect(instance.callParent).toHaveBeenCalled();
        expect(instance.addEvents).toHaveBeenCalledWith('focusDate');
    });
    
    it('applyAnnotationStore', function() {
        Ext.data = { 
            StoreManager: {
                lookup: function() {
                    return 5678;
                }
            }
        };
        var store = 1234;
        var nstore = instance.applyAnnotationStore(store);
        
        expect(nstore).toEqual(5678);
    });
});
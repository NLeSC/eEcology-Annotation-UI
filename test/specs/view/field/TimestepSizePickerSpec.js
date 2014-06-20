describe('TrackAnnot.view.field.TimestepSizePicker', function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.field.TimestepSizePicker", function() {
            this.callParent = jasmine.createSpy('callParent');
            ExtSpec.Jasmine.createConfigSpies(this);
        });
    });

    it('initComponent', function() {
        var store = {getAt:function() {}};
        spyOn(store, 'getAt').andReturn(1234);
        Ext.create = jasmine.createSpy('create').andReturn(store);

        instance.initComponent();

        expect(Ext.create).toHaveBeenCalledWith('TrackAnnot.store.Timesteps', jasmine.any(Object));
        expect(instance.store).toEqual(store);
        expect(store.getAt).toHaveBeenCalledWith(0);
        expect(instance.value).toEqual(1234);
    });
});
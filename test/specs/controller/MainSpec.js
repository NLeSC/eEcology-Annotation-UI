describe('TrackAnnot.controller.Main', function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create('TrackAnnot.controller.Main', function() {
            this.callParent = jasmine.createSpy('callParent');
            ExtSpec.Jasmine.createConfigSpies(this);
        });
    });

    it('showTypesPanel', function() {
        instance.typesPanel = jasmine.createSpyObj('typesPanel', ['show']);

        instance.showTypesPanel();

        expect(instance.typesPanel.show).toHaveBeenCalledWith();
    });
});
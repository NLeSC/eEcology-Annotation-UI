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

    describe('time window', function() {
        beforeEach(function() {
           var from = 25;
           var to = 75;
           instance.getFromTime = function() { return from; };
           instance.getToTime = function() { return to; };
           instance.setTrackRange = jasmine.createSpy('setTrackRange');
        });

        it('onPrevWindow', function() {
            instance.onPrevWindow();

            var exp_from = -25;
            var exp_to = 25;
            expect(instance.setTrackRange).toHaveBeenCalledWith(exp_from, exp_to);
        });

        it('onZoomInWindow', function() {
            instance.onZoomInWindow();

            var exp_from = 37.5;
            var exp_to = 62.5;
            expect(instance.setTrackRange).toHaveBeenCalledWith(exp_from, exp_to);
        });

        it('onZoomOutWindow', function() {
            instance.onZoomOutWindow();

            var exp_from = 0;
            var exp_to = 100;
            expect(instance.setTrackRange).toHaveBeenCalledWith(exp_from, exp_to);
        });

        it('onNextWindow', function() {
            instance.onNextWindow();

            var exp_from = 75;
            var exp_to = 125;
            expect(instance.setTrackRange).toHaveBeenCalledWith(exp_from, exp_to);
        });

    });
});
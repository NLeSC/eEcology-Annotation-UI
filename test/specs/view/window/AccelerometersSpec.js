describe('TrackAnnot.view.window.Accelerometers', function() {
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

    it('initComponent', function() {
        var creation = {
            setBefore: function() {},
            setAfter: function() {}
        };
        Ext.create = jasmine.createSpy('create').andReturn(creation);

        instance.initComponent();

        expect(instance.callParent).toHaveBeenCalled();
        expect(Ext.create).toHaveBeenCalledWith("TrackAnnot.view.Metric.Acceleration");
        expect(instance.addEvents).toHaveBeenCalledWith('beforechange', 'afterchange');
        expect(instance.on).toHaveBeenCalledWith('beforechange', creation.setBefore, creation);
        expect(instance.on).toHaveBeenCalledWith('afterchange', creation.setAfter, creation);
        expect(instance.chart).toEqual(creation);
        expect(instance.items).toEqual([creation]);
        expect(instance.tools).toEqual([{
            type: 'gear',
            tooltip: 'Alter number of plot before and after current time',
            handler: jasmine.any(Function)
        }]);
    });

    it('getChart', function() {
        instance.chart = 1234;

        var chart = instance.getChart();

        expect(chart).toEqual(1234);
    });

    describe('onBeforeCheck', function() {
        var item = null;

        beforeEach(function() {
           item = {text: '1234'};
        });

        it('checked then fire event', function() {
            instance.onBeforeCheck(item, true);

            expect(instance.fireEvent).toHaveBeenCalledWith('beforechange', 1234, item);
        });

        it('unchecked then no fireevent', function() {
            instance.onBeforeCheck(item, false);

            expect(instance.fireEvent).not.toHaveBeenCalled();
        });
    });

    describe('onAfterCheck', function() {
        var item = null;

        beforeEach(function() {
           item = {text: '1234'};
        });

        it('checked then fire event', function() {
            instance.onAfterCheck(item, true);

            expect(instance.fireEvent).toHaveBeenCalledWith('afterchange', 1234, item);
        });

        it('unchecked then no fireevent', function() {
            instance.onAfterCheck(item, false);

            expect(instance.fireEvent).not.toHaveBeenCalled();
        });
    });


    it('getState', function() {
       instance.chart = {
           getBefore: function() { return 1234; },
           getAfter: function() { return 5678; }
       };
       instance.callParent = function() {
           return {x:1};
       };

       var state = instance.getState();

       var expected_state = {
           before: 1234,
           after: 5678,
           x: 1
       };
       expect(state).toEqual(expected_state);
    });

    it('applyState', function() {
        spyOn(instance, 'setBefore');
        spyOn(instance, 'setAfter');

        var state = {
            before: 1234,
            after: 5678,
            x: 1
        };
        instance.applyState(state);

        expect(instance.callParent).toHaveBeenCalledWith([state]);
        expect(instance.setBefore).toHaveBeenCalledWith(1234);
        expect(instance.setAfter).toHaveBeenCalledWith(5678);
    });
});

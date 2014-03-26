describe('TrackAnnot.view.window.Accelerometers', function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.window.Accelerometers", function() {
            this.callParent = jasmine.createSpy('callParent');
            ExtSpec.Jasmine.createConfigSpies(this);
        });
    });

    it('initComponent', function() {
        Ext.create = jasmine.createSpy('create').andReturn(1234);

        instance.initComponent();

        expect(instance.callParent).toHaveBeenCalled();
        expect(Ext.create).toHaveBeenCalledWith("TrackAnnot.view.Metric.Acceleration");
        expect(instance.chart).toEqual(1234);
        expect(instance.items).toEqual([1234]);
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
});
describe('TrackAnnot.store.Track', function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create('TrackAnnot.store.Track', function() {
            this.callParent = jasmine.createSpy('callParent');
            this.initConfig = jasmine.createSpy('initConfig');

            // observable mixin
            this.addEvents = jasmine.createSpy('addEvents');
            this.fireEvent = jasmine.createSpy('fireEvent');

            this.trackerId = 1234;
            this.start = new Date("2013-08-28T10:00:00.000Z");
            this.end = new Date("2013-08-29T10:00:00.000Z");

            ExtSpec.Jasmine.createConfigSpies(this);
        });
        Ext.Template = function(tpl) {
            this.apply = function() {
                return '/someurl';
            };
        };
        Ext.decode = JSON.parse;
    });

    it('constructor', function() {
        var constructor = ExtSpec.ClassManager.construct('TrackAnnot.store.Track');
        var config = {
            trackerId: 1234,
            start: new Date("2013-08-28T10:00:00.000Z"),
            end: new Date("2013-08-29T10:00:00.000Z"),
        };

        constructor.call(instance, config);

        expect(instance.callParent).toHaveBeenCalled();
        expect(instance.addEvents).toHaveBeenCalledWith(['load', 'loadFailure']);
        expect(instance.initConfig).toHaveBeenCalledWith(config);
    });

    it('load', function() {
       Ext.Ajax = jasmine.createSpyObj('Ajax', ['request']);

       instance.load();

       expect(Ext.Ajax.request).toHaveBeenCalledWith({
           url: '/someurl',
           success: instance.success,
           failure: instance.failure,
           scope: instance,
           timeout: 300000
       });
    });

    it('getUrl', function() {
        spyOn(Ext.Template, 'apply');

        var url = instance.getUrl();

        expect(url).toEqual('/someurl');
        // TODO test apply() was called with right args
    });

    it('success', function() {
        instance.success({
            responseText: '[{"date_time":"2013-08-28T10:00:00.000Z"}]'
        });

        var data = [{
            date_time: new Date("2013-08-28T10:00:00.000Z")
        }];
        expect(instance.data).toEqual(data);
        expect(instance.fireEvent).toHaveBeenCalledWith('load', instance, instance.data, true);
    });
});
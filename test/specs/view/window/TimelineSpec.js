describe('TrackAnnot.view.window.Timeline', function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.window.Timeline", function() {
            this.callParent = jasmine.createSpy('callParent');
            this.addEvents = jasmine.createSpy('addEvents');
            this.fireEvent = jasmine.createSpy('fireEvent');
            ExtSpec.Jasmine.createConfigSpies(this);
        });
    });

    it('initComponent', function() {
        var creation = jasmine.createSpyObj('creation', ['on']);
        Ext.create = jasmine.createSpy('create').andReturn(creation);

        instance.initComponent();

        expect(instance.addEvents).toHaveBeenCalledWith('currentDate', 'currentSnappedDate');
        expect(Ext.create).toHaveBeenCalledWith('widget.datetimefield', jasmine.any(Object));
        expect(creation.on).toHaveBeenCalledWith('change', instance.onCurrentTimeFieldChange, instance);
        expect(Ext.create).toHaveBeenCalledWith("TrackAnnot.view.field.TimestepSizePicker");
        expect(Ext.create).toHaveBeenCalledWith("TrackAnnot.view.Timeline");
        expect(creation.on).toHaveBeenCalledWith('currentDate', instance.onCurrentDate, instance);
        expect(instance.items).toEqual([creation]);
        expect(instance.callParent).toHaveBeenCalledWith();
    });

    it('onCurrentTimeFieldChange', function() {
        var dt = new Date(1403267881070);
        var store = {
            closestIndex: function() {
                return 1234;
            },
            get: function() {
                return {date_time: 5678};
            }
        };
        Ext.StoreManager = {
            get: function() {
                return store;
            }
        };
        spyOn(Ext.StoreManager, 'get').andCallThrough();
        var currentTimeField = jasmine.createSpy('currentTimeField');

        instance.onCurrentTimeFieldChange(currentTimeField, dt);

        expect(Ext.StoreManager.get).toHaveBeenCalledWith('Track');
        expect(instance.fireEvent).toHaveBeenCalledWith('currentSnappedDate', 5678, currentTimeField);
    });

    it('onCurrentSnappedDate', function() {
        var dt = new Date(1403267881070);

        instance.onCurrentSnappedDate(dt);

        expect(instance.fireEvent).toHaveBeenCalledWith('currentSnappedDate', dt, instance.timeline);
    });
    
    it('onCurrentDate', function() {
        var dt = new Date(1403267881070);

        instance.onCurrentDate(dt);

        expect(instance.fireEvent).toHaveBeenCalledWith('currentDate', dt, instance.timeline);
    });

    it('getTimeline', function() {
        instance.timeline = 1234;

        var timeline = instance.getTimeline();

        expect(timeline).toEqual(1234);
    });

    it('dateFocus', function() {
        var dt = new Date(1403267881070);
        instance.currentTimeField = jasmine.createSpyObj('timeField', ['setValue']);
        instance.timeline = jasmine.createSpyObj('timeline', ['dateFocus']);

        instance.dateFocus(dt);

        expect(instance.timeline.dateFocus).toHaveBeenCalledWith(dt);
    });

    describe('dateSnappedFocus' , function() {
    	var dt;
    	beforeEach(function() {
    		dt = new Date(1403267881070);
    		instance.currentTimeField = jasmine.createSpyObj('timeField', ['setValue']);
            instance.timeline = jasmine.createSpyObj('timeline', ['dateFocus']);
    	});

    	it('should call field and timeline when they are not the source', function() {
    		instance.dateSnappedFocus(dt);
    		
    		expect(instance.currentTimeField.setValue).toHaveBeenCalledWith(dt);
    		expect(instance.timeline.dateFocus).toHaveBeenCalledWith(dt);
    	});
    	
    	it('should not call field when its the source', function() {
    		instance.dateSnappedFocus(dt, instance.currentTimeField);
    		
    		expect(instance.currentTimeField.setValue).not.toHaveBeenCalledWith(dt);
    	});
    	
    	it('should not call field when its the source', function() {
    		instance.dateSnappedFocus(dt, instance.timeline);
    		
    		expect(instance.timeline.dateFocus).not.toHaveBeenCalledWith(dt);
    	});
    });
    
    it('getTimestepSizePicker', function() {
        instance.timestepSizePicker = 1234;

        var timestepSizePicker = instance.getTimestepSizePicker();

        expect(timestepSizePicker).toEqual(1234);
    });

    it('getTimestepSize', function() {
       instance.timestepSizePicker = {
           lastSelection: [1234]
       };

       var timestepSize = instance.getTimestepSize();

       expect(timestepSize).toEqual(1234);
    });

});
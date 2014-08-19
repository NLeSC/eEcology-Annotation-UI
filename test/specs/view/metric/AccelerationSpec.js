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
        expect(instance.addEvents).toHaveBeenCalledWith('focusDate', 'burstclick', 'burstcontextclick');
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

    describe('hasData', function() {
        it('has no data', function() {
            instance.rawdata = [];

            expect(instance.hasData()).toBeFalsy();
        });

        it('has data', function() {
            instance.rawdata = ['somedata'];

            expect(instance.hasData()).toBeTruthy();
        });
    });

    describe('updateAfter', function() {
       it('with data', function() {
           instance.rawdata = ['somedata'];
           spyOn(instance, 'sliceBursts');
           var newNr = 5, oldNr = 4;

           instance.updateAfter(newNr, oldNr);

           expect(instance.sliceBursts).toHaveBeenCalledWith();
       });

       it('without data', function() {
           instance.rawdata = [];
           spyOn(instance, 'sliceBursts');
           var newNr = 5, oldNr = 4;

           instance.updateAfter(newNr, oldNr);

           expect(instance.sliceBursts).not.toHaveBeenCalledWith();
       });
    });

    describe('updateBefore', function() {
       it('with data', function() {
           instance.rawdata = ['somedata'];
           spyOn(instance, 'sliceBursts');
           var newNr = 5, oldNr = 4;

           instance.updateBefore(newNr, oldNr);

           expect(instance.sliceBursts).toHaveBeenCalledWith();
       });

       it('without data', function() {
           instance.rawdata = [];
           spyOn(instance, 'sliceBursts');
           var newNr = 5, oldNr = 4;

           instance.updateBefore(newNr, oldNr);

           expect(instance.sliceBursts).not.toHaveBeenCalledWith();
       });
    });
    
    describe('drawFocus', function() {
    	var cell = null, burstData = null, x = null, y = null;
    	beforeEach(function() {
    		instance.drawFocusLine = jasmine.createSpy('drawFocusLine');
    		instance.unDrawFocusLine = jasmine.createSpy('unDrawFocusLine');
    		burstData = {
    			date_time: new Date("2014-08-18T10:00:00.000Z"),
    			time_acceleration: [0, 2] // values on x-axis in seconds
    		};
    	});
    	
    	it('should not draw focus when current date is before current accel burst', function() {
    		instance.unSnappedCurrent = new Date("2014-08-18T08:00:00.000Z");
    		
    		instance.drawFocus(cell, burstData, x, y);
    		
    		expect(instance.drawFocusLine).not.toHaveBeenCalled();
    	});
    	
    	it('should not draw focus when current date is after current accel burst', function() {
    		instance.unSnappedCurrent = new Date("2014-08-18T18:00:00.000Z");
    		
    		instance.drawFocus(cell, burstData, x, y);
    		
    		expect(instance.drawFocusLine).not.toHaveBeenCalled();
    	});
    	
    	it('should not draw focus when current date is before current accel burst', function() {
    		instance.unSnappedCurrent = new Date("2014-08-18T10:00:01.000Z");
    		
    		instance.drawFocus(cell, burstData, x, y);
    		
    		expect(instance.drawFocusLine).toHaveBeenCalledWith(cell, 1.0, x, y);
    	});
    	
    	it('should not draw when burstData is empty', function() {
    		instance.unSnappedCurrent = new Date("2014-08-18T10:00:01.000Z");
    		burstData = undefined;
    		
    		instance.drawFocus(cell, burstData, x, y);
    		
    		expect(instance.drawFocusLine).not.toHaveBeenCalled();
    	});
    	
    	it ('should not draw focues when current data is same as accel burst start', function() {
    		instance.unSnappedCurrent = new Date("2014-08-18T10:00:00.000Z");
    		
    		instance.drawFocus(cell, burstData, x, y);
    		
    		expect(instance.drawFocusLine).not.toHaveBeenCalled();
    	});
    	
    	it ('should not draw focues when current data is same as accel burst end', function() {
    		instance.unSnappedCurrent = new Date("2014-08-18T10:00:02.000Z");
    		
    		instance.drawFocus(cell, burstData, x, y);
    		
    		expect(instance.drawFocusLine).not.toHaveBeenCalled();
    	});
    });
});
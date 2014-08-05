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

        it('onCenterWindowOnCurrent', function() {
        	instance.currentTime = 40;
        	
        	instance.onCenterWindowOnCurrent();     

            var exp_from = 15;
            var exp_to = 65;
            expect(instance.setTrackRange).toHaveBeenCalledWith(exp_from, exp_to);
        });
    });

    describe('annotation actions', function() {
        var store = null;
        var grid = null;
        var record = {
            data: {},
            save: function() {}
        };

        beforeEach(function() {
            store = {
               getAt: function(index) {
                   return record;
               },
               remove: function(rec) {},
               insert: function(index, rec) {}
            };
            spyOn(record, 'save');
            spyOn(store, 'getAt').andCallThrough();
            spyOn(store, 'remove');
            spyOn(store, 'insert');
            record.data.start = new Date("2014-04-23T10:00:00.000Z");
            record.data.end = new Date("2014-04-23T14:00:00.000Z");
            instance.currentTime = new Date("2014-04-23T12:00:00.000Z");
            instance.getAnnotationsStore = function() { return store; };
         });

        it('removeAnnotation',  function() {
            instance.removeAnnotation(grid, 5);

            expect(store.getAt).toHaveBeenCalledWith(5);
            expect(store.remove).toHaveBeenCalledWith(record);
        });

        describe('setAnnotationStart2Current', function() {
            it('current < end -> start=current', function() {
                instance.setAnnotationStart2Current(grid, 5);

                expect(record.data.start).toEqual(new Date("2014-04-23T12:00:00.000Z"));
                expect(record.save).toHaveBeenCalled();
            });

            it('current > end -> start unchanged', function() {
                instance.currentTime = new Date("2014-04-23T16:00:00.000Z");
                instance.setAnnotationStart2Current(grid, 5);

                expect(record.data.start).toEqual(new Date("2014-04-23T10:00:00.000Z"));
                expect(record.save).not.toHaveBeenCalled();
            });
        });

        describe('setAnnotationEnd2Current', function() {
            it('current > start -> end=current', function() {
                instance.setAnnotationEnd2Current(grid, 5);

                expect(record.data.end).toEqual(new Date("2014-04-23T12:00:00.000Z"));
                expect(record.save).toHaveBeenCalled();
            });

            it('current < start -> end unchanged', function() {
                instance.currentTime = new Date("2014-04-23T08:00:00.000Z");
                instance.setAnnotationEnd2Current(grid, 5);

                expect(record.data.end).toEqual(new Date("2014-04-23T14:00:00.000Z"));
                expect(record.save).not.toHaveBeenCalled();
            });
        });

    });

    describe('timeline window events', function() {
        beforeEach(function() {
            instance.currentTime = new Date("2014-04-23T12:00:00.000Z");
            spyOn(instance, 'setCurrentTime');
            instance.trackStore = {
                get: function() {},
                length: function() {},
                closestIndex: function() {}
            };
        });

        describe('timestepSize==5timepoint', function() {
            var timestepSize = null;
            beforeEach(function() {
                timestepSize = {data: {
                    value: 5,
                    type: 'timepoint'
                }};
                instance.timelineWindow = {
                    getTimestepSize: function() {
                        return timestepSize;
                    }
                };
            });

            it('moveCurentTimeBackward', function() {
                spyOn(instance.trackStore, 'closestIndex').andReturn(4567);
                spyOn(instance.trackStore, 'get').andReturn({ date_time: 1234});

                instance.moveCurentTimeBackward();

                expect(instance.trackStore.closestIndex).toHaveBeenCalledWith(instance.currentTime);
                expect(instance.trackStore.get).toHaveBeenCalledWith(4562);
                expect(instance.setCurrentTime).toHaveBeenCalledWith(1234);
            });

            it('moveCurentTimeForward', function() {
                spyOn(instance.trackStore, 'closestIndex').andReturn(4567);
                spyOn(instance.trackStore, 'get').andReturn({ date_time: 1234});

                instance.moveCurentTimeForward();

                expect(instance.trackStore.closestIndex).toHaveBeenCalledWith(instance.currentTime);
                expect(instance.trackStore.get).toHaveBeenCalledWith(4572);
                expect(instance.setCurrentTime).toHaveBeenCalledWith(1234);
            });
        });

        describe('timestepSize==1minute', function() {
            var timestepSize = null;
            beforeEach(function() {
                timestepSize = {data: {
                    value: 60000,
                    type: 'ms'
                }};
                instance.timelineWindow = {
                    getTimestepSize: function() {
                        return timestepSize;
                    }
                };
            });

            it('moveCurentTimeBackward', function() {
                spyOn(instance.trackStore, 'closestIndex').andReturn(4567);
                spyOn(instance.trackStore, 'get').andReturn({ date_time: 1234});

                instance.moveCurentTimeBackward();

                var expected_time = new Date("2014-04-23T11:59:00.000Z");
                expect(instance.trackStore.closestIndex).toHaveBeenCalledWith(expected_time);
                expect(instance.trackStore.get).toHaveBeenCalledWith(4567);
                expect(instance.setCurrentTime).toHaveBeenCalledWith(1234);
            });

            it('moveCurentTimeForward', function() {
                spyOn(instance.trackStore, 'closestIndex').andReturn(4567);
                spyOn(instance.trackStore, 'get').andReturn({ date_time: 1234});

                instance.moveCurentTimeForward();

                var expected_time = new Date("2014-04-23T12:01:00.000Z");
                expect(instance.trackStore.closestIndex).toHaveBeenCalledWith(expected_time);
                expect(instance.trackStore.get).toHaveBeenCalledWith(4567);
                expect(instance.setCurrentTime).toHaveBeenCalledWith(1234);
            });
        });

        it('setCurrentTime2Start', function() {
            spyOn(instance.trackStore, 'get').andReturn({ date_time: 1234});

            instance.setCurrentTime2Start();

            expect(instance.trackStore.get).toHaveBeenCalledWith(0);
            expect(instance.setCurrentTime).toHaveBeenCalledWith(1234);
        });

        it('setCurrentTime2End', function() {
            spyOn(instance.trackStore, 'length').andReturn(56);
            spyOn(instance.trackStore, 'get').andReturn({ date_time: 1234});

            instance.setCurrentTime2End();

            expect(instance.trackStore.get).toHaveBeenCalledWith(55);
            expect(instance.setCurrentTime).toHaveBeenCalledWith(1234);
        });

    });
});
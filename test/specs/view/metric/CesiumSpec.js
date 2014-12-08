describe("TrackAnnot.view.Metric.Cesium", function() {
    'use strict';

    var instance = null, astore = null, trackStore = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.Metric.Cesium", function() {
            var me = this;
            this.callParent = jasmine.createSpy('callParent');
            this.initConfig = jasmine.createSpy('initConfig');
            this.addEvents = jasmine.createSpy('addEvents');
            ExtSpec.Jasmine.createConfigSpies(this);
            this.getAnnotatePoints.andCallFake(function() {
                return this.config.annotatePoints;
            });
            this.setAnnotatePoints.andCallFake(function(v) {
                me.config.annotatePoints = v;
            });
            this.getAnnotateLine.andCallFake(function() {
                return this.config.annotateLine;
            });
            this.setAnnotateLine.andCallFake(function(v) {
                me.config.annotateLine = v;
            });
            this.getToggles.andReturn(this.config.toggles);
            this.getCurrentMarkerIconUrl.andReturn(this.config.currentMarkerIconUrl);
            this.getTrackColor.andReturn(this.config.trackColor);
            this.getTrackColorAlpha.andReturn(this.config.trackColorAlpha);
            this.getTrackWidth.andReturn(this.config.trackWidth);
            astore = ExtSpec.create('TrackAnnot.store.Annotations', function() {
                var ame = this;
                this.callParent = jasmine.createSpy('callParent');
                this.initConfig = jasmine.createSpy('initConfig');
                this.addEvents = jasmine.createSpy('addEvents');
                this.data = {items: []};

                // findBy polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
                this.findBy = function(cb) {
                    var list = ame.data.items;
                    var length = list.length >>> 0;
                    var thisArg = arguments[1];
                    var value;

                    for (var i = 0; i < length; i++) {
                      value = list[i];
                      if (cb.call(thisArg, value, i, list)) {
                        return i;
                      }
                    }
                    return undefined;
                };
                this.getAt = function(index) {
                    return ame.data.items[index];
                };
            });
            this.getAnnotationStore.andReturn(astore);
        });
    });

    function setupTrackStore() {
        instance.viewer = {
            dataSources: new Cesium.DataSourceCollection(),
            scene: {
                camera: jasmine.createSpyObj('Cesium.Camera', ['viewRectangle']),
                primitives: new Cesium.PrimitiveCollection()
            },
            clock: new Cesium.Clock({
                startTime: Cesium.JulianDate.fromIso8601('2014-09-19T10:00Z'),
                stopTime: Cesium.JulianDate.fromIso8601('2014-09-19T18:00Z'),
                currentTime: Cesium.JulianDate.fromIso8601('2014-09-19T12:00Z'),
                shouldAnimate: false
            })
        };
        var data = [{
            lat: 4.5,
            lon: 53.4,
            altitude: 5,
            date_time: new Date('2014-09-19T12:00Z')
        }, {
            lat: 4.9,
            lon: 53.9,
            altitude: 7,
            date_time: new Date('2014-09-19T14:00Z')
        }, {
            lat: 3.9,
            lon: 51.9,
            altitude: 0,
            date_time: new Date('2014-09-19T16:00Z')
        }];
        trackStore = ExtSpec.create("TrackAnnot.store.Track", function() {
            this.callParent = jasmine.createSpy('callParent');
            this.addEvents = jasmine.createSpy('addEvents');
            this.initConfig = jasmine.createSpy('initConfig');
            this.fireEvent = jasmine.createSpy('fireEvent');
            this.getStart = function() { return new Date('2014-09-19T10:00Z');};
            this.getEnd = function() { return new Date('2014-09-19T18:00Z');};
        });
        trackStore.loadData(data);
        instance.getTrackStore.andReturn(trackStore);
    };

    describe('loadData', function() {
        beforeEach(function() {
            setupTrackStore();
            instance.loadData(trackStore, trackStore.data);
        });

        it('should center camera on data', function() {
            var expected = Cesium.Rectangle.fromDegrees(51.9, 3.9, 53.9, 4.9);
            expect(instance.viewer.scene.camera.viewRectangle).toHaveBeenCalledWith(expected);
        });

        it('should draw current marker', function() {
           var current = instance.getCurrentMarker();
           // TODO perform better validation
           expect(current).toBeTruthy();
        });

        it('should draw line', function() {
            var line = instance.getLine();
            // TODO perform better validation
            expect(line).toBeTruthy();
        });

        it('should draw points', function() {
           var points = instance.getPointBillboards();
           // TODO perform better validation
           expect(points.length).toEqual(3);
        });

        it('should draw wall', function() {
           var wall = instance.getWall();
           // TODO perform better validation
           expect(wall).toBeTruthy();
        });
    });

    describe('toggleCurrent', function() {
       it('should return current toggle value when called without arguments', function() {
           var value = instance.toggleCurrent();

           expect(value).toBeTruthy();
       });

       it('should set current toggle', function() {
           instance.toggleCurrent(false);

           expect(instance.toggleCurrent()).toBeFalsy();
       });

       it('should change show value of current billboard', function() {
           setupTrackStore();
           instance.loadData(trackStore, trackStore.data);

           instance.toggleCurrent(false);

           var marker = instance.getCurrentMarker();
           expect(marker.show.intervals.get(0).data).toBeFalsy();
       });
    });

    describe('toggleLine', function() {
       it('should return current toggle value when called without arguments', function() {
           var value = instance.toggleLine();

           expect(value).toBeTruthy();
       });

       it('should set line toggle', function() {
           instance.toggleLine(false);

           expect(instance.toggleLine()).toBeFalsy();
       });

       it('should change show value of line', function() {
           setupTrackStore();
           instance.loadData(trackStore, trackStore.data);

           instance.toggleLine(false);

           var line = instance.getLine();
           expect(line.show.getValue()).toBeFalsy();
       });
    });

    describe('toggleWall', function() {
        it('should return wall toggle value when called without arguments', function() {
            var value = instance.toggleWall();

            expect(value).toBeTruthy();
        });

        it('should set wall toggle', function() {
            instance.toggleWall(false);

            expect(instance.toggleWall()).toBeFalsy();
        });

        it('should change show value of wall', function() {
            setupTrackStore();
            instance.loadData(trackStore, trackStore.data);

            instance.toggleWall(false);

            var wall = instance.getWall();
            expect(wall.show).toBeFalsy();
        });
    });

    describe('togglePoints', function() {
        it('should return points toggle value when called without arguments', function() {
            var value = instance.togglePoints();

            expect(value).toBeTruthy();
        });

        it('should set points toggle', function() {
            instance.togglePoints(false);

            expect(instance.togglePoints()).toBeFalsy();
        });

        it('should change show value of all points', function() {
            setupTrackStore();
            instance.loadData(trackStore, trackStore.data);

            instance.togglePoints(false);

            var points = instance.getPointBillboards();
            expect(points[0].show).toBeFalsy();
            expect(points[1].show).toBeFalsy();
            expect(points[2].show).toBeFalsy();
        });
    });

    function setupAnnotation() {
        setupTrackStore();
        instance.loadData(trackStore, trackStore.data);

        var annotations = [{
           id: 1,
           data: {
               start: new Date('2014-09-19T12:00Z'),
               end: new Date('2014-09-19T12:00Z'),
               classification: {
                   color: 'rgb(0, 100, 200)'
               }
           }
        }];
        astore.data.items = annotations;
        instance.addAnnotations(astore, annotations);
        // by default annotated lines is disabled, but to test all functionality is has been turned on
        instance.toggleAnnotateLine(true);
    }

    describe('addAnnotations', function() {
        beforeEach(setupAnnotation);

        it('should have changed color of first point and other points should have default color', function() {
            var points = instance.getPointBillboards();

            var annotColor = Cesium.Color.fromCssColorString('rgb(0, 100, 200)');
            var defaultColor = Cesium.Color.fromCssColorString('#bbbb33');
            expect(points[0].color).toEqual(annotColor);
            expect(points[0].id).toEqual(new Date('2014-09-19T12:00Z'));
	    expect(points[1].color).toEqual(defaultColor);
            expect(points[1].id).toEqual(new Date('2014-09-19T14:00Z'));
            expect(points[2].color).toEqual(defaultColor);
            expect(points[2].id).toEqual(new Date('2014-09-19T16:00Z'));
        });

        it('should draw a colored line segment from annotate date time till next point', function() {
            var annot = astore.data.items[0];
            var segment = instance.getAnnotationSegment(annot);

            var expectedPositions = Cesium.Cartesian3.fromDegreesArrayHeights([
                53.4, 4.5, 5, 53.9, 4.9, 7
            ]);
            var expectedColor = Cesium.Color.fromCssColorString('rgb(0, 100, 200)');
            expect(segment.positions).toEqual(expectedPositions);
            expect(segment.material.uniforms.color).toEqual(expectedColor);
        });
    });

    describe('loadAnnotations', function() {
        it('should replace existing annotations', function() {
            setupAnnotation();
            instance.toggleAnnotateLine(true);

            var annotations = [{
                id: 2,
                data: {
                    start: new Date('2014-09-19T12:00Z'),
                    end: new Date('2014-09-19T12:00Z'),
                    classification: {
                        color: 'rgb(200, 100, 0)'
                    }
                }
            }];
            astore.data.items = annotations;

            instance.loadAnnotations(astore, annotations);

            var points = instance.getPointBillboards();

            var expected = Cesium.Color.fromCssColorString('rgb(200, 100, 0)');
            expect(points[0].color).toEqual(expected);
            var segment = instance.getAnnotationSegment(annotations[0]);
            expect(segment).toBeTruthy();
            expect(instance.annotationSegments.length).toEqual(1);
        });
    });

    describe('updateAnnotation', function() {
        var annotColor = null;
        var defaultColor = null;
        beforeEach(function() {
            setupAnnotation();
            var annot = astore.data.items[0];
            annot.data.end = new Date('2014-09-19T14:00Z');
            annot.data.classification.color = 'rgb(111, 111, 111)';

            instance.updateAnnotation(astore, annot);
            // line are off by default
            instance.toggleAnnotateLine(true);

            annotColor = Cesium.Color.fromCssColorString('rgb(111, 111, 111)');
            defaultColor = Cesium.Color.fromCssColorString('#bbbb33');
        });

        it('should change position of line segment', function() {
            var segment = instance.getAnnotationSegment(astore.data.items[0]);

            var expectedPositions = Cesium.Cartesian3.fromDegreesArrayHeights([
                53.4, 4.5, 5, 53.9, 4.9, 7, 51.9, 3.9, 0
            ]);
            expect(segment.positions).toEqual(expectedPositions);
        });

        it('should change color of line segment', function() {
            var segment = instance.getAnnotationSegment(astore.data.items[0]);

            expect(segment.material.uniforms.color).toEqual(annotColor);
        });

        it('should change colors of points', function() {
            var points = instance.getPointBillboards();
            expect(points[0].color).toEqual(annotColor);
            expect(points[1].color).toEqual(annotColor);
            expect(points[2].color).toEqual(defaultColor);
        });
    });

    describe('removeAnnotation', function() {
        beforeEach(function() {
            setupAnnotation();
            var annot = astore.data.items[0];

            instance.removeAnnotation(astore, annot);
        });

        it('should remove line segment', function() {
            expect(instance.annotationSegments.length).toEqual(0);
        });

        it('should change point back to default color', function() {
            var defaultColor = Cesium.Color.fromCssColorString('#bbbb33');

            var points = instance.getPointBillboards();
            expect(points[0].color).toEqual(defaultColor);
        });
    });

    describe('dateFocus', function() {
       it('should set clock when track is loaded', function() {
           setupTrackStore();
           instance.loadData(trackStore, trackStore.data);
           var dt = new Date('2014-09-19T14:00Z');

           instance.dateFocus(dt);

           var expected = Cesium.JulianDate.fromDate(dt);
           expect(instance.viewer.clock.currentTime).toEqual(expected);
       });

       it('should not set clock when track is not loaded', function() {
           setupTrackStore();
           var dt = new Date('2014-09-19T14:00Z');

           instance.dateFocus(dt);

           var expected = Cesium.JulianDate.fromDate(new Date('2014-09-19T12:00Z'));
           expect(instance.viewer.clock.currentTime).toEqual(expected);
       });
    });

    describe('toggleAnnotateLine', function() {
        beforeEach(setupAnnotation);

        it('should return current toggle value when called without arguments', function() {
            var value = instance.toggleAnnotateLine();

            expect(value).toBeTruthy();
        });

        it('should set annotate line toggle', function() {
            instance.toggleAnnotateLine(false);

            expect(instance.toggleAnnotateLine()).toBeFalsy();
        });
    });

    describe('toggleAnnotatePoints', function() {
        beforeEach(setupAnnotation);

        it('should return current toggle value when called without arguments', function() {
            var value = instance.toggleAnnotatePoints();

            expect(value).toBeTruthy();
        });

        it('should set annotate points toggle', function() {
            instance.toggleAnnotatePoints(false);

            expect(instance.toggleAnnotatePoints()).toBeFalsy();
        });
    });

    describe('updateAnnotateLine', function() {
        beforeEach(setupAnnotation);

        it('should draw zero annotation segments when set to false', function() {
            instance.toggleAnnotateLine(false);

            instance.updateAnnotateLine(false, true);

            var segment = instance.getAnnotationSegment(astore.data.items[0]);
            expect(segment).toBeUndefined();
        });
    });

    describe('updateAnnotatePoints', function() {
        beforeEach(setupAnnotation);

        it('should not color points when set to false', function() {
            instance.toggleAnnotatePoints(false);

            instance.updateAnnotatePoints(false, true);

            var defaultColor = Cesium.Color.fromCssColorString('#bbbb33');
            var points = instance.getPointBillboards();
            expect(points[0].color).toEqual(defaultColor);
        });
    });
});

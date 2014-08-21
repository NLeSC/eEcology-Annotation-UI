describe('TrackAnnot.store.Annotations', function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    function setter(k, v) {
    	this.data[k] = v;
    };

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create('TrackAnnot.store.Annotations', function() {
            var me = this;
            this.data = [];
            this.each = function(cb) {
            	me.data.forEach(cb);
            };
            this.getAt = function(i) {
                return me.data[i];
            };
            this.add = function(d) {
            	me.data.push({
            		data: d,
             	    set: setter
            	});
            };
            this.insert = function(i, d) {
            	me.data.splice(i, 0, {
            		data: d,
             	    set: setter
            	});
            };
            this.remove = function(d) {
            	if (!Array.isArray(d)) {
            		d = [d];
            	}
            	d.forEach(function(r) {
                	var i = me.data.indexOf(r);
                	if (i === -1) {
                		return;
                	}
                	me.data.splice(i, 1);
            	});
            }
            this.removeAt = function(index) {
            	me.data.splice(index, 1);
            };
            this.findBy = function(fn) {
            	var records = this.data.filter(fn);
            	if (!records) {
            		return -1;
            	}
            	return me.data.indexOf(records[0]);
            };
            this.indexOf = function(d) {
            	return me.data.indexOf(d);
            }
            ExtSpec.Jasmine.createConfigSpies(this);
        });
        Ext.JSON = {
            encode: JSON.stringify,
            decode: JSON.parse
        };
    });

    it('should have Annotation model', function() {
       expect(instance.model).toEqual('TrackAnnot.model.Annotation');
    });

    describe('exportText', function() {
        var trackStore = null;

        beforeEach(function() {
            trackStore = {
                trackerId: 1234,
                eachRange: function(start, end, cb) {
                    cb({date_time: new Date('2013-08-28T10:00:00Z')});
                }
            };
            spyOn(trackStore, 'eachRange').andCallThrough();
        });

        it('no annotations', function() {
            var data = instance.exportText(trackStore);

            expect(data).toEqual('id,ts,class\n');
        });

        it('one annotation', function() {
            instance.data.push({data: {
                start: 'start1',
                end: 'end1',
                class_id: 4
            }});

            var data = instance.exportText(trackStore);

            expect(trackStore.eachRange).toHaveBeenCalledWith('start1', 'end1', jasmine.any(Function));
            expect(data).toEqual('id,ts,class\n1234,2013-08-28T10:00:00.000Z,4\n');
        });
    });

    describe('importText', function() {
       var classStore = null;
       var trackStore = null;

       beforeEach(function() {
           classStore = {
               data: {
                   4: {data: 'class1'},
                   5: {data: 'class2'},
               },
               getById: function(key) {
                   if (key in this.data) {
                       return this.data[key];
                   } else {
                       return null;
                   }
               }
           };
           Ext.StoreMgr = {
               get: function(storeId) {
                   return classStore;
               }
           };
           trackStore = {
               trackerId: 355,
               data: [
                   {date_time: new Date("2013-08-28T08:00:00.000Z")},
                   {date_time: new Date("2013-08-28T10:00:00.000Z")},
                   {date_time: new Date("2013-08-28T12:00:00.000Z")},
                   {date_time: new Date("2013-08-28T14:00:00.000Z")},
                   {date_time: new Date("2013-08-28T16:00:00.000Z")},
               ]
           };

       });

       it('one annotation of 1 timepoint in middle', function() {
           var text = 'id,ts,class\n355,2013-08-28T10:00:00.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.data).toEqual([{
        	   data: {
	               start: new Date("2013-08-28T10:00:00.000Z"),
	               end: new Date("2013-08-28T10:00:00.000Z"),
	               class_id: 4,
	               classification: 'class1'
        	   },
        	   set: setter
           }]);
       });

       it('one annotation of 1 timepoint at start', function() {
           var text = 'id,ts,class\n355,2013-08-28T08:00:00.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.data).toEqual([{
        	   data: {
	               start: new Date("2013-08-28T08:00:00.000Z"),
	               end: new Date("2013-08-28T08:00:00.000Z"),
	               class_id: 4,
	               classification: 'class1'
        	   },
        	   set: setter
           }]);
       });

       it('one annotation of 1 timepoint at end', function() {
           var text = 'id,ts,class\n355,2013-08-28T16:00:00.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.data).toEqual([{
        	   data: {
	               start: new Date("2013-08-28T16:00:00.000Z"),
	               end: new Date("2013-08-28T16:00:00.000Z"),
	               class_id: 4,
	               classification: 'class1'
        	   },
        	   set: setter
           }]);
       });

       it('one annotation of 2 timepoints', function() {
           var text = 'id,ts,class\n355,2013-08-28T10:00:00.000Z,4\n355,2013-08-28T12:00:00.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.data).toEqual([{
        	   data: {
	               start: new Date("2013-08-28T10:00:00.000Z"),
	               end: new Date("2013-08-28T12:00:00.000Z"),
	               class_id: 4,
	               classification: 'class1'
        	   },
        	   set: setter
           }]);
       });

       it('two annotations each 1 timepoint', function() {
           var text = 'id,ts,class\n355,2013-08-28T10:00:00.000Z,4\n355,2013-08-28T12:00:00.000Z,5\n';
           instance.importText(text, trackStore);

           expect(instance.data).toEqual([{
        	   data: {
	               start: new Date("2013-08-28T10:00:00.000Z"),
	               end: new Date("2013-08-28T10:00:00.000Z"),
	               class_id: 4,
	               classification: 'class1'
        	   },
        	   set: setter
           }, {
        	   data: {
	               start: new Date("2013-08-28T12:00:00.000Z"),
	               end: new Date("2013-08-28T12:00:00.000Z"),
	               class_id: 5,
	               classification: 'class2'
        	   },
        	   set: setter
           }]);
       });

       it('two annotations each 1 timepoint with gap', function() {
           var text = 'id,ts,class\n355,2013-08-28T10:00:00.000Z,4\n355,2013-08-28T14:00:00.000Z,5\n';
           instance.importText(text, trackStore);

           expect(instance.data).toEqual([{
        	   data: {
	               start: new Date("2013-08-28T10:00:00.000Z"),
	               end: new Date("2013-08-28T10:00:00.000Z"),
	               class_id: 4,
	               classification: 'class1'
        	   },
        	   set: setter
           }, {
        	   data: {
	               start: new Date("2013-08-28T14:00:00.000Z"),
	               end: new Date("2013-08-28T14:00:00.000Z"),
	               class_id: 5,
	               classification: 'class2'
        	   },
        	   set: setter
           }]);
       });

       it('one annotation of 1 timepoint with wrong ts', function() {
           var text = 'id,ts,class\n355,2013-08-28T11:11:11.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.data).toEqual([]);
       });

       it('one annotation of 1 timepoint with wrong tracker id', function() {
           var text = 'id,ts,class\n999,2013-08-28T10:00:00.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.data).toEqual([]);
       });

       it('two annotations with same timepoint will use last annotation', function() {
           var text = 'id,ts,class\n355,2013-08-28T14:00:00.000Z,4\n355,2013-08-28T14:00:00.000Z,5\n';
           instance.importText(text, trackStore);

           expect(instance.data).toEqual([{
        	   data: {
	               start: new Date("2013-08-28T14:00:00.000Z"),
	               end: new Date("2013-08-28T14:00:00.000Z"),
	               class_id: 5,
	               classification: 'class2'
        	   },
        	   set: setter
           }]);
       });

       it('one annotation of 1 timepoint with unknown class', function() {
           var text = 'id,ts,class\n355,2013-08-28T10:00:00.000Z,1234\n';

           expect(function() {
               instance.importText(text, trackStore);
           }).toThrow(new Error('Annotation class with "1234" identifier is unknown'));
       });

       it('one annotation of last 1 timepoint with unknown class', function() {
           var text = 'id,ts,class\n355,2013-08-28T16:00:00.000Z,1234\n';

           expect(function() {
               instance.importText(text, trackStore);
           }).toThrow(new Error('Annotation class with "1234" identifier is unknown'));
       });
    });

    describe('getClassificationAtDateTime', function() {
    	it('it should return false when date time is not annotated', function() {
    		var dt = new Date("2013-08-28T14:00:00.000Z");
    		
    		var result = instance.getClassificationAtDateTime(dt);
    		
    		expect(result).toBeFalsy();
    	});
    	
    	it('it should return class when date time is annotated', function() {
    		var dt = new Date("2013-08-28T14:00:00.000Z");
    		var classification = {id: 1234};
    		var existing = {
        			start: dt,
        			end: dt,
        			class_id: 1234,
        			classification: classification
        	};
    		instance.add(existing);

    		var result = instance.getClassificationAtDateTime(dt);
    		
    		expect(result).toEqual(classification);
    	});
    });
    
    describe('setClassificationAt', function() {
    	var trackStore;
    	beforeEach(function() {
    		trackStore = ExtSpec.create('TrackAnnot.store.Track', function() {
    			this.callParent = jasmine.createSpy('callParent');
    			this.addEvents = jasmine.createSpy('addEvents');
    			this.initConfig = jasmine.createSpy('initConfig');
    			this.fireEvent = jasmine.createSpy('fireEvent');
    		});
    	});

    	it('should do nothing when track is missing requested date_time', function() {
    		var dt = new Date("2013-08-28T14:00:00.000Z");
    		var classification = {id: 1234};
    		trackStore.loadData([]);

    		instance.setClassificationAt(dt, classification, trackStore);

    		expect(instance.data).toEqual([]);
    	});

    	it('should add annotation when there is no annotation', function() {
    		var dt = new Date("2013-08-28T14:00:00.000Z");
    		var classification = {id: 1234};
    		trackStore.loadData([{
    			date_time: dt,
    			lon: 0.0, lat: 0.0
    		}]);

    		instance.setClassificationAt(dt, classification, trackStore);

    		var expected = {
         	    data: {
	    			start: dt,
	    			end: dt,
	    			class_id: 1234,
	    			classification: classification
         	    },
         	    set: setter
    		};
    		expect(instance.data).toEqual([expected]);
    	});

    	it('should remove annotation when there is an annotation', function() {
    		var dt = new Date("2013-08-28T14:00:00.000Z");
    		var classification = {id: 1234};
    		var existing = {
        			start: dt,
        			end: dt,
        			class_id: 1234,
        			classification: classification
        	};
    		instance.add(existing);
    		trackStore.loadData([{
    			date_time: dt,
    			lon: 0.0, lat: 0.0
    		}]);

    		instance.setClassificationAt(dt, null, trackStore);

    		expect(instance.data).toEqual([]);
    	});

    	it('should change classification an annotation which exists at same place', function() {
    		var dt = new Date("2013-08-28T14:00:00.000Z");
    		var existing = {
        			start: dt,
        			end: dt,
        			class_id: 1234,
        			classification: {
        				id: 1234
        			}
        	};
    		instance.add(existing);
    		trackStore.loadData([{
    			date_time: dt,
    			lon: 0.0, lat: 0.0
    		}]);
    		var classification = {id: 5678};

    		instance.setClassificationAt(dt, classification, trackStore);

    		var expected = {
         	    data: {
	    			start: dt,
	    			end: dt,
	    			class_id: 5678,
	    			classification: classification
         	    },
         	    set: setter
    		};
    		expect(instance.data).toEqual([expected]);
    	});

    	it('should keep classification when it is not changed', function() {
    	    var dt = new Date("2013-08-28T14:00:00.000Z");
            var classification = {id: 1234};
            var existing = {
                    start: dt,
                    end: dt,
                    class_id: 1234,
                    classification: classification
            };
            instance.add(existing);
            trackStore.loadData([{
                date_time: dt,
                lon: 0.0, lat: 0.0
            }]);

            instance.setClassificationAt(dt, classification, trackStore);

            var expected = {
                data: {
                    start: dt,
                    end: dt,
                    class_id: 1234,
                    classification: classification
                },
                set: setter
            };
            expect(instance.data).toEqual([expected]);
    	});

    	it('should grow annotation with same class is before current', function() {
    		var dt1 = new Date("2013-08-28T14:00:00.000Z");
    		var dt2 = new Date("2013-08-28T14:00:30.000Z");
    		var classification = {id: 1234};
    		var existing = {
        			start: dt1,
        			end: dt1,
        			class_id: 1234,
        			classification: classification
        	};
    		instance.add(existing);
    		trackStore.loadData([{
    			date_time: dt1,
    			lon: 0.0, lat: 0.0
    		}, {
    			date_time: dt2,
    			lon: 1.0, lat: 1.0
    		}]);

    		instance.setClassificationAt(dt2, classification, trackStore);

    		var expected = {
				data: {
        			start: dt1,
        			end: dt2,
        			class_id: 1234,
        			classification: classification
         	    },
         	    set: setter
        	};
    		expect(instance.data).toEqual([expected]);
    	});

    	it('should add annotation when annotation with different class is before current', function() {
    		var dt1 = new Date("2013-08-28T14:00:00.000Z");
    		var dt2 = new Date("2013-08-28T14:00:30.000Z");
    		var classification = {id: 1234};
    		var existing = {
        			start: dt1,
        			end: dt1,
        			class_id: 1234,
        			classification: classification
        	};
    		instance.add(existing);
    		trackStore.loadData([{
    			date_time: dt1,
    			lon: 0.0, lat: 0.0
    		}, {
    			date_time: dt2,
    			lon: 1.0, lat: 1.0
    		}]);

    		var classification2 = {id: 5678};
    		instance.setClassificationAt(dt2, classification2, trackStore);

    		var expected = [{
				data: {
        			start: dt2,
        			end: dt2,
        			class_id: 5678,
        			classification: classification2
         	    },
         	    set: setter
    		},{
				data: {
        			start: dt1,
        			end: dt1,
        			class_id: 1234,
        			classification: classification
         	    },
         	    set: setter
        	}];
    		expect(instance.data).toEqual(expected);
    	});

    	it('should grow annotation with same class is after current', function() {
    		var dt1 = new Date("2013-08-28T14:00:00.000Z");
    		var dt2 = new Date("2013-08-28T14:00:30.000Z");
    		var classification = {id: 1234};
    		var existing = {
        			start: dt2,
        			end: dt2,
        			class_id: 1234,
        			classification: classification
        	};
    		instance.add(existing);
    		trackStore.loadData([{
    			date_time: dt1,
    			lon: 0.0, lat: 0.0
    		}, {
    			date_time: dt2,
    			lon: 1.0, lat: 1.0
    		}]);

    		instance.setClassificationAt(dt1, classification, trackStore);

    		var expected = {
				data: {
        			start: dt1,
        			end: dt2,
        			class_id: 1234,
        			classification: classification
         	    },
         	    set: setter
        	};
    		expect(instance.data).toEqual([expected]);
    	});

    	it('should add annotation when annotation with different class is after current', function() {
    		var dt1 = new Date("2013-08-28T14:00:00.000Z");
    		var dt2 = new Date("2013-08-28T14:00:30.000Z");
    		var classification = {id: 1234};
    		var existing = {
        			start: dt2,
        			end: dt2,
        			class_id: 1234,
        			classification: classification
        	};
    		instance.add(existing);
    		trackStore.loadData([{
    			date_time: dt1,
    			lon: 0.0, lat: 0.0
    		}, {
    			date_time: dt2,
    			lon: 1.0, lat: 1.0
    		}]);

    		var classification2 = {id: 5678};
    		instance.setClassificationAt(dt1, classification2, trackStore);

    		var expected = [{
				data: {
        			start: dt1,
        			end: dt1,
        			class_id: 5678,
        			classification: classification2
         	    },
         	    set: setter
    		},{
				data: {
        			start: dt2,
        			end: dt2,
        			class_id: 1234,
        			classification: classification
         	    },
         	    set: setter
        	}];
    		expect(instance.data).toEqual(expected);
    	});

    	it('should merge annotation when surrounding annotation have same class', function() {
    	    var dt1 = new Date("2013-08-28T14:00:00.000Z");
            var dt2 = new Date("2013-08-28T14:00:30.000Z");
            var dt3 = new Date("2013-08-28T14:01:00.000Z");
            var classification = {id: 1234};
            instance.add({
                start: dt1,
                end: dt1,
                class_id: 1234,
                classification: classification
            });
            instance.add({
                start: dt3,
                end: dt3,
                class_id: 1234,
                classification: classification
            });
            trackStore.loadData([{
                date_time: dt1,
                lon: 0.0, lat: 0.0
            }, {
                date_time: dt2,
                lon: 1.0, lat: 1.0
            }, {
                date_time: dt3,
                lon: 2.0, lat: 2.0
            }]);

            instance.setClassificationAt(dt2, classification, trackStore);

            var expected = [{
                data: {
                    start: dt1,
                    end: dt3,
                    class_id: 1234,
                    classification: classification
                },
                set: setter
            }];
            expect(instance.data).toEqual(expected);
    	});
    	
    	it('should merge annotation when surrounding annotation have same class and current has different class', function() {
    	    var dt1 = new Date("2013-08-28T14:00:00.000Z");
            var dt2 = new Date("2013-08-28T14:00:30.000Z");
            var dt3 = new Date("2013-08-28T14:01:00.000Z");
            var classification = {id: 1234};
            instance.add({
                start: dt1,
                end: dt1,
                class_id: 1234,
                classification: classification
            });
            instance.add({
                start: dt2,
                end: dt2,
                class_id: 'abcd',
                classification: {id: 'abcd'}
            });
            instance.add({
                start: dt3,
                end: dt3,
                class_id: 1234,
                classification: classification
            });
            trackStore.loadData([{
                date_time: dt1,
                lon: 0.0, lat: 0.0
            }, {
                date_time: dt2,
                lon: 1.0, lat: 1.0
            }, {
                date_time: dt3,
                lon: 2.0, lat: 2.0
            }]);

            instance.setClassificationAt(dt2, classification, trackStore);

            var expected = [{
                data: {
                    start: dt1,
                    end: dt3,
                    class_id: 1234,
                    classification: classification
                },
                set: setter
            }];
            expect(instance.data).toEqual(expected);
    	});
    	
    	it('should create new annotation and split existing annotation in two when annotation is broader than selected date time', function() {
    		var dt1 = new Date("2013-08-28T14:00:00.000Z");
            var dt2 = new Date("2013-08-28T14:00:30.000Z");
            var dt3 = new Date("2013-08-28T14:01:00.000Z");
            instance.add({
                start: dt1,
                end: dt3,
                class_id: 1234,
                classification: {id: 1234}
            });
            trackStore.loadData([{
                date_time: dt1,
                lon: 0.0, lat: 0.0
            }, {
                date_time: dt2,
                lon: 1.0, lat: 1.0
            }, {
                date_time: dt3,
                lon: 2.0, lat: 2.0
            }]);

            var classification = {id: 5678};
            instance.setClassificationAt(dt2, classification, trackStore);

            var expected = [{
                data: {
                    start: dt1,
                    end: dt1,
                    class_id: 1234,
                    classification: {id: 1234}
                },
                set: setter
            }, {
                data: {
                    start: dt2,
                    end: dt2,
                    class_id: 5678,
                    classification: {id: 5678}
                },
                set: setter
            }, {
                data: {
                    start: dt3,
                    end: dt3,
                    class_id: 1234,
                    classification: {id: 1234}
                },
                set: setter
            }];
            expect(instance.data).toEqual(expected);
    	});
    	
    	it('should shorten annotation when annotation is also at previous date_time', function() {
    		var dt1 = new Date("2013-08-28T14:00:00.000Z");
    		var dt2 = new Date("2013-08-28T14:00:30.000Z");
    		var existing = {
        			start: dt1,
        			end: dt2,
        			class_id: 1234,
        			classification: {id: 1234}
        	};
    		instance.add(existing);
    		trackStore.loadData([{
    			date_time: dt1,
    			lon: 0.0, lat: 0.0
    		}, {
    			date_time: dt2,
    			lon: 1.0, lat: 1.0
    		}]);

    		instance.setClassificationAt(dt2, null, trackStore);

    		var expected = [{
				data: {
        			start: dt1,
        			end: dt1,
        			class_id: 1234,
        			classification: {id: 1234}
         	    },
         	    set: setter
        	}];
    		expect(instance.data).toEqual(expected);
    	});
    	
    	it('should shorten annotation when annotation is also at next date_time', function() {
    		var dt1 = new Date("2013-08-28T14:00:00.000Z");
    		var dt2 = new Date("2013-08-28T14:00:30.000Z");
    		var existing = {
        			start: dt1,
        			end: dt2,
        			class_id: 1234,
        			classification: {id: 1234}
        	};
    		instance.add(existing);
    		trackStore.loadData([{
    			date_time: dt1,
    			lon: 0.0, lat: 0.0
    		}, {
    			date_time: dt2,
    			lon: 1.0, lat: 1.0
    		}]);

    		instance.setClassificationAt(dt1, null, trackStore);

    		var expected = [{
				data: {
        			start: dt2,
        			end: dt2,
        			class_id: 1234,
        			classification: {id: 1234}
         	    },
         	    set: setter
        	}];
    		expect(instance.data).toEqual(expected);
    	});
    	
    	it('should split annotation with a gap at current when annotation is before and after current' , function() {
    		var dt1 = new Date("2013-08-28T14:00:00.000Z");
            var dt2 = new Date("2013-08-28T14:00:30.000Z");
            var dt3 = new Date("2013-08-28T14:01:00.000Z");
            instance.add({
                start: dt1,
                end: dt3,
                class_id: 1234,
                classification: {id: 1234}
            });
            trackStore.loadData([{
                date_time: dt1,
                lon: 0.0, lat: 0.0
            }, {
                date_time: dt2,
                lon: 1.0, lat: 1.0
            }, {
                date_time: dt3,
                lon: 2.0, lat: 2.0
            }]);

            instance.setClassificationAt(dt2, null, trackStore);

            var expected = [{
                data: {
                    start: dt1,
                    end: dt1,
                    class_id: 1234,
                    classification: {id: 1234}
                },
                set: setter
            }, {
                data: {
                    start: dt3,
                    end: dt3,
                    class_id: 1234,
                    classification: {id: 1234}
                },
                set: setter
            }];
            expect(instance.data).toEqual(expected);
    	});

    	it('should grow annotation on left side and shrink annotation on right side', function() {
    	    var dt1 = new Date("2013-08-28T14:00:00.000Z");
            var dt2 = new Date("2013-08-28T14:00:30.000Z");
            var dt3 = new Date("2013-08-28T14:01:00.000Z");
            var classification = {id: 1234};
            instance.add({
                start: dt1,
                end: dt1,
                class_id: 1234,
                classification: classification
            });
            instance.add({
                start: dt2,
                end: dt3,
                class_id: 5678,
                classification: {id: 5678}
            });
            trackStore.loadData([{
                date_time: dt1,
                lon: 0.0, lat: 0.0
            }, {
                date_time: dt2,
                lon: 1.0, lat: 1.0
            }, {
                date_time: dt3,
                lon: 2.0, lat: 2.0
            }]);

            instance.setClassificationAt(dt2, classification, trackStore);

            var expected = [{
                data: {
                    start: dt1,
                    end: dt2,
                    class_id: 1234,
                    classification: classification
                },
                set: setter
            }, {
                data: {
                    start: dt3,
                    end: dt3,
                    class_id: 5678,
                    classification: {id: 5678}
                },
                set: setter
            }];
            expect(instance.data).toEqual(expected);
    	});
    	
    	it('should grow annotation on right side and shrink annotation on left side', function() {
    	    var dt1 = new Date("2013-08-28T14:00:00.000Z");
            var dt2 = new Date("2013-08-28T14:00:30.000Z");
            var dt3 = new Date("2013-08-28T14:01:00.000Z");
            var c1 = {id: 1234};
            var c2 = {id: 5678};
            instance.add({
                start: dt1,
                end: dt2,
                class_id: 1234,
                classification: c1
            });
            instance.add({
                start: dt3,
                end: dt3,
                class_id: 5678,
                classification: c2
            });
            trackStore.loadData([{
                date_time: dt1,
                lon: 0.0, lat: 0.0
            }, {
                date_time: dt2,
                lon: 1.0, lat: 1.0
            }, {
                date_time: dt3,
                lon: 2.0, lat: 2.0
            }]);

            instance.setClassificationAt(dt2, c2, trackStore);

            var expected = [{
                data: {
                    start: dt1,
                    end: dt1,
                    class_id: 1234,
                    classification: c1
                },
                set: setter
            }, {
                data: {
                    start: dt2,
                    end: dt3,
                    class_id: 5678,
                    classification: c2
                },
                set: setter
            }];
            expect(instance.data).toEqual(expected);
    	});
    	
    	it('should append new annotation and shrink prev annotation', function() {
    	    var dt1 = new Date("2013-08-28T14:00:00.000Z");
            var dt2 = new Date("2013-08-28T14:00:30.000Z");
            var c1 = {id: 1234};
            var c2 = {id: 5678};
            instance.add({
                start: dt1,
                end: dt2,
                class_id: 1234,
                classification: c1
            });
            trackStore.loadData([{
                date_time: dt1,
                lon: 0.0, lat: 0.0
            }, {
                date_time: dt2,
                lon: 1.0, lat: 1.0
            }]);

            instance.setClassificationAt(dt2, c2, trackStore);

            var expected = [{
                data: {
                    start: dt1,
                    end: dt1,
                    class_id: 1234,
                    classification: c1
                },
                set: setter
            }, {
                data: {
                    start: dt2,
                    end: dt2,
                    class_id: 5678,
                    classification: c2
                },
                set: setter
            }];
            expect(instance.data).toEqual(expected);
    	});
    	
    	it('should prepend new annotation and shrink next annotation', function() {
    	    var dt1 = new Date("2013-08-28T14:00:00.000Z");
            var dt2 = new Date("2013-08-28T14:00:30.000Z");
            var c1 = {id: 1234};
            var c2 = {id: 5678};
            instance.add({
                start: dt1,
                end: dt2,
                class_id: 1234,
                classification: c1
            });
            trackStore.loadData([{
                date_time: dt1,
                lon: 0.0, lat: 0.0
            }, {
                date_time: dt2,
                lon: 1.0, lat: 1.0
            }]);

            instance.setClassificationAt(dt1, c2, trackStore);

            var expected = [{
                data: {
                    start: dt1,
                    end: dt1,
                    class_id: 5678,
                    classification: c2
                },
                set: setter
            }, {
                data: {
                    start: dt2,
                    end: dt2,
                    class_id: 1234,
                    classification: c1
                },
                set: setter
            }];
            expect(instance.data).toEqual(expected);
    	});
    });
});
describe('TrackAnnot.store.Annotations', function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create('TrackAnnot.store.Annotations', function() {
            var me = this;
            this.data = [];
            this.each = function(cb) {
                me.data.forEach(cb);
            };
            this.add = jasmine.createSpy('add');
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
            
            expect(data).toEqual('[]');
        });
        
        it('one annotation', function() {
            instance.data.push({data: {
                start: 'start1',
                end: 'end1',
                class_id: 'class1'
            }});
            
            var data = instance.exportText(trackStore);
            
            expect(trackStore.eachRange).toHaveBeenCalledWith('start1', 'end1', jasmine.any(Function));
            expect(data).toEqual('[{"id":1234,"ts":"2013-08-28T10:00:00.000Z","class":"class1"}]');
        });
    });
    
    describe('importText', function() {
       var classStore = null;
       
       beforeEach(function() {
           classStore = {
               data: {
                   'class1': {data: 1234},
                   'class2': {data: 5678},
               },
               getById: function(key) {
                   return this.data[key];
               }
           };
           Ext.StoreMgr = {
               get: function(storeId) {
                   return classStore;
               }
           };
       });
       
       it('one annotation of 1 timepoint', function() {
           instance.importText('[{"id":1234,"ts":"2013-08-28T10:00:00.000Z","class":"class1"}]');
           
           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T10:00:00.000Z"),
               end: new Date("2013-08-28T10:00:00.000Z"),
               class_id: 'class1',
               classification: 1234
           });
       });

       it('one annotation of 2 timepoints', function() {
           instance.importText('[{"id":1234,"ts":"2013-08-28T10:00:00.000Z","class":"class1"},{"id":1234,"ts":"2013-08-28T12:00:00.000Z","class":"class1"}]');
           
           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T10:00:00.000Z"),
               end: new Date("2013-08-28T12:00:00.000Z"),
               class_id: 'class1',
               classification: 1234
           });
       });
       
       it('two annotations each 1 timepoint', function() {
           instance.importText('[{"id":1234,"ts":"2013-08-28T10:00:00.000Z","class":"class1"},{"id":1234,"ts":"2013-08-28T12:00:00.000Z","class":"class2"}]');
           
           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T10:00:00.000Z"),
               end: new Date("2013-08-28T10:00:00.000Z"),
               class_id: 'class1',
               classification: 1234
           });

           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T12:00:00.000Z"),
               end: new Date("2013-08-28T12:00:00.000Z"),
               class_id: 'class2',
               classification: 5678
           });
       });
    });
});
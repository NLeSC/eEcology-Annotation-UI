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

           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T10:00:00.000Z"),
               end: new Date("2013-08-28T10:00:00.000Z"),
               class_id: 4,
               classification: 'class1'
           });
       });

       it('one annotation of 1 timepoint at start', function() {
           var text = 'id,ts,class\n355,2013-08-28T08:00:00.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T08:00:00.000Z"),
               end: new Date("2013-08-28T08:00:00.000Z"),
               class_id: 4,
               classification: 'class1'
           });
       });

       it('one annotation of 1 timepoint at end', function() {
           var text = 'id,ts,class\n355,2013-08-28T16:00:00.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T16:00:00.000Z"),
               end: new Date("2013-08-28T16:00:00.000Z"),
               class_id: 4,
               classification: 'class1'
           });
       });

       it('one annotation of 2 timepoints', function() {
           var text = 'id,ts,class\n355,2013-08-28T10:00:00.000Z,4\n355,2013-08-28T12:00:00.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T10:00:00.000Z"),
               end: new Date("2013-08-28T12:00:00.000Z"),
               class_id: 4,
               classification: 'class1'
           });
       });

       it('two annotations each 1 timepoint', function() {
           var text = 'id,ts,class\n355,2013-08-28T10:00:00.000Z,4\n355,2013-08-28T12:00:00.000Z,5\n';
           instance.importText(text, trackStore);

           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T10:00:00.000Z"),
               end: new Date("2013-08-28T10:00:00.000Z"),
               class_id: 4,
               classification: 'class1'
           });

           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T12:00:00.000Z"),
               end: new Date("2013-08-28T12:00:00.000Z"),
               class_id: 5,
               classification: 'class2'
           });
       });

       it('two annotations each 1 timepoint with gap', function() {
           var text = 'id,ts,class\n355,2013-08-28T10:00:00.000Z,4\n355,2013-08-28T14:00:00.000Z,5\n';
           instance.importText(text, trackStore);

           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T10:00:00.000Z"),
               end: new Date("2013-08-28T10:00:00.000Z"),
               class_id: 4,
               classification: 'class1'
           });

           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T14:00:00.000Z"),
               end: new Date("2013-08-28T14:00:00.000Z"),
               class_id: 5,
               classification: 'class2'
           });
       });

       it('one annotation of 1 timepoint with wrong ts', function() {
           var text = 'id,ts,class\n355,2013-08-28T11:11:11.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.add).not.toHaveBeenCalled();
       });

       it('one annotation of 1 timepoint with wrong tracker id', function() {
           var text = 'id,ts,class\n999,2013-08-28T10:00:00.000Z,4\n';
           instance.importText(text, trackStore);

           expect(instance.add).not.toHaveBeenCalled();
       });

       it('two annotations with same timepoint will use last annotation', function() {
           var text = 'id,ts,class\n355,2013-08-28T14:00:00.000Z,4\n355,2013-08-28T14:00:00.000Z,5\n';
           instance.importText(text, trackStore);

           expect(instance.add).toHaveBeenCalledWith({
               start: new Date("2013-08-28T14:00:00.000Z"),
               end: new Date("2013-08-28T14:00:00.000Z"),
               class_id: 5,
               classification: 'class2'
           });
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
});
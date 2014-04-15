describe('TrackAnnot.store.Classifications', function() {
    'use strict';

    var instance = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create('TrackAnnot.store.Classifications', function() {
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

    it('should have Classification model', function() {
       expect(instance.model).toEqual('TrackAnnot.model.Classification');
    });

    describe('exportText', function() {

        it('no classifications', function() {
            var data = instance.exportText();
            expect(data).toEqual('');
        });

        it('one classification', function() {
            instance.data.push({data: {
                id: 1,
                label: 'class1',
                color: 'rgb(0,100,255)'
            }});

            var data = instance.exportText();

            expect(data).toEqual('1 class1 0 0.39 1\n');
        });
    });

    describe('importText', function() {

       it('no classifications', function() {
           var text = '';
           instance.importText(text);

           expect(instance.add).not.toHaveBeenCalled();
       });

       it('one classification', function() {
           var text = '1 class1 0 0.39 1\n';
           instance.importText(text);

           expect(instance.add).toHaveBeenCalledWith({
               id: 1,
               label: 'class1',
               color: 'rgb(0,99,255)'
           });
       });
    });
});
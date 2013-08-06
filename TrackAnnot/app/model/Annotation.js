Ext.define('TrackAnnot.model.Annotation', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.SequentialIdGenerator', 'TrackAnnot.model.Classification'],
    fields: [
        { name: 'id', type: 'int' },
        { name: 'start', type: 'date' },
        { name: 'end', type: 'date' },
        { name: 'lane', type: 'auto' },
        { name: 'class_id', type: 'int'},
        { name: 'classification', type: 'auto', defaultValue: {id: null, name: '', color: 'rgb(211, 211, 211)'} }
    ],
    idgen: 'sequential',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});

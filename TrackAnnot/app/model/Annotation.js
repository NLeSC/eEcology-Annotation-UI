Ext.define('TrackAnnot.model.Annotation', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'int' },
        { name: 'type', type: 'auto' },
        { name: 'start', type: 'date' },
        { name: 'end', type: 'date' },
        { name: 'color', type: 'auto' },
        { name: 'lane', type: 'auto' }
    ]
});

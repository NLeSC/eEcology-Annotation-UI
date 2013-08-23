Ext.define('TrackAnnot.model.Classification', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.SequentialIdGenerator'],
    fields: [
        { name: 'id', type: 'string' },
        { name: 'color', type: 'auto' }
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
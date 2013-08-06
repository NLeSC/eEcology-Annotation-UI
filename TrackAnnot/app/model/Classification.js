Ext.define('TrackAnnot.model.Classification', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.SequentialIdGenerator'],
    fields: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'color', type: 'auto' }
    ],
    idgen: 'sequential',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});

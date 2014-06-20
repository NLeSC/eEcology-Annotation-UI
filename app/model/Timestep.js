Ext.define('TrackAnnot.model.Timestep', {
    extend: 'Ext.data.Model',
    fields: [
        {type: 'string', name: 'text'},
        {type: 'int', name: 'value'},
        {type: 'string', name: 'type'}
    ]
});
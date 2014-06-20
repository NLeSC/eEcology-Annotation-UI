/**
 * Model of a timestep.
 *
 * You can move though the track by changing the current time.
 * This can be done a step at a time.
 * This model describes how big the step should be.
 */
Ext.define('TrackAnnot.model.Timestep', {
    extend: 'Ext.data.Model',
    fields: [
        {type: 'string', name: 'text'},
        {type: 'int', name: 'value'},
        {type: 'string', name: 'type'}
    ]
});
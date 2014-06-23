/**
 * Timestep size picker
 *
 * You can move though the track by changing the current time.
 * This can be done a step at a time.
 * With this combo the user can choose how big the step should be.
 */
Ext.define('TrackAnnot.view.field.TimestepSizePicker', {
    extend: 'Ext.form.ComboBox',
    queryMode: 'local',
    typeAhead: true,
    requires: ['TrackAnnot.store.Timesteps'],
    fieldLabel: 'Step',
    stateful: true,
    stateId: 'timestepsize',
    labelWidth: 20,
    width: 120,
    initComponent: function() {
        this.createStore();
        this.callParent();
    },
    createStore: function() {
        this.store = Ext.create('TrackAnnot.store.Timesteps',{
            data: [
               {text: '1 timepoint', value: 1, type: 'timepoint'},
               {text: '2 timepoint', value: 2, type: 'timepoint'},
               {text: '5 timepoint', value: 5, type: 'timepoint'},
               {text: '9 timepoint', value: 9, type: 'timepoint'},
               {text: '10 timepoint', value: 10, type: 'timepoint'},
               {text: '20 timepoint', value: 20, type: 'timepoint'},
               {text: '30 seconds', value: 30*1000, type: 'ms'},
               {text: '1 minute', value: 60*1000, type: 'ms'},
               {text: '30 minutes', value: 30*60*1000, type: 'ms'},
               {text: '1 hour', value: 60*60*1000, type: 'ms'},
               {text: '4 hours', value: 4*60*60*1000, type: 'ms'},
               {text: '1 day', value: 24*60*60*1000, type: 'ms'}
           ]
        });
        this.value = this.store.getAt(0);
    }
});
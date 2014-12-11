/**
 * Track annotation application
 */
Ext.define('TrackAnnot.Application', {
    extend: 'Ext.app.Application',
    name: 'TrackAnnot',
    requires: ['Ext.state.LocalStorageProvider'],
    views: [
        'Viewport'
    ],
    controllers: [
        'Main'
    ],
    /**
     * Setup persistent state store
     */
    init: function() {
        Ext.state.Manager.setProvider(Ext.create('Ext.state.LocalStorageProvider', {
            prefix: 'ee-annot-'
        }));

        // uncomment to see all application events fired in console
        //Ext.util.Observable.capture(this, function() { console.error(arguments);return true;});
    }
});

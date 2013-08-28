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
    init: function() {
        Ext.state.Manager.setProvider(Ext.create('Ext.state.LocalStorageProvider', {
            prefix: 'ee-annot-'
        }));
    }
});
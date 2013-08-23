/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when upgrading.
*/

// DO NOT DELETE - this directive is required for Sencha Cmd packages to work.
//@require @packageOverrides

Ext.useShims = true;

// do disable caching enable line below
// Ext.Loader.setConfig('disableCaching', false);

Ext.application({
    name: 'TrackAnnot',
    requires: ['Ext.state.LocalStorageProvider'],
    views: [
        'Viewport'
    ],
    controllers: [
        'Main'
    ],
    autoCreateViewport: true,
    init: function() {
        Ext.state.Manager.setProvider(Ext.create('Ext.state.LocalStorageProvider', {
            prefix: 'ee-annot-'
        }));
    }
});

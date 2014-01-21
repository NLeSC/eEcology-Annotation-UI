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
    extend: 'TrackAnnot.Application',
    autoCreateViewport: true
});

// Uncomment to load static demo track
//Ext.onReady(function() {
//    // overwrite web service urls to static files
//    var ctrl = TrackAnnot.getApplication().getController('Main');
//    ctrl.setupUrls('trackers.json', 'demo/tracker.json');
//});

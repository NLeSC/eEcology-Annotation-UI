Ext.define('TrackAnnot.view.dialog.ImportClassifications', {
    extend: 'Ext.window.Window',
    alias: 'widget.importclass',
    height: 400,
    width: 500,
    layout: 'form',
    title: 'Import classifications',
    items: [{
        xtype: 'checkbox',
        fieldLabel: 'Overwrite',
        checked: true,
        id: 'import-classifications-overwrite'
    }, {
        xtype: 'textarea',
        fieldLabel: 'Paste text',
        grow: true,
        growMin: 300,
        emptyText: 'a csv file columns id,label,red_fraction,green_fraction,blue_fraction without header',
        id: 'import-classifications-text'
    }],
    buttons: [{
        text: 'Import',
        id: 'import-classifications'
    }]
});
Ext.define('TrackAnnot.view.dialog.ImportAnnotations', {
    extend: 'Ext.window.Window',
    alias: 'widget.importannot',
    height: 400,
    width: 500,
    layout: 'form',
    title: 'Import annotations',
    items: [{
        xtype: 'checkbox',
        fieldLabel: 'Overwrite',
        checked: true,
        id: 'import-annotations-overwrite'
    }, {
        xtype: 'textarea',
        fieldLabel: 'Paste text',
        grow: true,
        growMin: 300,
        emptyText: 'a csv file columns id,ts,class with header',
        id: 'import-annotations-text'
    }],
    buttons: [{
        text: 'Import',
        id: 'import-annotations'
    }]
});
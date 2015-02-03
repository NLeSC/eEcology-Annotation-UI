/**
 * Dialog to import annotations
 */
Ext.define('TrackAnnot.view.dialog.ImportAnnotations', {
    extend: 'Ext.window.Window',
    alias: 'widget.importannot',
    height: 400,
    width: 500,
    layout: 'form',
    title: 'Import annotations',
    requires: [
        'Ext.layout.container.Form',
        'Ext.form.field.File',
        'Ext.form.field.Checkbox',
        'Ext.form.field.TextArea'
    ],
    uses: ['TrackAnnot.store.reader.File'],
    items: [{
        xtype: 'checkbox',
        fieldLabel: 'Overwrite',
        checked: true,
        id: 'import-annotations-overwrite'
    }, {
        xtype: 'filefield',
        name: 'file',
        fieldLabel: 'Upload',
        listeners: {
            change: function(component) {
                var textarea = Ext.ComponentQuery.query('#import-annotations-text')[0];
                var fileReader = Ext.create('TrackAnnot.store.reader.File');
                fileReader.on('load', function(content) {
                    textarea.setValue(content);
                });
                fileReader.readAsText(component);
            }
        }
    }, {
        fieldLabel: 'Or paste text',
        xtype: 'textarea',
        height: 280,
        emptyText: 'csv file with columns device_info_serial,date_time,class_id with header',
        id: 'import-annotations-text'
    }],
    buttons: [{
        text: 'Import',
        id: 'import-annotations'
    }]
});

/**
 * Dialog to import classifications
 */
Ext.define('TrackAnnot.view.dialog.ImportClassifications', {
    extend: 'Ext.window.Window',
    alias: 'widget.importclass',
    height: 400,
    width: 500,
    layout: 'form',
    title: 'Import classifications',
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
        id: 'import-classifications-overwrite'
    }, {
        xtype: 'filefield',
        name: 'file',
        fieldLabel: 'Upload',
        listeners: {
            change: function(component) {
                var textarea = Ext.ComponentQuery.query('#import-classifications-text')[0];
                var fileReader = Ext.create('TrackAnnot.store.reader.File');
                fileReader.on('load', function(content) {
                    textarea.setValue(content);
                });
                fileReader.readAsText(component);
            }
        }
    }, {
        xtype: 'textarea',
        fieldLabel: 'Or paste text',
        height: 280,
        emptyText: 'a csv file with columns id,label,red_fraction,green_fraction,blue_fraction without header',
        id: 'import-classifications-text'
    }],
    buttons: [{
        text: 'Import',
        id: 'import-classifications'
    }]
});
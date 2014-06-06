Ext.define('TrackAnnot.view.dialog.ImportAnnotations', {
    extend: 'Ext.window.Window',
    alias: 'widget.importannot',
    height: 400,
    width: 500,
    layout: 'form',
    title: 'Import annotations',
    requires: [
        'Ext.form.field.File',
        'Ext.form.field.Checkbox',
        'Ext.form.field.TextArea'
    ],
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
                var fileinput = component.extractFileInput();
                var files = fileinput.files;
                var f = files[0];
                var reader = new FileReader();
                reader.onloadend = function(theFile) {
                    if (reader.readyState == FileReader.DONE) {
                        var textarea = Ext.ComponentQuery.query('#import-annotations-text')[0];
                        textarea.setValue(reader.result);
                    } else {
                        Ext.Msg.show({
                            title: 'Importing annotations failed',
                            msg: reader.error,
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.WARNING
                        });
                    }
                };
                reader.readAsText(f);
            }
        }
    }, {
        fieldLabel: 'Or paste',
        xtype: 'textarea',
        height: 280,
        emptyText: 'csv file columns id,ts,class with header',
        id: 'import-annotations-text'
    }],
    buttons: [{
        text: 'Import',
        id: 'import-annotations'
    }]
});
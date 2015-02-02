/**
 * Grid of classifications
 */
Ext.define("TrackAnnot.view.Classifications", {
    extend : 'Ext.grid.Panel',
    alias : 'widget.classifications',
    store : 'Classifications',
    requires: [
        'Ext.grid.plugin.CellEditing',
        'TrackAnnot.model.Classification',
        'Ext.grid.column.Action',
        'Ext.form.field.Text',
        'Ext.form.field.Number',
        'TrackAnnot.view.dialog.ImportClassifications'
    ],
    uses: ['TrackAnnot.store.writer.File'],
    columns : [{
        text : 'Id',
        dataIndex : 'id',
        editor : {
            xtype : 'numberfield',
            allowBlank : false
        },
        width: 50
    }, {
        text : 'Label',
        dataIndex : 'label',
        editor : {
            xtype : 'textfield',
            allowBlank : false
        },
        flex: 1
    }, {
        text : 'Color',
        dataIndex : 'color',
        renderer : function(v, m) {
            m.style = 'background:' + v + ';';
            return v;
        },
        editor : {
            xtype : 'textfield',
            allowBlank : false
        },
        width: 120
    }, {
        xtype: 'actioncolumn',
        width: 30,
        items: [{
            icon: 'data:image/gif;base64,R0lGODlhEAAQAIcAAED/QLpSNL9TOr5WOb5cQL9cQMFNM8RQNMBVPcBZP8xSPNBPPttWS9ddUcJnTMRkTMdrVM1gUc5iVMxmVclrVs1oWNZgVNZuZNtpZdxraN5ratxuadRxZd14c955dOZWTOZYTOZZTulZTelbT+ZWUOZaUuddWepcUOxfVOBlXO5mUuljW+pmXO5qXvBkVvNzXeNrYeNuY+FvcOJwZuJ7deR4ceJ5eeN4eeJ/feN/fOl7cOh6del/ePJ3Y/N5Y+qDfe6Efe+Gfu6KdfaCaPaEbPCFcPCDe/CMd/GOeviGcPiMdvCRf/eRfveTfvmSfvqTf/iUf9ymltynl+6Mge2Tju6Sj/SOgfqah/qdi/GclvGdluGpnvSgnvSinvWjn/qjkfupnPqrneGroOqwrOuzr/Ono/WmoferofarovWsofWvpfKtqvivpPS0qvi2qPm5r/q6rvC1tfC2tvjDvvzHuvnLxPnTzPzUzf3b1P3c2P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAMAAAAALAAAAAAQABAAAAi6AAEIHEiwoEE5ODRk8EDG4EAbVObYqdNmxgWHMtbkgfMFCxg6OiQUvFEGz5UlSKA4UeImRoWBcX7cwdJECJGbRHywWSBGYA41YY6gGEq0hxUeFARuePOkiJ6nUEW00IJAIIYzSYZAjcoiywCBHaYweSGirNkRRmg8EDiGARoXKsyKAFHCy4EoAznASIPihIgQH0h0sVCgYIQUZoKsMAGES4MADico2FGlSg0DBBwK3AIhgQAHUjSLJhgQADs=',
            tooltip: 'Delete',
            handler: function(gridview, rowIndex) {
                var grid = this.up('panel');
                var editing = grid.getPlugin('editing');
                editing.cancelEdit();
                var store = grid.getStore();
                store.remove(store.getAt(rowIndex));
            }
        }]
    }],
    plugins : [{
        ptype: 'cellediting',
        clicksToMoveEditor: 1,
        autoCancel: false,
        pluginId: 'editing'
    }],
    tbar : [{
        text : 'Add',
        handler : function() {
            var grid = this.up('panel');
            var editing = grid.getPlugin('editing');
            editing.cancelEdit();

            // Create a model instance
            var r = Ext.create('TrackAnnot.model.Classification', {
                type : 'walking',
                color : 'rgb(180, 112, 197)'
            });

            grid.getStore().insert(0, r);
            editing.startEdit(0, 0);
        }
    }, {
        text: 'Save',
        handler: function() {
            var grid = this.up('panel');
            var store = grid.getStore();
            var value = store.exportText();
            var writer = Ext.create('TrackAnnot.store.writer.File', {
                filename: 'schema.txt',
                data: value,
                mime_type: 'text/plain'
            });
            var download_link = writer.getDownloadLink();

            Ext.MessageBox.show({
               title: 'Save',
               msg: 'Please save text below or download ' + download_link,
               width: 300,
               buttons: Ext.MessageBox.OK,
               multiline: true,
               value: value
           });
        }
    }, {
        text: 'Load',
        handler: function() {
            var c = Ext.create('TrackAnnot.view.dialog.ImportClassifications');
            c.show();
        }
    }],
    listeners : {
        edit : function(editor, e) {
            e.record.commit();
        }
    }
});

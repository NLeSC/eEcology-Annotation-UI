/**
 * Grid of annotations
 */
Ext.define("TrackAnnot.view.Annotations", {
    extend : 'Ext.grid.Panel',
    alias : 'widget.annotations',
    store : 'Annotations',
    requires: [
        'TrackAnnot.view.field.DateTime',
        'Ext.grid.plugin.RowEditing',
        'TrackAnnot.model.Annotation',
        'Ext.grid.column.Number',
        'Ext.grid.column.Date',
        'Ext.form.field.ComboBox'
    ],
    initComponent: function() {
        this.callParent(arguments);

        // loadmask did not work auto, so enable it manually
        var me = this;
        var store = this.getStore();
        store.on('beforeload', function() {
          me.setLoading(true);
        });
        store.on('load', function() {
          me.setLoading(false);
        });
        this.addEvents('save', 'load', 'classconfig', 'pickclass', 'createitem', 'removeitem', 'start2current', 'end2current');
    },
    columns : [{
        text : 'Class',
        dataIndex : 'class_id',
        editor : {
            xtype : 'combo',
            displayField: 'label',
            valueField: 'id',
            queryMode: 'local',
            forceSelection: true,
            store : 'Classifications',
            listConfig: {
                getInnerTpl: function() {
                    return '<div style="background: {color};">{label}</div>';
                }
            }
        },
        renderer : function(v, m, r) {
            m.style = 'background:' + r.data.classification.color + ';';
            return r.data.classification.label;
        }
    }, {
        text : 'Start',
        dataIndex : 'start',
        flex : 1,
        renderer: function(v) {
            return v.toISOString();
        },
        editor : {
            xtype : 'datetimefield',
            allowBlank : false
        }
    }, {
        text : 'End',
        dataIndex : 'end',
        flex : 1,
        renderer: function(v) {
            return v.toISOString();
        },
        editor : {
            xtype : 'datetimefield',
            allowBlank : false
        }
    }, {
        xtype: 'actioncolumn',
        width: 60,
        items: [{
            iconCls: 'icon-delete',
            tooltip: 'Delete',
            handler: function(gridview, rowIndex) {
                var grid = gridview.up('panel');
                grid.fireEvent('removeitem', grid, rowIndex);
            }
        }, {
            iconCls: 'icon-start2current',
            tooltip: 'Set Start time to current time',
            handler: function(gridview, rowIndex) {
                var grid = gridview.up('panel');
                grid.fireEvent('start2current', grid, rowIndex);
            }
        }, {
            iconCls: 'icon-end2current',
            tooltip: 'Set End time to current time',
            handler: function(gridview, rowIndex) {
                var grid = gridview.up('panel');
                grid.fireEvent('end2current', grid, rowIndex);
            }
        }]
    }],
    plugins : [{
        ptype: 'rowediting',
        clicksToMoveEditor: 1,
        autoCancel: false,
        pluginId: 'editing'
    }],
    selModel : {
        mode : 'SINGLE'
    },
    tbar : [{
        text: 'Add',
        listeners: {
            menushow: function(t, menu) {
              var grid = this.up('panel');
              grid.fireEvent('pickclass', menu);
            }
        },
        menu: {
            defaults: {
                handler: function() {
                    var grid = this.up('panel').up('panel');
                    grid.fireEvent('createitem', grid, this.classification);
                }
            },
            items: [{
              text: 'No classes loaded',
              disabled: true
            }]
        }
    }, {
        text: 'Save',
        handler: function() {
            var grid = this.up('panel');
            grid.fireEvent('save', grid);
        }
    }, {
        text: 'Load',
        handler: function() {
            var grid = this.up('panel');
            grid.fireEvent('load', grid);
        }
    }, {
        text: 'Configure classes',
        handler: function() {
            var grid = this.up('panel');
            grid.fireEvent('classconfig', grid);
        }
    }]
});

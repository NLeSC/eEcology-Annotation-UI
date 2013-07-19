Ext.define("TrackAnnot.view.Annotations", {
	extend : 'Ext.grid.Panel',
	store : 'Annotations',
	requires: [
	    'TrackAnnot.view.field.DateTime',
	    'Ext.grid.plugin.RowEditing',
	    'TrackAnnot.model.Annotation',
	    'Ext.grid.column.Number',
	    'Ext.grid.column.Date',
	    'Ext.form.field.ComboBox',
    ],
	columns : [{
		text : 'Type',
		dataIndex : 'type',
		editor : {
			xtype : 'combo',
			allowBlank : false,
			store : ['flying', 'sitting', 'walking', 'floating']
		}
	}, {
		text : 'Start',
		dataIndex : 'start',
		flex : 1,
		xtype : 'datecolumn',
		format : 'c',
		editor : {
			xtype : 'datetimefield',
			allowBlank : false
		}
	}, {
		text : 'End',
		dataIndex : 'end',
		flex : 1,
		xtype : 'datecolumn',
		format : 'c',
		editor : {
			xtype : 'datetimefield',
			allowBlank : false
		}
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
		}
	}, {
		text : 'Lane',
		dataIndex : 'lane',
		flex : 1,
		xtype : 'numbercolumn',
		editor : {
			xtype : 'combo',
			allowBlank : false,
			store : [1, 2, 3, 4]
		}
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
	selType : 'checkboxmodel',
	tbar : [{
		text : 'Add',
		handler : function() {
		    var grid = this.up('panel');
		    var editing = grid.getPlugin('editing');
		    editing.cancelEdit();

			// Create a model instance
			var r = Ext.create('TrackAnnot.model.Annotation', {
				type : 'walking',
				start : new Date('2010-06-28T00:12:47Z'),
				end : new Date('2010-06-28T06:12:47Z'),
				color : 'rgb(180, 112, 197)',
				lane : 1
			});

			grid.getStore().insert(0, r);
			editing.startEdit(0, 0);
		}
	}, {
		text: 'Remove',
		handler: function() {
		    var grid = this.up('panel');
		    var sm = grid.getSelectionModel();
		    var editing = grid.getPlugin('editing');
		    editing.cancelEdit();
		    var store = grid.getStore();
            store.remove(sm.getSelection());
	    }
	}, {
		text: 'Save',
		handler: function() {
		    var grid = this.up('panel');
		    var store = grid.getStore();
		    var value = store.data.items.map(function(d) { return d.data; });
		    Ext.MessageBox.show({
	           title: 'Save',
	           msg: 'Please save text below',
	           width:300,
	           buttons: Ext.MessageBox.OK,
	           multiline: true,
	           value: Ext.JSON.encode(value)
	       });
		}
	}, {
		text: 'Load',
		handler: function() {
		    Ext.MessageBox.prompt('Load', 'Please paste text below', function(btn, text) {
	    	    if (btn == 'ok') {
    			    var grid = this.up('panel');
    			    var store = grid.getStore();
    			    var data = Ext.JSON.decode(text);
    			    store.loadRawData(data, true);
	    	    }
	       }, this, true);
	    }
	}, {
		disabled: true,
		text: 'Configure types'
	}],
	listeners : {
		edit : function(editor, e) {
			e.record.commit();
        }
	}
});
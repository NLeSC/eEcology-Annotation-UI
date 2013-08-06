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
	    'Ext.form.field.ComboBox',
    ],
	columns : [{
		text : 'Class',
		dataIndex : 'class_id',
		editor : {
			xtype : 'combo',
			displayField: 'name',
			valueField: 'id',
			queryMode: 'local',
			allowBlank : false,
			forceSelection: true,
			store : 'Classifications',
			listConfig: {
			    getInnerTpl: function() {
			        return '<div style="background: {color};">{name}</div>';
			    }
			}
		},
		renderer : function(v, m, r) {
            m.style = 'background:' + r.data.classification.color + ';';
            return r.data.classification.name;
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
				start : new Date('2010-06-28T00:12:47Z'),
				end : new Date('2010-06-28T06:12:47Z'),
				lane : 1,
			});
			r.beginEdit();
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
		    var example = '[{"id":0,"type":"walking","start":"2010-06-28T02:12:47","end":"2010-06-28T08:12:47","color":"rgb(180, 112, 197)","lane":1}]';
		    Ext.MessageBox.prompt('Load', 'Please paste text below', function(btn, text) {
	    	    if (btn == 'ok') {
    			    var grid = this.up('panel');
    			    var store = grid.getStore();
    			    var data = Ext.JSON.decode(text);
    			    store.loadRawData(data, true);
	    	    }
	       }, this, true, example);
	    }
	}, {
        disable: true,
		text: 'Configure classes',
		action: 'classes'
	}],
	listeners : {
		edit : function(editor, e) {
		    // add classification
		    var class_id = e.newValues['class_id'];
		    var classification = Ext.StoreMgr.get('Classifications').getById(class_id);
		    e.record.set('classification', classification.data);
		    e.record.endEdit();
			e.record.commit();
			e.record.save();
        }
	}
});
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
        xtype: 'actioncolumn',
        width: 30,
        items: [{
            icon: 'data:image/gif;base64,R0lGODlhEAAQAIcAAED/QLpSNL9TOr5WOb5cQL9cQMFNM8RQNMBVPcBZP8xSPNBPPttWS9ddUcJnTMRkTMdrVM1gUc5iVMxmVclrVs1oWNZgVNZuZNtpZdxraN5ratxuadRxZd14c955dOZWTOZYTOZZTulZTelbT+ZWUOZaUuddWepcUOxfVOBlXO5mUuljW+pmXO5qXvBkVvNzXeNrYeNuY+FvcOJwZuJ7deR4ceJ5eeN4eeJ/feN/fOl7cOh6del/ePJ3Y/N5Y+qDfe6Efe+Gfu6KdfaCaPaEbPCFcPCDe/CMd/GOeviGcPiMdvCRf/eRfveTfvmSfvqTf/iUf9ymltynl+6Mge2Tju6Sj/SOgfqah/qdi/GclvGdluGpnvSgnvSinvWjn/qjkfupnPqrneGroOqwrOuzr/Ono/WmoferofarovWsofWvpfKtqvivpPS0qvi2qPm5r/q6rvC1tfC2tvjDvvzHuvnLxPnTzPzUzf3b1P3c2P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAMAAAAALAAAAAAQABAAAAi6AAEIHEiwoEE5ODRk8EDG4EAbVObYqdNmxgWHMtbkgfMFCxg6OiQUvFEGz5UlSKA4UeImRoWBcX7cwdJECJGbRHywWSBGYA41YY6gGEq0hxUeFARuePOkiJ6nUEW00IJAIIYzSYZAjcoiywCBHaYweSGirNkRRmg8EDiGARoXKsyKAFHCy4EoAznASIPihIgQH0h0sVCgYIQUZoKsMAGES4MADico2FGlSg0DBBwK3AIhgQAHUjSLJhgQADs=',
            tooltip: 'Delete',
            handler: function(grid, rowIndex) {
                var grid = this.up('panel');
                var editing = grid.getPlugin('editing');
                editing.cancelEdit();
                var store = grid.getStore();
                store.remove(store.getAt(rowIndex));
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
		text : 'Add',
		handler : function() {
		    var grid = this.up('panel');
		    var editing = grid.getPlugin('editing');
		    editing.cancelEdit();

			// Create a model instance which starts at current and ends at current + 2 hours
            var current = grid.currentDate;
            var current2h = new Date(current.getTime() + 1000*60*60*2);
			var r = Ext.create('TrackAnnot.model.Annotation', {
				start : current,
				end : current2h,
			});
			r.beginEdit();
			grid.getStore().insert(0, r);
			editing.startEdit(0, 0);
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
		    var example = '[{"id":3,"start":"2010-06-28T16:09:34","end":"2010-06-28T20:31:16","class_id":2,"classification":{"id":2,"name":"sitting","color":"rgb(112, 180, 197)"}},{"id":2,"start":"2010-06-28T03:17:39","end":"2010-06-28T09:48:54","class_id":1,"classification":{"id":1,"name":"flying","color":"rgb(180, 112, 197)"}},{"id":1,"start":"2010-06-28T12:34:48","end":"2010-06-28T14:34:48","class_id":3,"classification":{"id":3,"name":"walking","color":"rgb(197, 112, 110)"}}]';
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
	dateFocus: function(date) {
	    this.currentDate = date;
	},
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
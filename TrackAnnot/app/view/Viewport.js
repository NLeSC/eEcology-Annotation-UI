Ext.define('TrackAnnot.view.Viewport', {
    renderTo: Ext.getBody(),
    extend: 'Ext.container.Viewport',
    requires: ['Esc.ee.form.field.TrackerCombo', 'TrackAnnot.view.field.DateTime'],
    items: [{
    	xtype: 'toolbar',
    	items: ['<b>A</b>nnotation <b>M</b>ovement <b>A</b>ccelerometer','-', {
    		text: 'Windows',
    		itemId: 'windows',
    		menu: {
    		    xtype: 'menu',
    		    items: [{
                    text: 'Add',
                    menu: {
                        items: [{
                            disabled: true,
                            text: 'Video',
                        }, {
                            disabled: true,
                            text: 'User supplied data chart'
                        }]
                    }
                }, {
                    text: 'Reset layout',
                    action: 'resetlayout'
                }, {
                    xtype: 'menuseparator'
                }, {
                    disabled: true,
                    text: 'Cesium 3D Globe',
                    checked: false
    		    }]
    	    }
    	}, '-', {
            xtype: 'trackercombo',
            itemId: 'trackerId',
            stateful: true,
            stateId: 'trackerId',
            labelWidth: 50,
            width: 110,
            store: 'Esc.ee.store.TrackerIds',
            valueField: 'id',
            queryMode: 'remote',
            triggerAction: 'all',
            typeAhead: true,
        }, {
    	    xtype: 'datetimefield',
            fieldLabel: 'From',
            itemId: 'from_date',
            stateful: true,
            stateId: 'from_date',
            labelWidth: 30,
            width: 220
        }, {
            xtype: 'datetimefield',
            fieldLabel: 'To',
            labelWidth: 20,
            width: 210,
            itemId: 'to_date',
            stateful: true,
            stateId: 'to_date'
        }, {
            text: 'Load tracker',
            action: 'loadTracker'
    	}]
    }],
    getWindowsMenu: function() {
        return this.query('toolbar #windows')[0].menu;
    }
});
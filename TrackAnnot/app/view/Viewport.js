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
                    xtype: 'menuseparator'
                }, {
                    disabled: true,
                    text: 'Altitude',
                    checked: false
                }, {
                    disabled: true,
                    text: 'Cesium 3D Globe',
                    checked: false
                }, {
                    disabled: true,
                    text: 'Direction',
                    checked: false
                }, {
                    disabled: true,
                    text: 'Speed',
                    checked: false
    		    }]
    	    }
    	},'-' , {
            xtype: 'trackercombo',
            itemId: 'trackerId',
            labelWidth: 50,
            width: 110,
            value: 355,
            store: 'Esc.ee.store.TrackerIds',
            valueField: 'id',
            queryMode: 'remote',
            triggerAction: 'all',
            typeAhead: true,
        }, {
    	    xtype: 'datetimefield',
            fieldLabel: 'From',
            itemId: 'from_date',
            labelWidth: 30,
            width: 220,
            value: new Date('2010-06-28T00:00:33Z')
        }, {
            xtype: 'datetimefield',
            fieldLabel: 'To',
            labelWidth: 20,
            width: 210,
            itemId: 'to_date',
            value: new Date('2010-06-29T00:35:33Z')
        }, {
            text:'Load tracker',
            action: 'switch'
    	}]
    }],
    getWindowsMenu: function() {
        return this.query('toolbar #windows')[0].menu;
    }
});
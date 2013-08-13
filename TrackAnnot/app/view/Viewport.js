Ext.define('TrackAnnot.view.Viewport', {
    renderTo: Ext.getBody(),
    extend: 'Ext.container.Viewport',
    requires: ['Esc.ee.form.field.TrackerCombo', 'TrackAnnot.view.field.DateTime'],
    items: [{
    	xtype: 'toolbar',
    	items: ['<b>A</b>nnotation <b>M</b>ovement <b>A</b>ccelerometer','-', {
    		text: 'Windows',
    		menu: {
    		    xtype: 'menu',
    		    items: [{
                    text: 'Accelerometers',
                    checked: false
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
                    text: 'Google Earth',
                    checked: false
                }, {
                    disabled: true,
                    text: 'Google Map',
                    checked: false
                }, {
                    disabled: true,
                    text: 'Speed',
                    checked: false
    		    }, {
    		    	text: 'Temperature',
                    checked: false
    		    }, {
    		        xtype: 'menuseparator'
    		    }, {
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
    		    }]
    	    }
    	},'-' , {
            xtype: 'trackercombo',
            fieldLabel: 'Tracker',
            itemId: 'trackerId',
            labelWidth: 50,
            width: 110,
            value: 355,
            minValue: 0
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
    /**
     * Ties menu item to window.
     *
     * Listen for close/show event of window and unchecks/checks menu item.
     * Listen for checkchange of menu item and cloud/check the window.
     */
    tieMenuItem2Window: function(text, win) {
        var menuitem = Ext.ComponentQuery.query('menucheckitem[text="'+text+'"]')[0];
        win.on('close', function() {
            menuitem.setChecked(false);
         });
        win.on('show', function() {
           menuitem.setChecked(true);
        });
        menuitem.on('checkchange', function(t, checked) {
           if (checked) {
               win.show();
           } else {
               win.close();
           }
        });
    }
});
Ext.define('TrackAnnot.view.Viewport', {
    renderTo: Ext.getBody(),
    extend: 'Ext.container.Viewport',
    items: [{
    	xtype: 'toolbar',
    	items: ['<b>A</b>nnotation <b>M</b>ovement <b>A</b>ccelerometer','-', {
    		text: 'Windows',
    		menu: {
    		    xtype: 'menu',
    		    items: [{
                    text: 'Accelerometers',
                    checked: true
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
                    checked: true
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
    		    	checked: true
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
            xtype: 'numberfield',
            fieldLabel: 'Tracker',
            itemId: 'trackerId',
            labelWidth: 50,
            width: 110,
            value: 355,
            minValue: 0,
            disabled: true,
        }, {
    	    xtype: 'datetimefield',
            fieldLabel: 'From',
            itemId: 'from_date',
            labelWidth: 30,
            width: 200,
            value: new Date('2010-06-28T00:00:33Z'),
            disabled: true,
        }, {
            xtype: 'datetimefield',
            fieldLabel: 'To',
            labelWidth: 30,
            width: 200,
            itemId: 'to_date',
            value: new Date('2010-06-29T00:35:33Z'),
            disabled: true,
        }, {
            text:'Load tracker',
            action: 'switch'
    	}]
    }]
});
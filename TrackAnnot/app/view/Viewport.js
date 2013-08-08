Ext.define('TrackAnnot.view.Viewport', {
    renderTo: Ext.getBody(),
    extend: 'Ext.container.Viewport',
    items: [{
    	xtype: 'toolbar',
    	items: ['<b>A</b>nnotation <b>M</b>ovement <b>A</b>ccelerometer', {
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
                    text: 'Direction',
                    checked: false
                }, {
                    text: 'Google Earth',
                    checked: true
                }, {
                    disabled: true
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
                    disabled: true,
                    text: 'Video',
                    checked: false
    		    }, {
    		        xtype: 'menuseparator'
    		    }, {
    		        disabled: true,
    		    	text: 'Add ...'
    		    }]
    	    }
    	}, {
    		text:'Switch tracker',
    		action: 'switch'
    	}]
    }]
});
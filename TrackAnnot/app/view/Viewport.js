Ext.define('TrackAnnot.view.Viewport', {
    renderTo: Ext.getBody(),
    extend: 'Ext.container.Viewport',
    items: [{
    	xtype: 'toolbar',
    	items: [{
    		text: 'Metrics',
    		menu: {
    		    xtype: 'menu',
    		    items: [{
    		        text: 'Video',
    		        checked: false
    		    }, {
    		    	text: 'GPS',
    		    	checked: true
    		    }, {
    		    	text: 'Temperature',
    		    	checked: true
    		    }, {
    		    	text: 'Accelerometers',
    		    	checked: true
    		    }, {
    		        xtype: 'menuseparator'
    		    }, {
    		    	text: 'Add ...'
    		    }]
    	    }
    	}, {
    		text:'Switch tracker',
    		action: 'switch'
    	}]
    }]
});
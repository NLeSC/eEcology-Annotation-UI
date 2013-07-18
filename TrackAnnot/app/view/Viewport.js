Ext.define('TrackAnnot.view.Viewport', {
    renderTo: Ext.getBody(),
    extend: 'Ext.container.Viewport',
    items: [{
    	xtype: 'toolbar',
    	items: [{
    		text: 'Add metric'
    	}, {
    		text:'Switch tracker'
    	}]
    }]
});
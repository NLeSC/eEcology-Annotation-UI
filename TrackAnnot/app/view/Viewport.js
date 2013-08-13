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
    }, {
        xtype: 'window',
        x : 1220,
        y : 560,
        width : 500,
        height : 300,
        closable : false,
        title : 'Annotations',
        layout : 'fit',
        maximizable : true,
        collapsible : true,
        items : [{xtype: 'annotations'}],
        autoShow: true
    }, {
        xtype: 'window',
        x: 20,
        y: 560,
        width : 1180,
        height : 300,
        autoShow: true,
        title : 'Timeline',
        layout: 'fit',
        maximizable: true,
        collapsible: true,
        closable: false,
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            items: [{
                xtype: 'datetimefield',
                width: 220,
                labelWidth: 40,
                fieldLabel: 'Current',
                itemId: 'current_time',
                dateFocus: function(date) {
                    this.setValue(date);
                }
            }, {
                xtype: 'button',
                width: 16,
                tooltip: 'Move current time to closest previous time point',
                iconCls: 'x-tbar-page-prev',
                itemId: 'prev_timepoint'
            }, {
                xtype: 'button',
                width: 16,
                tooltip: 'Move current time to closest next time point',
                iconCls: 'x-tbar-page-next',
                itemId: 'next_timepoint'
            }]
        }],
        items: [{
            xtype: 'timeline',
            annotationStore: 'Annotations',
            trackStore: 'Track'
        }]
    }, {
        xtype: 'window',
        autoShow: true,
        x: 20,
        y: 40,
        width : 1180,
        height : 240,
        closable: true,
        title : 'Temperature',
        layout: 'fit',
        maximizable: true,
        collapsible: true,
        items: [{
            xtype: 'tempchart',
            annotationStore: 'Annotations',
            trackStore: 'Track'
        }]
    }, {
        xtype: 'window',
        autoShow: true,
        x: 20,
        y: 300,
        width : 1180,
        height : 240,
        closable: true,
        collapsible: true,
        title : 'Accelerometers',
        layout: 'fit',
        maximizable: true,
        tools: [{
            type: 'gear',
            tooltip: 'Alter number of plot before and after current time'
        }],
        items: [{
            xtype: 'accelchart',
            annotationStore: 'Annotations',
            trackStore: 'Track'
        }]
    }, {
        xtype: 'window',
        autoShow: true,
        width : 500,
        height : 500,
        x: 1220,
        y: 40,
        closable: true,
        collapsible: true,
        title : 'Google Earth',
        layout: 'fit',
        maximizable: true,
        items: [{
            xtype: "googleearth",
            annotationStore: 'Annotations'
        }]
    }, {
        xtype: 'window',
        autoShow: false,
        x: 1360,
        y: 40,
        closable: true,
        collapsible: true,
        title: 'Video',
        layout: 'fit',
        maximizable: true,
        items: [{
            xtype: 'popcorn',
            annotationStore: 'Annotations'
        }]
    }]
});
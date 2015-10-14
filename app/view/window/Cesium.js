/**
 * Cesium globe window
 */
Ext.define('TrackAnnot.view.window.Cesium', {
    extend : 'TrackAnnot.view.window.Abstract',
    requires: [
        'TrackAnnot.view.Metric.Cesium',
        'Ext.menu.Menu',
        'Ext.form.field.Text'
    ],
    stateId: 'cesium-window',
    initComponent: function() {
        this.chart = Ext.create('TrackAnnot.view.Metric.Cesium');
        this.items = [this.chart];

        this.setupActionsMenu();

        this.chart.on('pointclick', this.onPointClick, this);

        this.addEvents('pointclick');
        this.callParent();
    },
    setupActionsMenu: function() {
        var me = this;
        var c = this.getChart();

        this.colorPicker = Ext.create('Ext.form.field.Text', {
          inputAttrTpl: 'spellcheck="false"',
          fieldStyle: 'background: ' + c.getTrackColor(),
          allowBlank : false,
          value: c.getTrackColorAsHex(),
          regex: new RegExp(/^[A-Fa-f0-9]{6}$/),
          regexText: 'Color must be hexadecimal RRGGBB format',
          listeners: {
            change: me.onColorChange,
            scope: me
          }
        });

        this.actionsMenu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Center on track',
                listeners: {
                    click: me.centerOnTrack,
                    scope: me
                }
            }, {
                text: 'Color',
                menu: {
                  plain:true,
                  items: [this.colorPicker]
                }
            }, {
                text: 'Lighting',
                itemId: 'lighting',
                checked: c.getEnableLighting(),
                listeners: {
                    checkchange: me.toggleLigthing,
                    scope: me
                }
            },'-', {
                text: 'Current',
                itemId: 'toggleCurrent',
                checked: c.toggleCurrent(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }, {
                text: 'Points',
                itemId: 'togglePoints',
                checked: c.togglePoints(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }, {
                text: 'Line',
                itemId: 'toggleLine',
                checked: c.toggleLine(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }, {
                text: 'Wall',
                itemId: 'toggleWall',
                checked: c.toggleWall(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }, '-', {
                text: 'Annotate segments',
                itemId: 'toggleAnnotateLine',
                checked: c.toggleAnnotateLine(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }, {
                text: 'Annotate points',
                itemId: 'toggleAnnotatePoints',
                checked: c.toggleAnnotatePoints(),
                listeners: {
                    checkchange: me.toggleItem,
                    scope: me
                }
            }]
        });
        this.tools = [{
            type: 'gear',
            tooltip: 'Center map and change how track and annotations are visualized',
            handler: function(event) {
                me.actionsMenu.showAt(event.getXY());
            }
        }];
        this.addStateEvents('togglechange', 'colorchange', 'togglelighting');
        this.addEvents('togglechange', 'colorchange', 'togglelighting');
    },
    getChart: function() {
        return this.chart;
    },
    onPointClick: function(date, source) {
        this.fireEvent('pointclick', date, source);
    },
    centerOnTrack: function() {
        this.getChart().centerOnTrack();
    },
    toggleItem: function(item, checked) {
        var name = item.itemId;
        this.getChart()[name](checked);
        this.fireEvent('togglechange', item, checked);
    },
    toggleLigthing: function(item, checked) {
      var c = this.getChart();
      c.setEnableLighting(checked);
      this.fireEvent('togglelighting', checked);
    },
    getState: function() {
        var state = this.callParent();
        var c = this.getChart();
        state.toggleCurrent = c.toggleCurrent();
        state.togglePoints = c.togglePoints();
        state.toggleLine = c.toggleLine();
        state.toggleWall = c.toggleWall();
        state.toggleAnnotateLine = c.toggleAnnotateLine();
        state.toggleAnnotatePoints = c.toggleAnnotatePoints();
        state.color = c.getTrackColorAsHex();
        state.lighting = c.getEnableLighting();
        return state;
    },
    applyState: function(state) {
        var me = this;
        this.callParent(arguments);
        // forward state to chart and menu item
        var applyToggleState = function(name) {
            if (!(name in state)) {
                return;
            }
            var checked = state[name];
            var menuitem = me.actionsMenu.getComponent(name);
            menuitem.setChecked(checked);
            var chart = me.getChart();
            chart[name](checked);
        };
        applyToggleState('toggleCurrent');
        applyToggleState('togglePoints');
        applyToggleState('toggleLine');
        applyToggleState('toggleWall');
        applyToggleState('toggleAnnotateLine');
        applyToggleState('toggleAnnotatePoints');

        if ('color' in state) {
          this.colorPicker.setValue(state.color);
        }
        if ('lighting' in state) {
          this.actionsMenu.getComponent('lighting').setChecked(state.lighting);
        }

    },
    onColorChange: function(textfield, newVal) {
      if (textfield.isValid()) {
        var chart = this.getChart();
        chart.setTrackColorAsHex(newVal);
        textfield.setFieldStyle('background: ' + chart.getTrackColor());
        this.fireEvent('colorchange', textfield, newVal);
      }
    }
});

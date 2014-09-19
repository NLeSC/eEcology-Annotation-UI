describe('TrackAnnot.view.window.Cesium', function() {
    'use strict';

    var instance = null, chart = null, toggles = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.window.Cesium", function() {
            this.callParent = jasmine.createSpy('callParent').andReturn({});
            this.addEvents = jasmine.createSpy('addEvents');
            this.addStateEvents = jasmine.createSpy('addStateEvents');
            this.on = jasmine.createSpy('on');
            this.fireEvent = jasmine.createSpy('fireEvent');
            ExtSpec.Jasmine.createConfigSpies(this);
        });
        function toggler(name) {
            var state = true;
            return function(v) {
                if (v === undefined) {
                    return state;
                }
                return state = v;
            };
        }
        chart = {};
        toggles = ['toggleCurrent', 'togglePoints', 'toggleLine', 'toggleWall', 'toggleAnnotateLine', 'toggleAnnotatePoints'];
        toggles.forEach(function(name) {
            chart[name] = toggler(name);
        });
        chart.centerOnTrack = jasmine.createSpy('centerOnTrack');
        chart.on = jasmine.createSpy('on');

        instance.chart = chart;
    });

    describe('centerOnTrack', function() {
       it('should call centerOnTrack of chart', function() {
           instance.centerOnTrack();

           expect(chart.centerOnTrack).toHaveBeenCalled();
       });
    });

    describe('onPointClick', function() {
        it('should forward event', function() {
           var dt = new Date('2014-09-19T15:00Z');
           instance.onPointClick(dt, chart);

           expect(instance.fireEvent).toHaveBeenCalledWith('pointclick', dt, chart);
        });
    });

    describe('getChart', function() {
       it('should return chart', function() {
           expect(instance.getChart()).toEqual(chart);
       });
    });

    describe('initComponent', function() {
        beforeEach(function() {
            var menu = {
                showAt:function() {},
            };

            Ext.create = function(name, config) {
                if (name === 'TrackAnnot.view.Metric.Cesium') {
                    return chart;
                } else if (name === 'Ext.menu.Menu') {
                    menu.config = config;
                    return menu;
                }
            };
            instance.initComponent();
        });

        it('should create chart item', function() {
            expect(instance.items).toEqual([chart]);
        });

        it('should forward chart.pointclick event', function() {
            expect(chart.on).toHaveBeenCalledWith('pointclick', instance.onPointClick, instance);
            expect(instance.addEvents).toHaveBeenCalledWith('pointclick');
        });

        it('should register togglechange as state change event', function() {
            expect(instance.addEvents).toHaveBeenCalledWith('togglechange');
            expect(instance.addStateEvents).toHaveBeenCalledWith('togglechange');
        });

        it('should add gear tool', function() {
            var tool = instance.tools[0];
            expect(tool.type).toEqual('gear');
        });

        it('should create a actions menu with 9 items', function() {
            expect(instance.actionsMenu.config.items.length).toEqual(9);
        });
    });

    describe('toggleItem', function() {
        var item = null;
        beforeEach(function() {
            item = {itemId: 'toggleCurrent'};
            instance.toggleItem(item, false);
        });

        it('should forward toggle to chart and fire togglechange event', function() {
            expect(chart['toggleCurrent']()).toBeFalsy();
            expect(instance.fireEvent).toHaveBeenCalledWith('togglechange', item, false);
        });
    });

    describe('getState', function() {
        it('should add chart toggle states to parent state', function() {
            var state = instance.getState();

            expect(instance.callParent).toHaveBeenCalled();
            var expected = {
                'toggleCurrent': true,
                'togglePoints': true,
                'toggleLine': true,
                'toggleWall': true,
                'toggleAnnotateLine': true,
                'toggleAnnotatePoints': true
            };
            expect(state).toEqual(expected);
        });
    });

    describe('applyState', function() {
        it('should check menu items and forwar toggle to chart', function() {
            var checkitem = jasmine.createSpyObj('Ext.menu.CheckItem', ['setChecked']);
            var menu = jasmine.createSpyObj('Ext.menu.menu', ['getComponent']);
            menu.getComponent.andReturn(checkitem);
            instance.actionsMenu = menu;
            var state = {
                'toggleCurrent': false,
                'togglePoints': false,
                'toggleLine': false,
                'toggleWall': false,
                'toggleAnnotateLine': false,
                'toggleAnnotatePoints': false
            };
            instance.applyState(state);

            expect(checkitem.setChecked).toHaveBeenCalledWith(false);
            expect(checkitem.setChecked.calls.length).toEqual(6);
            expect(chart.toggleCurrent()).toBeFalsy();
            expect(menu.getComponent).toHaveBeenCalledWith('toggleCurrent');
            expect(chart.togglePoints()).toBeFalsy();
            expect(menu.getComponent).toHaveBeenCalledWith('togglePoints');
            expect(chart.toggleLine()).toBeFalsy();
            expect(menu.getComponent).toHaveBeenCalledWith('toggleLine');
            expect(chart.toggleWall()).toBeFalsy();
            expect(menu.getComponent).toHaveBeenCalledWith('toggleWall');
            expect(chart.toggleAnnotateLine()).toBeFalsy();
            expect(menu.getComponent).toHaveBeenCalledWith('toggleAnnotateLine');
            expect(chart.toggleAnnotatePoints()).toBeFalsy();
            expect(menu.getComponent).toHaveBeenCalledWith('toggleAnnotatePoints');
        });
    });
});
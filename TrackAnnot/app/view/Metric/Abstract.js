Ext.define("TrackAnnot.view.Metric.Abstract", {
    extend : 'Ext.Component',
    autoEl : {
        tag : 'svg'
    },
    mixins : {
        bindable : 'Ext.util.Bindable'
    },
    requires : ['Ext.data.StoreManager'],
    config: {
        trackStore: 'Track',
        annotationStore : 'Annotations'
    },
    constructor : function(config) {
        this.callParent(arguments);
        this.initConfig(config);
    },
    initComponent : function() {
        this.callParent(arguments);
        this.addEvents('focusDate');
    },
    applyAnnotationStore: function(store) {
        store = Ext.data.StoreManager.lookup(store);
        return store;
    },
    applyTrackStore: function(store) {
        store = Ext.data.StoreManager.lookup(store);
        store.on('load', this.loadData, this);
        return store;
    },
    onResize : function(width, height, oldWidth, oldHeight) {
        if (oldWidth == undefined && oldHeight == undefined) {
            return;
        }
        this.draw();
        this.drawAnnotations();
    },
    draw : Ext.emptyFn,
    afterRender : function() {
        this.bindStore(this.getAnnotationStore());
    },
    loadData : function(trackStore, rows) {
        this.svg.datum(rows);

        this.scales.x.domain(this.getTrackStore().getTimeExtent());

        this.setupYScaleDomain();

        this.draw();
    },
    /**
     * Setup this.scales.y.domain([min,max]) using this.svg.datum()
     */
    setupYScaleDomain: Ext.emptyFn,
    dateFocus : function(date) {
        this.focus.attr("transform", "translate(" + this.scales.x(date) + ",0)")
                .style("display", null);
    },
    from : function(date) {
        var domain = this.scales.x.domain();
        domain[0] = date;
        this.scales.x.domain(domain);
        this.draw();
    },
    to : function(date) {
        var domain = this.scales.x.domain();
        domain[1] = date;
        this.scales.x.domain(domain);
        this.draw();
    },
      bindStore : function(store) {
        var me = this;
        me.mixins.bindable.bindStore.apply(me, arguments);
      },
      getStoreListeners : function() {
        return {
          load : this.drawAnnotations,
          update : this.drawAnnotations,
          add : this.drawAnnotations,
          bulkremove : this.drawAnnotations,
          clear : this.drawAnnotations
        };
      },
      drawAnnotations : function() {
        var me = this;
        var records = this.getAnnotationStore().data.items;
        var rects = this.annotations.selectAll("rect.annotation").data(records, function(d) {
            return d.id;
        });
        rects.enter()
            .append('rect').attr('class', function(d) {
                  return "annotation " + d.data.type;
                }).attr('width', function(d) {
                  return me.scales.x(d.data.end) - me.scales.x(d.data.start);
                }).attr('height', this.scales.y.range()[0]).attr('x',
                function(d) {
                  return me.scales.x(d.data.start);
                }).attr('y', this.scales.y.range()[1]).style('fill', function(d) {
                  return d.data.classification.color
                }).attr('ry', 4).attr('ry', 4)

        rects.attr('class', function(d) {
            return "annotation " + d.data.type;
        }).attr('width', function(d) {
          return me.scales.x(d.data.end) - me.scales.x(d.data.start);
        }).attr('height', this.scales.y.range()[0]).attr('x',
        function(d) {
          return me.scales.x(d.data.start);
        }).attr('y', this.scales.y.range()[1])
        .style('fill', function(d) {
          return d.data.classification.color
        }).attr('ry', 4).attr('ry', 4);

        rects.exit().remove();
      },
      destroy: function() {
          this.getTrackStore().un('load', this.loadData, this);
          this.mixins.bindable.bindStore(null);
          this.callParent();
      }
});
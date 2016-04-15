/**
 * Timeline shows relative to begin and end time:
 * * Timepoints of track
 * * Annotations
 * * (Videos)
 * * (Alternate annotations, eg. Annotations=Automaticly generated annotations, Alternate annotation=Manual annotations)
 */
Ext.define("TrackAnnot.view.Timeline", {
  extend : 'Ext.Component',
  alias : 'widget.timeline',
  mixins : {
    bindable : 'Ext.util.Bindable'
  },
  requires : ['Ext.data.StoreManager'],
  autoEl : {
    tag : 'svg'
  },
  config : {
    current: null,
    annotationStore: 'Annotations',
    trackStore: 'Track',
    drawMargin: {
      top : 5,
      right : 5,
      bottom : 40,
      left : 70
    }
  },
  xScale: d3.time.scale.utc(),
  constructor : function(config) {
    this.callParent(arguments);
    this.initConfig(config);
  },
  initComponent : function() {
    this.callParent();
    this.on('boxready', this.draw, this);

    this.addEvents('currentDate', 'currentSnappedDate');

    this.draggers = {
        move: d3.behavior.drag().on('drag', this.dragmove.bind(this)).on('dragend', this.dragmoveEnd.bind(this)),
        left: d3.behavior.drag().on('drag', this.resizeleft.bind(this)).on('dragend', this.resizeleftEnd.bind(this)),
        right: d3.behavior.drag().on('drag', this.resizeright.bind(this)).on('dragend', this.resizerightEnd.bind(this))
    };
  },
  applyAnnotationStore: function(store) {
      store = Ext.data.StoreManager.lookup(store);
      return store;
  },
  applyTrackStore: function(store) {
      store = Ext.data.StoreManager.lookup(store);
      store.on('load', this.loadTrackData, this);
      return store;
  },
  applyTime: function(time) {
     this.xScale.domain([time.start, time.stop]).tickFormat(time.format.utc);
     return time;
  },
  onResize : function(width, height, oldWidth, oldHeight) {
    if (oldWidth == undefined && oldHeight == undefined) {
      return;
    }
    this.draw();
  },
  afterRender : function() {
    var me = this;
    var dom = this.getEl().dom;
    var margin = this.drawMargin;

    var height = this.getDrawHeight();
    var width = this.getDrawWidth();

    this.bindStore(me.getAnnotationStore());

    var svg = this.svg = d3.select(dom).append("g").attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    this.annotations = svg.append("g").attr("class", "annotations");
    this.timepoints = svg.append('g').attr('class', 'timepoints');

    var xScale = this.xScale.range([0, width]);

    this.xAxis = d3.svg.axis().scale(xScale).tickSubdivide(2)
        .tickSize(20, 5, 0)
        .orient("bottom");

    // scrubber container, used to jump to a time
    svg.append("rect").attr('class', 'scrubber_container').on('click', function() {
        var current = d3.event.layerX - margin.left;
        var currentDate = me.xScale.invert(current);
        // snap scrubber to closest timepoint in track
        var index = me.trackStore.closestIndex(currentDate);
        currentDate = me.trackStore.get(index).date_time;

        me.dateFocus(currentDate);
        me.fireEvent('currentSnappedDate', currentDate);
    });

    svg.append("g").attr("class", "x axis");

    // Scrubber
    var draggedDate;
    var node_drag = d3.behavior.drag().on("drag", function(d, i) {
        var current = (d3.select(this).attr('cx') * 1) + d3.event.dx;
        draggedDate = me.xScale.invert(current);

        me.dateFocus(draggedDate);
        me.fireEvent('currentDate', draggedDate);
    }).on('dragend', function() {
        // snap scrubber to closest timepoint in track
        var index = me.trackStore.closestIndex(draggedDate);
        currentDate = me.trackStore.get(index).date_time;

        me.dateFocus(currentDate);
        me.fireEvent('currentSnappedDate', currentDate);
    }).origin(function(d,i) {
        var t = d3.select(this);
        return {x: t.attr('cx')*1 ,y: 0};
    });
    svg.append("circle").attr('r', 7).attr('class', 'scrubber').call(node_drag);
    svg.append("line").attr('class', 'scrubber');

    // Annotation lane
    this.yScale = d3.scale.ordinal().rangeRoundBands([0, height], 0.02).domain(['Annotations',
                                                                          //'Videos',
                                                                          'Timepoints']);
    this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").tickSize(
        5, 0, 0);
    svg.append("g").attr("class", "y axis");

    if (this.trackStore.isfilled()) {
        this.loadTrackData(this.trackStore, this.trackStore.data);
    } else {
        this.draw();
    }
  },
  dateFocus : function(current) {
    this.setCurrent(current);
    if (this.rendered) {
        this.drawScrubber();
    }
  },
  draw : function() {
    var height = this.getDrawHeight();
    var width = this.getDrawWidth();

    this.xScale.range([0, width]);

    this.svg.select('g.x.axis').attr("transform",
        "translate(0," + height + ")").call(this.xAxis);

    this.drawScrubber();
    this.svg.select("rect.scrubber_container")
        .attr('transform', 'translate(0,'+ (height + 6)+')')
        .attr('width', width).attr('height', 12)
    ;

    this.yScale.rangeRoundBands([0, height], 0.02);
    this.svg.select('g.y.axis').call(this.yAxis);

    this.drawAnnotations();
    this.redrawTrackData();
  },
  getDrawHeight: function() {
      var h = this.getEl().getStyle('height').replace('px','')*1;
      return h - this.drawMargin.top - this.drawMargin.bottom;
  },
  getDrawWidth: function() {
      var w = this.getEl().getStyle('width').replace('px','')*1;
      return w - this.drawMargin.left - this.drawMargin.right;
  },
  drawScrubber: function() {
      var height = this.getDrawHeight();

      var current = this.getCurrent();
      this.svg.select('circle.scrubber').attr('cy', height + 12).attr('cx',
              this.xScale(current));
      this.svg.select('line.scrubber').attr('x1', this.xScale(current)).attr(
          'y1', 0).attr('x2', this.xScale(current))
          .attr('y2', height + 5);
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
    var x = me.xScale;
    var y = me.yScale;

    var records = this.getAnnotationStore().data.items;
    var bars = this.annotations.selectAll("g.annotation")
        .data(records, function(d) {
            return d.id;
        });

    bars.selectAll('.move')
        .style('fill', function(d) {
            return d.data.classification.color;
        })
        .attr("height", y.rangeBand())
        .attr("width", function(d) { return x(d.data.end) - x(d.data.start) + 1; })
        .attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; })
        .select('title').text(function(d) { return d.data.classification.name; })
        ;

    bars.selectAll('.left')
        .attr("height", y.rangeBand() - 10)
        .attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; })
        ;

    bars.selectAll('.right')
        .attr("height", y.rangeBand() - 10)
        .attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; })
        .attr("x", function(d) { return x(d.data.end) - x(d.data.start)- 6; });

    var nbars = bars.enter();

    var annotation = nbars.append('g')
        .attr("class", function(d) {
            return "annotation " + d.data.classification.name;
        })
    ;

    annotation.append('rect')
        .attr('class', 'move')
        .attr('ry', 5)
        .attr('rx', 5)
        .call(this.draggers.move)
        .style('fill', function(d) {
              return d.data.classification.color;
            })
        .attr("height", y.rangeBand())
        .attr("width", function(d) { return x(d.data.end) - x(d.data.start) + 1; })
        .attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; })
        .append('title').text(function(d) { return d.data.classification.name; })
    ;

    var rhandles = annotation.append('g')
        .attr('class', 'resize')
        .attr("transform", "translate(0,5)");

    rhandles.append('rect')
        .attr('class', 'left')
        .attr('x', 0)
        .attr("width", 6)
        .attr("height", y.rangeBand() - 10)
        .attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; })
        .call(this.draggers.left);

    rhandles.append('rect')
        .attr('class', 'right')
        .attr("width", 6)
        .call(this.draggers.right)
        .attr("height", y.rangeBand() - 10)
        .attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; })
        .attr("x", function(d) { return x(d.data.end) - x(d.data.start)- 6; });

    bars.exit().remove();
  },
  redraw: function() {
    var bars = this.annotations.selectAll("rect.annotation");
    bars.selectAll('rect.move').attr('width', function(d) { return x(d.data.end) - x(d.data.start) + 1; }).attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; });
    bars.selectAll('rect.left').attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; });
    bars.selectAll('rect.right').attr("x", function(d) { return x(d.data.end) - x(d.data.start)- 6; }).attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; });
  },
  dragmove: function(d) {
      var x = this.xScale;
      var start = x.invert(x(d.data.start) + d3.event.dx);
      var end = x.invert(x(d.data.end) + d3.event.dx);
      d.set('start', start);
      d.set('end', end);
  },
  resizeleft: function(d) {
      var x = this.xScale;
      var start = x.invert(x(d.data.start) + d3.event.dx);
      if (start >= d.data.end) {
          return;
      }
      d.set('start', start);
  },
  resizeright: function(d) {
      var x = this.xScale;
      var end = x.invert(x(d.data.end) + d3.event.dx);
      if (end <= d.data.start) {
          return;
      }
      d.set('end', end);
  },
  dragmoveEnd: function(d) {
      var start = d.data.start;
      var end = d.data.end;
      start = this.trackStore.closestDate(start);
      end = this.trackStore.closestDate(end);
      d.set('start', start);
      d.set('end', end);
      this.dragEnd(d);
  },
  resizeleftEnd: function(d) {
      var start = d.data.start;
      start = this.trackStore.closestDate(start);
      d.set('start', start);
      this.dragEnd(d);
  },
  resizerightEnd: function(d) {
      var end = d.data.end;
      end = this.trackStore.closestDate(end);
      d.set('end', end);
      this.dragEnd(d);
  },
  dragEnd: function(d) {
      d.save();
  },
  redrawTrackData: function() {
      var me = this;
      this.timepoints.selectAll('path.timepoint').attr("d", function(d) {
          var x = me.xScale(d.date_time);
          return d3.svg.line()([[x, me.yScale('Timepoints')],[x, me.yScale('Timepoints') + me.yScale.rangeBand()]]);
      }).classed('noaccel', function(d) {
          return !d.time_acceleration;
      });
  },
  loadTrackData: function(trackStore, data) {
      if (!this.rendered) {
          return;
      }
      this.xScale.domain(trackStore.getTimeExtent());
      this.xAxis.tickFormat(trackStore.getFormat());
      // Timepoint lane
      var timepoints = this.timepoints.selectAll('path.timepoint').data(data);
      timepoints.enter().append("path").attr('class', 'timepoint');

      timepoints.exit().remove();

      this.draw();
  }
});

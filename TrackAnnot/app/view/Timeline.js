Ext.define("TrackAnnot.view.Timeline", {
  extend : 'Ext.Component',
  alias : 'widget.timeline',
  mixins : {
    bindable : 'Ext.util.Bindable'
  },
  requires : ['Ext.data.StoreManager',],
  autoEl : {
    tag : 'svg'
  },
  config : {
    lanes : 4,
    time : {
      start : null,
      stop : null,
      current : null,
      format : null
      ,
    },
    annotationStore : null
  },
  constructor : function(config) {
    this.callParent(arguments);
    this.initConfig(config);
  },
  initComponent : function() {
    this.callParent(arguments);

    var store = Ext.data.StoreManager.lookup(this.getAnnotationStore());
    this.setAnnotationStore(store);

    this.addEvents('focusDate');

    this.draggers = {
        move: d3.behavior.drag().on('drag', this.dragmove.bind(this)),
        left: d3.behavior.drag().on('drag', this.resizeleft.bind(this)),
        right: d3.behavior.drag().on('drag', this.resizeright.bind(this))
    };
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
    var margin = {
      top : 5,
      right : 5,
      bottom : 40,
      left : 70
    }, width = this.getWidth() - margin.left - margin.right, height = this
        .getHeight()
        - margin.top - margin.bottom;

    this.bindStore(me.getAnnotationStore());

    var svg = this.svg = d3.select(dom).append("g").attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    this.annotations = svg.append("g").attr("class", "annotations");

    var xScale = this.xScale = d3.time.scale().range([0, width]).domain([
        this.getTime().start, this.getTime().stop]);

    var xAxis = this.xAxis = d3.svg.axis().scale(xScale).tickSubdivide(3)
        .tickSize(20, 5, 0).tickFormat(this.getTime().format)
        .orient("bottom");

    svg.append("g").attr("class", "x axis");

    var node_drag = d3.behavior.drag().on("drag", function(d, i) {
          var current = (d3.select(this).attr('cx') * 1)
              + d3.event.dx;
          var currentDate = me.xScale.invert(current);
          Ext.getCmp('current_time').setValue(currentDate);
        });

    svg.append("circle").attr('r', 7).attr('class', 'scrubber')
        .call(node_drag);
    svg.append("line").attr('class', 'scrubber');

    // example lanes + annotations
    this.yScale = d3.scale.ordinal().rangeRoundBands([0, height]).domain(['Annotations', 'Videos', 'Timepoints']);
    this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").tickSize(
        5, 0, 0);
    svg.append("g").attr("class", "y axis");

    this.draw();
  },
  dateFocus : function(current) {
    var me = this;
    me.getTime().current = current;
    me.draw();
  },
  draw : function() {
    var me = this;
    var margin = {
      top : 5,
      right : 5,
      bottom : 40,
      left : 70
    }, width = this.getWidth() - margin.left - margin.right, height = this
        .getHeight()
        - margin.top - margin.bottom;

    this.xScale.range([0, width]);

    this.svg.select('g.x.axis').attr("transform",
        "translate(0," + height + ")").call(this.xAxis);
    var current = this.getTime().current;
    this.svg.select('circle.scrubber').attr('cy', height + 12).attr('cx',
        this.xScale(current));
    this.svg.select('line.scrubber').attr('x1', this.xScale(current)).attr(
        'y1', 0).attr('x2', this.xScale(current))
        .attr('y2', height + 5);

    this.yScale.rangeRoundBands([0, height]);
    this.svg.select('g.y.axis').call(this.yAxis);

    this.drawAnnotations();
  },
  setFromDate : function(date) {
    this.getTime().start = date;
    if (this.xScale == undefined)
      return;
    var domain = this.xScale.domain();
    domain[0] = date;
    this.xScale.domain(domain);
    this.draw();
  },
  setToDate : function(date) {
    this.getTime().stop = date;
    if (this.xScale == undefined)
      return;
    var domain = this.xScale.domain();
    domain[1] = date;
    this.xScale.domain(domain);
    this.draw();
  },
  updateAnnotation : function(s, r, o) {
    if (o == Ext.data.Model.COMMIT) {
      var start = new Date(r.data.start);
      var end = new Date(r.data.end);

      var timeline = this;
      timeline.svg.insert("g", ':first-child')
          .attr('class', 'annotation').append('rect').attr('class',
              r.data.type).attr('width',
              timeline.xScale(end) - timeline.xScale(start))
          .attr('height', timeline.yScale.rangeBand()).attr('x',
              timeline.xScale(start)).attr('y',
              timeline.yScale('Annotations')).style('fill',
              r.data.color).attr('ry', 4).attr('ry', 4);
    }
  },
  bindStore : function(store) {
    var me = this;
    me.mixins.bindable.bindStore.apply(me, arguments);
  },
  getStoreListeners : function() {
    return {
      update : this.drawAnnotations,
      add : this.drawAnnotations,
      bulkremove : this.drawAnnotations,
      clear : this.drawAnnotations
    };
  },
  drawAnnotations : function() {
    var me = this;
    var records = this.getAnnotationStore().data.items;
    var bars = this.annotations.selectAll("rect.annotation")
        .data(records, function(d) {
            return d.id;
        })
        ;

    var nbars = bars.enter().append('g')
        .attr("class", function(d) { return "annotation "+d.data.type; })
        .on('click', function(d) {
            if (d3.event.defaultPrevented) return; // click suppressed
            console.log('clicked', d);
        });

    var x = me.xScale;
    var y = me.yScale;

    nbars.append('rect')
        .attr('class', 'move')
        .style('fill', function(d) {
              return d.data.color
            })
        .attr("height", y.rangeBand())
        .attr("width", function(d) { return x(d.data.end) - x(d.data.start) })
        .attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; })
        .attr('ry', 5)
        .attr('rx', 5)
        .call(this.draggers.move)
    ;

    var rhandles = nbars.append('g')
        .attr('class', 'resize')
        .attr("transform", "translate(0,5)");

    rhandles.append('rect')
        .attr('class', 'left')
        .attr("height", y.rangeBand() - 10)
        .attr("width", 6)
        .attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; })
        .attr('x', 0)
        .call(this.draggers.left);
    rhandles.append('rect')
        .attr('class', 'right')
        .attr("height", y.rangeBand() - 10)
        .attr("width", 6)
        .attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; })
        .attr("x", function(d) { return x(d.data.end) - x(d.data.start)- 6; })
        .call(this.draggers.right);

    bars.exit().remove();

    // TODO make annotations moveable/resizeable/clickable
  },
  redraw: function() {
    var bars = this.annotations.selectAll("rect.annotation");
    bars.selectAll('rect.move').attr('width', function(d) { return x(d.data.end) - x(d.data.start) }).attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; });
    bars.selectAll('rect.left').attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; });
    bars.selectAll('rect.right').attr("x", function(d) { return x(d.data.end) - x(d.data.start)- 6; }).attr("transform", function(d) { return "translate("+ x(d.data.start) +"," + y('Annotations') + ")"; });
  },
  dragmove: function(d) {
      var x = this.xScale;
      var start = x.invert(x(d.data.start) + d3.event.dx);
      var end = x.invert(x(d.data.end) + d3.event.dx);
      d.set('start', start);
      d.set('end', end);
      console.log(d3.event.dx, start, end);
      this.redraw();
  },
  resizeleft: function(d) {
      var x = this.xScale;
      var start = x.invert(x(d.data.start) + d3.event.dx);
      if (start >= d.data.end) {
          return;
      }
      d.set('start', start);
      console.log(d3.event.dx, start);
      this.redraw();
  },
  resizeright: function(d) {
      var x = this.xScale;
      var end = x.invert(x(d.data.end) + d3.event.dx);
      if (end <= d.data.start) {
          return;
      }
      d.set('end', end);
      console.log(d3.event.dx, end);
      this.redraw();
  },
});

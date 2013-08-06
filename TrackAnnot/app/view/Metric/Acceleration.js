Ext.define("TrackAnnot.view.Metric.Acceleration", {
	extend : 'Ext.Component',
	alias : 'widget.accelchart',
	autoEl : {
		tag : 'svg'
	},
    mixins : {
	    bindable : 'Ext.util.Bindable'
	},
	requires : ['Ext.data.StoreManager'],
	config: {
	    before: 5,
	    after: 5,
	    padding: 0.1,
        trackStore: null,
	    annotationStore : null,
	    yMin: -1.5,
	    yMax: 2.5
	},
	data: [],
	current: null,
    format: d3.time.format('%X'),
	scales: {
        burst: [],
	    x: null,
		y: null
	},
	axis: {
        burst: [],
	    x: null,
	    y: null
	},
	constructor : function(config) {
		this.callParent(arguments);
		this.initConfig(config);
	},
	initComponent : function() {
		this.callParent(arguments);

		this.getTrackStore().on('load', this.loadData, this);

		this.addEvents('focusDate');
	},
	onResize : function(width, height, oldWidth, oldHeight) {
		if (oldWidth == undefined && oldHeight == undefined) {
			return;
		}
		this.draw();
	},
	draw : function() {
	    var me = this;
		var margin = {
			top : 5,
			right : 5,
			bottom : 20,
			left : 40
		}, width = this.getWidth() - margin.left - margin.right,
		height = this.getHeight() - margin.top - margin.bottom;

		  var data = this.data;

		  // x axes
          data.forEach(function(d, i) {
              var value = function(d) { return d.time; };
              var domain = d3.extent(d.accels, value);
              var offset = 0;
              var range = [offset, offset+me.scales.x.rangeBand()];
              var scale = me.scales.burst[i] = d3.scale.linear().domain(domain).range(range);
              me.axis.burst[i] = d3.svg.axis().scale(scale).orient("bottom").ticks(2);
          });

          var svg = this.svg;

          // Burst cells
          var cells = svg.selectAll("g.cell")
              .data(data, function(d, i) { return i+'-'+d.date_time.getTime(); });
          var ncells = cells.enter().append("g")
              .attr("transform", function(d,i) {
                  return "translate(" + me.scales.x(me.format(d.date_time)) + ", 0)";
              })
              .attr("class", "cell");

          // legend
          ncells.append('text')
              .attr('class', 'legend')
              .style('text-anchor', 'middle')
              .attr('y', 10)
              .attr('x', me.scales.x.rangeBand()/2)
              .text(function(d) { return me.format(d.date_time); });

          // frame
          var records = this.getAnnotationStore().data.items;
          ncells.append('rect')
              .attr('class', 'frame')
              .style('stroke', function(d) {
                  var color = '';
                  records.forEach(function(r) {
                      if (r.data.start <= d.date_time && d.date_time <= r.data.end) {
                          color = r.data.classification.color;
                      }
                  });
                  return color;
              })
              .attr('height', height)
              .attr('width', me.scales.x.rangeBand())

          // axis
          ncells.append('g')
              .attr('class', 'x axis')
              .attr("transform", "translate(0," + height + ")")
              .each(function(d, i) {
                  d3.select(this).call(me.axis.burst[i]);
              });

          // data points/line
          ncells.each(function(d, i) {
              var cell = d3.select(this);
              var x = me.scales.burst[i];
              me.drawBurst(cell, d.accels, x, me.scales.y);
          });

        this.scales.y.range([height, 0]);
		this.svg.select('g.y.axis').call(this.yAxis);

		cells.exit().remove();
	},
	drawBurst: function(cell, burstData, x, y) {
	    var me = this;

	    cell.append("path")
	      .attr("class", "line x")
	      .attr("d", function(d) {
	          return d3.svg.line().interpolate("linear")
	          .x(function(d) { return x(d.time); })
	          .y(function(d) { return y(d.x_acceleration) })(burstData)
	      });

	    cell.append("path")
	    .attr("class", "line y")
	    .attr("d", function(d) {
	        return d3.svg.line().interpolate("linear")
	        .x(function(d) { return x(d.time); })
	        .y(function(d) { return y(d.y_acceleration) })(burstData)
	    });

	    cell.append("path")
	    .attr("class", "line z")
	    .attr("d", function(d) {
	        return d3.svg.line().interpolate("linear")
	        .x(function(d) { return x(d.time); })
	        .y(function(d) { return y(d.z_acceleration) })(burstData)
	    });

	    // Plot dots.
	    cell.selectAll("circle.x")
	        .data(burstData)
	      .enter().append("circle")
	        .attr("class", "x")
	        .attr("cx", function(d) { return x(d.time) })
	        .attr("cy", function(d) { return y(d.x_acceleration) })
	        .attr("r", 2);

	    cell.selectAll("circle.y")
	    .data(burstData)
	  .enter().append("circle")
	    .attr("class", "y")
	    .attr("cx", function(d) { return x(d.time) })
	    .attr("cy", function(d) { return y(d.y_acceleration) })
	    .attr("r", 2);

	    cell.selectAll("circle.z")
	    .data(burstData)
	  .enter().append("circle")
	    .attr("class", "z")
	    .attr("cx", function(d) { return x(d.time) })
	    .attr("cy", function(d) { return y(d.z_acceleration) })
	    .attr("r", 2);
	},
	afterRender : function() {
		var me = this;
		var dom = this.getEl().dom;
		var margin = {
			top : 5,
			right : 5,
			bottom : 20,
			left : 40
		}, width = this.getWidth() - margin.left - margin.right, height = this
				.getHeight()
				- margin.top - margin.bottom;

		this.bindStore(me.getAnnotationStore());

		var svg = this.svg = d3.select(dom).append("g").attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");

		// Current
		// TODO on begin and end the current scrubber should not be in middle.
		var middle = width/2;
		svg.append("path").attr('class', 'scrubber')
		    .attr("transform", "translate(" + middle + ",0)")
		    .attr("d", d3.svg.line()([[0, 0],[0, height]]));

		var y = this.scales.y = d3.scale.linear().range([height, 0]);

		var yAxis = this.yAxis = d3.svg.axis().scale(y).orient("left");

		this.scales.x = d3.scale.ordinal().rangeRoundBands([0, width], this.getPadding(), 0.02);

		svg.append("g").attr("class", "y axis");

	},
	loadData : function(track, rawdata) {
	    this.rawdata = rawdata;
	    if (this.current == null) {
	        this.current = track.getStart();
	    }
	    // remove timepoints without accels
	    this.rawdata = this.rawdata.filter(function(d) {
	        return 'accels' in d;
	    });
	    this.sliceBursts();
	},
	sliceBursts: function() {
        var me = this;
        var bisectDate = d3.bisector(function(d) { return d.date_time }).left;
        var i = bisectDate(this.rawdata, this.current, 1);
        this.data = this.rawdata.slice(
                Math.max(i - this.getBefore(), 0),
                Math.max(i + this.getAfter(), 0)
        );

        this.scales.y.domain([this.getYMin(), this.getYMax()]);

        this.scales.x.domain(this.data.map(function(d) { return me.format(d.date_time); }));

        this.draw();
	},
	onMouseMove : function() {
		var xp0 = d3.mouse(d3.event.target)[0];
		var x0 = this.scales.x.invert(xp0);
		this.dateFocus(x0);
		this.fireEvent('focusDate', x0);
	},
	dateFocus : function(date) {
	    this.current = date;
	    this.sliceBursts();
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
	      load : this.draw,
	      update : this.draw,
          write : this.draw,
	      add : this.draw,
	      bulkremove : this.draw,
	      clear : this.draw
	    };
	  }
});
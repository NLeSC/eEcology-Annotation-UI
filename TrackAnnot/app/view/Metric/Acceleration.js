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
		time: {
		   start: null,
		   stop: null,
		   format: null,
	    },
		url: "355.2010-06-28.accel0.csv",
	    annotationStore : null
	},
	scales: {
		x: null,
		y: null
	},
	constructor : function(config) {
		this.callParent(arguments);
		this.initConfig(config);
	},
	initComponent : function() {
		this.callParent(arguments);

		this.addEvents('focusDate');
	},
	onResize : function(width, height, oldWidth, oldHeight) {
		if (oldWidth == undefined && oldHeight == undefined) {
			return;
		}
		this.draw();
	},
	draw : function() {
		var margin = {
			top : 5,
			right : 5,
			bottom : 20,
			left : 40
		}, width = this.getWidth() - margin.left - margin.right, height = this
				.getHeight()
				- margin.top - margin.bottom;

		this.scales.x.range([0, width]);
		this.scales.y.range([height, 0]);

		var me = this;
		this.svg.select('rect.pane').attr('width', width)
				.attr('height', height);

		this.svg.selectAll('path.line').attr("d", function(d) {
					return me.line(d.values);
				}).style("stroke", function(d) {
					return me.color(d.name);
				});

		this.svg.select('g.x.axis').attr("transform",
				"translate(0," + height + ")").call(this.xAxis);
		this.svg.select('g.y.axis').call(this.yAxis);
		this.svg.select('path.focus').attr("d",
				d3.svg.line()([[0, 0], [0, height]]));

		this.svg.selectAll(".legend rect").attr("x", width - 18);
		this.svg.selectAll(".legend text").attr("x", width - 24);
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

		this.annotations = svg.append("g").attr("class", "annotations");

		var x = this.scales.x = d3.time.scale().range([0, width]);

		var y = this.scales.y = d3.scale.linear().range([height, 0]);

		var color = this.color = d3.scale.category10();

		var xAxis = this.xAxis = d3.svg.axis().scale(x)
				.tickFormat(this.getTime().format).tickSubdivide(3).orient("bottom");

		var yAxis = this.yAxis = d3.svg.axis().scale(y).orient("left");

		var line = this.line = d3.svg.line().interpolate("basis").x(
				function(d) {
					return margin.left + 20 + x(d.date_time);
				}).y(function(d) {
					return y(d.g);
				});

		this.data = [];
		console.log("Fetching "+this.getUrl());

		d3.csv(this.getUrl()).row(function(d) {
			var dt = new Date(new Date(d.date_time).getTime()
					+ (d.index * 30 * 1000));
			return {
				date_time : dt,
				x : +d.x_acceleration,
				y : +d.y_acceleration,
				z : +d.z_acceleration
				,
			};
		}).get(function(error, rows) {
					me.loadData(rows);
				});

		x.domain([this.getTime().start, this.getTime().stop]);

		svg.append("g").attr("class", "x axis");

		svg.append("g").attr("class", "y axis").append("text").attr(
				"transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em")
				.style("text-anchor", "end").text("g-force (m/s²)");

		// zoomer rect which captures mouse drags and mouse wheel events
		var zoomer = this.svg.append('rect').attr('class', 'pane').attr(
				'width', width).attr('height', height)
		// .on("mouseover", function() { me.focus.style("display", null); })
		// .on("mouseout", function() {
		// me.up('window').setTitle('Accelerometers');
		// me.focus.style("display", "none");
		// })
		// .on("mousemove", this.onMouseMove.bind(this))
		// focus line + zoom dont go together because the compete over mousemove
		// event
		// .call(d3.behavior.zoom().x(x).on("zoom", this.draw.bind(this)))
		;

		this.focus = svg.append("path").attr("class", "focus").style("display",
				"none");
	},
	loadData : function(rows) {
		this.data = rows;
		var data = this.data;
		this.svg.datum(this.data);

		this.color.domain(d3.keys(data[0]).filter(function(key) {
					return key !== "date_time";
				}));

		var legend = this.svg.selectAll(".legend").data(this.color.domain())
				.enter().append("g").attr("class", "legend").attr("transform",
						function(d, i) {
							return "translate(0," + i * 20 + ")";
						});

		legend.append("rect").attr("width", 18).attr("height", 18).style(
				"fill", this.color);

		legend.append("text").attr("y", 9).attr("dy", ".35em").style(
				"text-anchor", "end").text(function(d) {
					return d;
				});

		var cities = this.color.domain().map(function(name) {
					return {
						name : name,
						values : data.map(function(d) {
									return {
										date_time : d.date_time,
										g : +d[name]
									};
								})
					};
				});
		this.cities = cities;

		this.scales.x.domain([this.getTime().start, this.getTime().stop]);
		this.scales.y.domain([d3.min(cities, function(c) {
							return d3.min(c.values, function(v) {
										return v.g;
									});
						}), d3.max(cities, function(c) {
							return d3.max(c.values, function(v) {
										return v.g;
									});
						})]);

		var city = this.svg.selectAll(".city").data(cities).enter().append("g")
				.attr("class", "city");

		city.append("path").attr("class", "line");

		this.draw();
	},
	onMouseMove : function() {
		var xp0 = d3.mouse(d3.event.target)[0];
		var x0 = this.scales.x.invert(xp0);
		this.dateFocus(x0);
		this.fireEvent('focusDate', x0);
	},
	dateFocus : function(date) {
		var bisectDate = d3.bisector(function(d) {
					return d.date_time;
				}).left;
		var i = bisectDate(this.data, date, 1);
		if (i == 0 || i >= this.data.length) {
			return;
		}
		var d0 = this.data[i - 1];
		var d1 = this.data[i];
		var d = date - d0.date_time > d1.date_time - date ? d1 : d0;
		this.focus.attr("transform", "translate(" + this.scales.x(date) + ",0)")
				.style("display", null);
		this.up('window').setTitle('Accelerometers ' + d.date_time + ', x:'
				+ d3.round(d.x, 5) + ', y:' + d3.round(d.y, 5) + ', z:'
				+ d3.round(d.z, 5));
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
	    var rects = this.annotations.selectAll("rect.annotation").data(records);
	    rects.enter()
	        .append('rect').attr('class', function(d) {
	              return "annotation " + d.data.type;
	            }).attr('width', function(d) {
	              return me.scales.x(d.data.end) - me.scales.x(d.data.start);
	            }).attr('height', this.scales.y.range()[0]).attr('x',
	            function(d) {
	              return me.scales.x(d.data.start);
	            }).attr('y', this.scales.y.range()[1]).style('fill', function(d) {
	              return d.data.color
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
	      return d.data.color
	    }).attr('ry', 4).attr('ry', 4);

	    rects.exit().remove();
	  }
});
Ext.define("TrackAnnot.view.Metric.Temperature", {
	extend : 'Ext.Component',
	alias : 'widget.tempchart',
	autoEl : {
		tag : 'svg'
	},
    mixins : {
	    bindable : 'Ext.util.Bindable'
	},
	requires : ['Ext.data.StoreManager'],
	config: {
		trackStore: null,
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

        var astore = Ext.data.StoreManager.lookup(this.getAnnotationStore());
        this.setAnnotationStore(astore);

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
		var margin = {
			top : 5,
			right : 5,
			bottom : 20,
			left : 30
		}, width = this.getWidth() - margin.left - margin.right, height = this
				.getHeight()
				- margin.top - margin.bottom;

		this.scales.x.range([0, width]);
		this.scales.y.range([height, 0]);

		this.svg.select('rect.pane').attr('width', width)
				.attr('height', height);
		this.svg.select('path.line').attr('d', this.line);
		this.svg.select('g.x.axis').attr("transform",
				"translate(0," + height + ")").call(this.xAxis);
		this.svg.select('g.y.axis').call(this.yAxis);
		this.svg.select('path.focus').attr("d",
				d3.svg.line()([[0, 0], [0, height]]));
	},
	afterRender : function() {
		var me = this;
		var dom = this.getEl().dom;
		var margin = {
			top : 5,
			right : 5,
			bottom : 20,
			left : 30
		}, width = this.getWidth() - margin.left - margin.right, height = this
				.getHeight()
				- margin.top - margin.bottom;

		this.bindStore(me.getAnnotationStore());

		var svg = this.svg = d3.select(dom).append("g").attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");

		this.annotations = svg.append("g").attr("class", "annotations");

		var x = this.scales.x = d3.time.scale().range([0, width]);

		var y = this.scales.y = d3.scale.linear().range([height, 0]);

		var xAxis = this.xAxis = this.getTrackStore().getAxis().scale(x).orient("bottom");

		var yAxis = this.yAxis = d3.svg.axis().scale(y).orient("left");

		var line = this.line = d3.svg.line().interpolate("basis").x(
				function(d) {
					return margin.left + 30 + x(d.date_time);
				}).y(function(d) {
					return y(d.temperature);
				});

		this.data = [];

		svg.append("g").attr("class", "x axis");

		svg.append("g").attr("class", "y axis").append("text").attr(
				"transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em")
				.style("text-anchor", "end").text("Temperature (ºC)");

		svg.append("path").attr("class", "line");

		// zoomer rect which captures mouse drags and mouse wheel events
		var zoomer = this.svg.append('rect').attr('class', 'pane').attr(
				'width', width).attr('height', height)
		// .on("mouseover", function() { me.focus.style("display", null); })
		// .on("mouseout", function() {
		// me.up('window').setTitle('Temperature');
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
	loadData : function(trackStore, rows) {
		this.data = rows;
		this.svg.datum(this.data);

	    this.scales.x.domain(this.getTrackStore().getTimeExtent());

		this.scales.y.domain(d3.extent(this.data, function(d) {
			return d.temperature;
		}));

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
		var d0 = this.data[i - 1];
		var d1 = this.data[i];
		var d = date - d0.date_time > d1.date_time - date ? d1 : d0;

		this.focus.attr("transform", "translate(" + this.scales.x(date) + ",0)")
				.style("display", null);
		this.up('window').setTitle('Temperature ' + d.date_time + ', '
				+ d3.round(d.temperature, 5) + '&deg;C');
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
	  }
});
/**
 * Plot temperature of track and any annotations
 */
Ext.define("TrackAnnot.view.Metric.Temperature", {
    extend : 'TrackAnnot.view.Metric.Abstract',
    alias : 'widget.tempchart',
    draw : function() {
        var margin = {
            top : 5,
            right : 5,
            bottom : 20,
            left : 70
        };
//        var w = this.getWidth();
//        var h = this.getHeight();

        var w = this.getEl().getStyle('width').replace('px','')*1;
        var h = this.getEl().getStyle('height').replace('px','')*1;

        var width = w - margin.left - margin.right;
        var height = h - margin.top - margin.bottom;

        this.scales.x.range([0, width]);
        this.scales.y.range([height, 0]);

        this.svg.select('path.line').attr('d', this.line);
        this.svg.select('g.x.axis').attr("transform",
                "translate(0," + height + ")").call(this.xAxis);
        this.svg.select('g.y.axis').call(this.yAxis);
        this.svg.select('path.focus').attr("d",
                d3.svg.line()([[0, 0], [0, height + this.tickHeight]]));
    },
    afterRender : function() {
        this.callParent(arguments);
        var me = this;
        var dom = this.getEl().dom;
        var margin = {
            top : 5,
            right : 5,
            bottom : 20,
            left : 70
        };
//            var w = this.getWidth();
//            var h = this.getHeight();

        var w = this.getEl().getStyle('width').replace('px','')*1;
        var h = this.getEl().getStyle('height').replace('px','')*1;

        var width = w - margin.left - margin.right;
        var height = h - margin.top - margin.bottom;

        var svg = this.svg = d3.select(dom).append("g").attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        this.annotations = svg.append("g").attr("class", "annotations");

        this.scales = {};
        this.scales.x = d3.time.scale.utc().range([0, width]);
        this.scales.y = d3.scale.linear().range([height, 0]);

        this.xAxis = this.getTrackStore().getAxis().scale(this.scales.x).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.scales.y).orient("left").ticks(5);

        var line = this.line = d3.svg.line().interpolate("linear").x(
                function(d) {
                    return me.scales.x(d.date_time);
                }).y(function(d) {
                    return me.scales.y(d.temperature);
                });

        svg.append("g").attr("class", "x axis");

        svg.append("g").attr("class", "y axis").append("text").attr(
                "transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em")
                .style("text-anchor", "end").text("Temperature (ºC)");

        svg.append("path").attr("class", "line");

        this.focus = svg.append("path").attr("class", "focus").style("display",
                "none");
    },
    setupYScaleDomain: function() {
        var data = this.svg.datum();
        this.scales.y.domain(d3.extent(data, function(d) {
            return d.temperature;
        }));
    }
});

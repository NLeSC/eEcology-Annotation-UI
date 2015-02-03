Ext.define("TrackAnnot.view.Metric.CustomData", {
    extend : 'TrackAnnot.view.Metric.Abstract',
    draw: function() {
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
    afterRender: function() {
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
        this.setupXScaleDomain();
        this.scales.y = d3.scale.linear().range([height, 0]);

        this.xAxis = this.getTrackStore().getAxis().scale(this.scales.x).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.scales.y).orient("left").ticks(5);

        this.line = d3.svg.line().interpolate("linear");

        svg.append("g").attr("class", "x axis");
        svg.append("g").attr("class", "y axis");

        svg.append("path").attr("class", "line");

        this.focus = svg.append("path").attr("class", "focus").style("display",
                "none");
    },
    selectColumn: function(selectedColumn) {
        var me = this;
        this.line.x(function(d) {
            return me.scales.x(d.date_time);
        }).y(function(d) {
            return me.scales.y(d[selectedColumn]);
        });

        var data = this.svg.datum();
        this.scales.y.domain(d3.extent(data, function(d) {
            return d[selectedColumn];
        }));
    },
    loadData: function(data, selectedColumn) {
        this.svg.datum(data);
        this.selectColumn(selectedColumn);

        this.draw();
        this.drawAnnotations();
    },
    setupXScaleDomain : function(trackStore, rows) {
        this.scales.x.domain(this.getTrackStore().getTimeExtent());
    },
    applyTrackStore: function(store) {
        store = Ext.data.StoreManager.lookup(store);
        store.on('load', this.setupXScaleDomain, this);
        return store;
    },
    destroy: function() {
        this.getTrackStore().un('load', this.setupXScaleDomain, this);
        this.mixins.bindable.bindStore(null);
        this.callParent();
    }
});

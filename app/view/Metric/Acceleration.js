/**
 * Plot a film strip of acceleration bursts of track and any annotations
 */
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
        before: 4,
        after: 4,
        padding: 0.1,
        annotationStore: 'Annotations',
        trackStore: 'Track',
        yMin: -1.5,
        yMax: 2.5,
        tickHeight: 6
    },
    data: [],
    rawdata: [],
    current: null,
    format: d3.time.format.utc('%X'),
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
    innerMargin: {
        top : 5,
        right : 5,
        bottom : 20,
        left : 40
    },
    constructor : function(config) {
        this.callParent(arguments);
        this.initConfig(config);
    },
    initComponent : function() {
        this.callParent(arguments);

        var me = this;
        this.contextMenu = Ext.create('Ext.menu.Menu', {
            defaults: {
                checked: false,
                group: 'annot',
                listeners: {
                    checkchange: me.onAnnotCheckChange,
                    scope: me
                }
            },
            items: [{
                text: 'No classes loaded',
                disabled: true
            }]
        });

        this.addEvents('focusDate', 'burstclick', 'burstcontextclick');
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
        if (oldWidth === undefined && oldHeight === undefined) {
            return;
        }
        this.draw();
    },
    updateBefore: function(newNr, oldNr) {
        if (this.hasData()) {
            this.sliceBursts();
        }
    },
    updateAfter: function(newNr, oldNr) {
        if (this.hasData()) {
            this.sliceBursts();
        }
    },
    getInnerHeight: function() {
        return this.getEl().getStyle('height').replace('px','')*1;
    },
    getInnerWidth: function() {
        return this.getEl().getStyle('width').replace('px','')*1;
    },
    draw: function() {
        var me = this;
        var margin = this.innerMargin;
        var w = this.getInnerWidth();
        var h = this.getInnerHeight();

        var width = w - margin.left - margin.right;
        var height = h - margin.top - margin.bottom;

        var data = this.data;

        this.scales.x.rangeRoundBands([0, width], this.getPadding(), 0.02);
        this.scales.y.range([height, 0]);

        // x axes
        data.forEach(function(d, i) {
            var domain = [];
            if (d.time_acceleration) {
                domain = [
                    d.time_acceleration[0],
                    d.time_acceleration[d.time_acceleration.length - 1]
                ];
            }
            var offset = 0;
            var range = [offset, offset + me.scales.x.rangeBand()];
            var scale = me.scales.burst[i] = d3.scale.linear().domain(domain).range(range);
            me.axis.burst[i] = d3.svg.axis().scale(scale).orient("bottom").ticks(2);
        });

        var svg = this.svg;

        // Burst cells
        var cells = svg.selectAll("g.cell")
              .data(data, function(d, i) {
                  // every cell is unique and needs to be recreated
//                  return i+'-'+d.date_time.getTime();
                  return Math.random();
              });
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
          ncells.append('rect')
              .attr('class', 'frame')
              .classed('current', function(d, i) {
                  return d.date_time === me.current;
              })
              .attr('height', height)
              .attr('width', me.scales.x.rangeBand())
              .on('click', function(d) {
                  me.showContextMenu(d, d3.event.x, d3.event.y);
              })
              ;

          // annotation color bar
          ncells.append('rect')
              .attr('class', 'annot')
              .attr("transform", "translate(0," + height + ")")
              .attr('height', this.tickHeight)
              .attr('width', me.scales.x.rangeBand())
           ;
          this.drawAnnotations();

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
              me.drawBurst(cell, d, x, me.scales.y);
          });

        this.scales.y.range([height, 0]);
        this.svg.select('g.y.axis').call(this.yAxis);

        cells.exit().remove();
    },
    drawBurst: function(cell, burstData, x, y) {
        if (!burstData.time_acceleration) {
            // unable to draw acceleration burst chart when there is no acceleration data
            return;
        }

        if (burstData.date_time === this.current) {
            this.drawFocus(cell, burstData, x, y);
        }

        cell.append("path")
          .attr("class", "line x")
          .attr("d", function(d) {
              return d3.svg.line().interpolate("linear")
              .x(function(d) { return x(d); })
              .y(function(d, i) { return y(burstData.x_acceleration[i]); })(burstData.time_acceleration);
          });

        cell.append("path")
        .attr("class", "line y")
        .attr("d", function(d) {
            return d3.svg.line().interpolate("linear")
            .x(function(d) { return x(d); })
            .y(function(d, i) { return y(burstData.y_acceleration[i]); })(burstData.time_acceleration);
        });

        cell.append("path")
        .attr("class", "line z")
        .attr("d", function(d) {
            return d3.svg.line().interpolate("linear")
            .x(function(d) { return x(d); })
            .y(function(d, i) {
                return y(burstData.z_acceleration[i]);
            })(burstData.time_acceleration);
        });

        // Plot dots.
        cell.selectAll("circle.x")
            .data(burstData.time_acceleration)
          .enter().append("circle")
            .attr("class", "x")
            .attr("cx", function(d) { return x(d); })
            .attr("cy", function(d, i) { return y(burstData.x_acceleration[i]); })
            .attr("r", 2);

        cell.selectAll("circle.y")
        .data(burstData.time_acceleration)
      .enter().append("circle")
        .attr("class", "y")
        .attr("cx", function(d) { return x(d); })
        .attr("cy", function(d, i) { return y(burstData.y_acceleration[i]); })
        .attr("r", 2);

        cell.selectAll("circle.z")
        .data(burstData.time_acceleration)
      .enter().append("circle")
        .attr("class", "z")
        .attr("cx", function(d) { return x(d); })
        .attr("cy", function(d, i) { return y(burstData.z_acceleration[i]); })
        .attr("r", 2);

    },
    drawAnnotations: function() {
        var svg = this.svg;
        var records = this.getAnnotationStore().data.items;
        var cells = svg.selectAll("g.cell rect.annot");
        cells.style('fill', function(d) {
            var color = 'white';
            records.forEach(function(r) {
                if (r.data.start <= d.date_time && d.date_time <= r.data.end) {
                    color = r.data.classification.color;
                }
            });
            return color;
        });
    },
    /**
     * If current is inside the current acceleration burst then draw a vertical focus line
     */
    drawFocus: function(cell, burstData, x, y) {
        var currentTime = this.unSnappedCurrent.getTime();
        if (!burstData) {
            return;
        }
        var currentBurstBeginTime = burstData.date_time.getTime();
        var currentBurstEndTime = currentBurstBeginTime + (burstData.time_acceleration[burstData.time_acceleration.length - 1] * 1000);
        if (currentTime > currentBurstBeginTime && currentTime < currentBurstEndTime) {
            var offset = currentTime - currentBurstBeginTime;
            // x scale expects seconds, but time in ms so convert
            offset = offset / 1000;
            this.drawFocusLine(cell, offset, x, y);
        }
    },
    drawFocusLine: function(cell, offset, x, y) {
        var margin = this.innerMargin;
        var w = this.getInnerWidth();
        var h = this.getInnerHeight();
        var height = h - margin.top - margin.bottom;

        var offset_pixel = x(offset);
        cell.append("path")
          .attr("class", "focus")
          .attr("d", d3.svg.line()([[offset_pixel, 0], [offset_pixel, height + this.tickHeight]]));
    },
    afterRender : function() {
        var me = this;
        var dom = this.getEl().dom;
        var margin = this.innerMargin;

        var w = this.getInnerWidth();
        var h = this.getInnerHeight();

        var width = w - margin.left - margin.right;
        var height = h - margin.top - margin.bottom;

        this.bindStore(me.getAnnotationStore());

        var svg = this.svg = d3.select(dom).append("g").attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        this.scales.y = d3.scale.linear().range([height, 0]);

        this.yAxis = d3.svg.axis().scale(this.scales.y).orient("left");

        this.scales.x = d3.scale.ordinal().rangeRoundBands([0, width], this.getPadding(), 0.02);

        svg.append("g").attr("class", "y axis");

    },
    loadData : function(track, rawdata) {
        this.rawdata = rawdata;
        if (this.current == null) {
            this.current = track.getStart();
        }
        this.sliceBursts();
    },
    sliceBursts: function() {
        var me = this;
        var bisectDate = d3.bisector(function(d) {
            return d.date_time;
        }).left;
        var i = bisectDate(this.rawdata, this.current, 1);
        this.data = this.rawdata.slice(
                Math.max(i - this.getBefore(), 0),
                Math.min(i + this.getAfter() + 1, this.rawdata.length)
        );

        this.scales.y.domain([this.getYMin(), this.getYMax()]);

        this.scales.x.domain(this.data.map(function(d) {
            return me.format(d.date_time);
        }));

        this.draw();
    },
    dateFocus : function(date) {
        this.unSnappedCurrent = date;
        // while dragging the current time it is not snapped to a timepoint so do it here
        // because accelerator renders chart per timepoint and to highlight current timepoint it needs to be snapped
        date = this.trackStore.closestDate(date);
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
          load : this.drawAnnotations,
          update : this.drawAnnotations,
          write : this.drawAnnotations,
          add : this.drawAnnotations,
          bulkremove : this.drawAnnotations,
          clear : this.drawAnnotations
        };
    },
    destroy: function() {
          this.getTrackStore().un('load', this.loadData, this);
          this.mixins.bindable.bindStore(null);
          this.callParent();
    },
    hasData: function() {
          return this.rawdata.length > 0;
    },
    showContextMenu: function(burstData, x, y) {
        this.fireEvent('burstclick', this.contextMenu, burstData);
        this.contextMenu.showAt(x,y);
    },
    onAnnotCheckChange: function(field, checked) {
        if (!checked) {
            return;
        }
        this.fireEvent('burstcontextclick', field);
        this.drawAnnotations();
    }
});

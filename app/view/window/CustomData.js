Ext.define("TrackAnnot.view.window.CustomData", {
  extend : 'TrackAnnot.view.window.Abstract',
  layout: {
    type: 'border'
  },
  requires: [
    'TrackAnnot.view.Metric.CustomData',
    'Ext.form.field.ComboBox',
    'Ext.data.Store',
    'Ext.form.field.File',
    'Ext.toolbar.Toolbar',
    'Ext.layout.container.Border'
  ],
  config: {
      trackStore: 'Track'
  },
  autoShow: true,
  initComponent: function() {
    var me = this;

    this.fileField = Ext.create('Ext.form.field.File', {
      buttonOnly: true,
      hideLabel: true,
      listeners: {
        change: this.onFileFieldChange,
        scope: this
      }
    });

    this.columnStore = Ext.create('Ext.data.Store', {
      fields: ['name'],
      data : []
    });

    this.columnSelector = Ext.create('Ext.form.field.ComboBox', {
      store: this.columnStore,
      emptyText: 'Browse for file first',
      displayField: 'name',
      queryMode: 'local',
      typeAhead: true,
      forceSelection: true
    });
    this.columnSelector.on('select', this.onColumnSelect, this);

    this.dockedItems = [{
      xtype: 'toolbar',
      dock: 'top',
      items: [this.fileField, this.columnSelector]
    }];

    this.chart = Ext.create('TrackAnnot.view.Metric.CustomData');
    this.items = [this.chart];

    this.getTrackStore().on('load', this.populateChart, this);

    this.callParent();
  },
  getChart: function() {
      return this.chart;
  },
  applyTrackStore: function(store) {
      store = Ext.data.StoreManager.lookup(store);
      return store;
  },
  afterRender: function() {
    this.callParent();
  },
  getFilesOfFileField: function() {
    return this.fileField.button.fileInputEl.dom.files;
  },
  onFileFieldChange: function(field, event) {
    var files = this.getFilesOfFileField();
    var file = files[0];
    this.setFilename(file.name);
    this.load(window.URL.createObjectURL(file));
  },
  setFilename: function(filename) {
      this.filename = filename;
      this.setTitle(this.filename);
  },
  load: function(url) {
      d3.csv(url, this.loadData.bind(this));
  },
  rawAccessor: function(d) {
      Object.keys(d).forEach(function(k) {
        if (k === 'date_time') {
            d[k] = new Date(d[k]);
        } else {
            d[k] = +d[k];
            // remove non number columns
            if (isNaN(d[k])) {
                delete(d[k]);
            }
        }
      });

      return d;
  },
  loadData: function(data) {
      this.rawData = data.map(this.rawAccessor);
      this.rawData.sort(function(a, b) {
        // oldest first
        return a.date_time - b.date_time;
      });
      this.populateColumnSelector();
  },
  populateColumnSelector: function() {
      var firstRow = this.rawData[0];
      var keys = Object.keys(firstRow);
      var columns = keys.filter(function(d) {
        return !(d === 'date_time' || d === 'device_info_serial');
      }).map(function(d) {
        return {'name': d};
      });
      this.columnStore.loadData(columns);

      // select first column
      var firstColumn = this.columnStore.getAt(0);
      this.columnSelector.select(firstColumn);
      this.onColumnSelect(this.columnSelector, [firstColumn]);
  },
  populateChart: function() {
      var timeExtent = this.getTrackStore().getTimeExtent();
      var trackerId = +this.getTrackStore().getTrackerId();
      var data = this.rawData.filter(function(d) {
          return d.date_time >= timeExtent[0] && d.date_time <= timeExtent[1] &&
              d.device_info_serial === trackerId
          ;
      });
      var selectedColumn =  this.columnSelector.getSubmitValue();
      this.chart.loadData(data, selectedColumn);
  },
  onColumnSelect: function(combo, selection) {
    var selectedColumn = selection[0].data.name;

    this.setTitle(this.filename + ' - ' + selectedColumn);

    this.populateChart();
  },
  dateFocus: function(current, source) {
    if (source === this) {
      // dont change when 'this' was the source of the event
      return;
    }
    this.chart.dateFocus(current);
  },
  destroy: function() {
      this.getTrackStore().un('load', this.populateChart, this);
      this.callParent();
  }
});

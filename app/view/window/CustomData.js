Ext.define("TrackAnnot.view.window.CustomData", {
  extend : 'TrackAnnot.view.window.Abstract',
  layout: {
    type: 'border'
  },
  requires: [
    'Ext.form.field.ComboBox',
    'Ext.data.Store',
    'Ext.form.field.File',
    'Ext.toolbar.Toolbar',
    'Ext.layout.container.Border'
  ],
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
      listeners: {
        select: this.onColumnSelect
      }
    });

    this.dockedItems = [{
      xtype: 'toolbar',
      dock: 'top',
      items: [this.fileField, this.columnSelector]
    }];

    this.callParent();
    // this.setTitle(this.labelField.getValue());
  },
  afterRender: function() {
    this.callParent();
  },
  onLoadedData: function() {
    console.log('onLoadedData');
  },
  getFilesOfFileField: function() {
    return this.fileField.button.fileInputEl.dom.files;
  },
  onFileFieldChange: function(field, event) {
    var files = this.getFilesOfFileField();
    var file = files[0];
    this.filename = file.name;
    this.setTitle(this.filename);
    d3.csv(URL.createObjectURL(file), this.loadData.bind(this));
  },
  loadData: function(data) {
     // TODO check file has id,ts columns
     var keys = Object.keys(data[0]);
     var columns = keys.filter(function(d) {
       return !(d === 'ts' || d === 'id');
     }).map(function(d) {
       return {'name': d};
     });

     this.columnStore.add(columns);
     this.columnSelector.setValue(columns[0].name);
     this.onColumnSelect(this.columnSelector, [columns[0]]);

     this.data = data;
  },
  onColumnSelect: function(combo, selection) {
    this.setTitle(this.filename + ' - ' + selection[0].name);
  },
  dateFocus: function(current, source) {
    if (source == this) {
      // dont change when 'this' was the source of the event
      return;
    }
    this.currentTime = current;

    // TODO when data is present
  }
});

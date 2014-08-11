/**
 * Timeline window
 */
Ext.define("TrackAnnot.view.window.Timeline", {
  extend : 'TrackAnnot.view.window.Abstract',
  requires: ["TrackAnnot.view.Timeline",
             'TrackAnnot.view.field.DateTime',
             'Ext.toolbar.Toolbar',
             'Ext.button.Button',
             'TrackAnnot.view.field.TimestepSizePicker'
             ],
  title : 'Timeline',
  alias : 'widget.timelinewindow',
  closable: false,
  stateId: 'timeline-window',
  initComponent : function() {
    var me = this;

    this.addEvents('currentDate');

    this.currentTimeField = Ext.create('widget.datetimefield', {
        width: 220,
        labelWidth: 40,
        fieldLabel: 'Current'
    });
    this.currentTimeField.on('change', me.onCurrentTimeFieldChange, me);

    this.timestepSizePicker = Ext.create('TrackAnnot.view.field.TimestepSizePicker');

    this.dockedItems = [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            this.currentTimeField,
            '-',
            this.timestepSizePicker,
        {
            xtype: 'button',
            tooltip: 'Move current time to start',
            iconCls: 'x-tbar-page-first',
            itemId: 'first_timepoint'
        }, {
            xtype: 'button',
            tooltip: 'Move current time a step back',
            iconCls: 'x-tbar-page-prev',
            itemId: 'prev_timepoint'
        }, {
            xtype: 'button',
            tooltip: 'Move current time a step forward',
            iconCls: 'x-tbar-page-next',
            itemId: 'next_timepoint'
        }, {
            xtype: 'button',
            tooltip: 'Move current time to end',
            iconCls: 'x-tbar-page-last',
            itemId: 'last_timepoint'
        }]
    }];

    this.timeline = Ext.create("TrackAnnot.view.Timeline");
    this.timeline.on('currentDate', me.onCurrentDate, me);
    this.items = [this.timeline];

    this.callParent();
  },
  onCurrentTimeFieldChange: function(field, newValue) {
      var currentDate = new Date(newValue);
      // snap scrubber to closest timepoint in track
      var trackStore = Ext.StoreManager.get('Track');
      var index = trackStore.closestIndex(currentDate);
      currentDate = trackStore.get(index).date_time;
      this.fireEvent('currentDate', currentDate, field);
  },
  onCurrentDate: function(currentDate) {
      this.fireEvent('currentDate', currentDate, this.timeline);
  },
  getTimeline: function() {
      return this.timeline;
  },
  dateFocus: function(current, source) {
	  if (source !== this.currentTimeField) {
		  this.currentTimeField.setValue(current);
	  }
	  if (source !== this.timeline) {
		  this.timeline.dateFocus(current);
	  }
  },
  getTimestepSizePicker: function() {
      return this.timestepSizePicker;
  },
  getTimestepSize: function() {
      return this.getTimestepSizePicker().lastSelection[0];
  }
});

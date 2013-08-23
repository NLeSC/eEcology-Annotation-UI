Ext.define("TrackAnnot.view.window.Timeline", {
  extend : 'TrackAnnot.view.window.Abstract',
  requires: ["TrackAnnot.view.Timeline",
             'TrackAnnot.view.field.DateTime',
             'Ext.toolbar.Toolbar',
             'Ext.button.Button',
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
        fieldLabel: 'Current',
        listeners: {
            change: function(field, newValue) {
                var currentDate = new Date(newValue);
                // snap scrubber to closest timepoint in track
                var trackStore = Ext.StoreManager.get('Track');
                var index = trackStore.closestIndex(currentDate);
                currentDate = trackStore.get(index).date_time;
                me.fireEvent('currentDate', currentDate);
            }
        }
    });
    this.dockedItems = [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [this.currentTimeField, {
            xtype: 'button',
        width: 16,
        tooltip: 'Move current time to closest previous time point',
        iconCls: 'x-tbar-page-prev',
            itemId: 'prev_timepoint'
        }, {
            xtype: 'button',
        width: 16,
        tooltip: 'Move current time to closest next time point',
            iconCls: 'x-tbar-page-next',
            itemId: 'next_timepoint'
        }]
    }];

    this.timeline = Ext.create("TrackAnnot.view.Timeline");
    this.timeline.on('currentDate', function(currentDate) {
        me.fireEvent('currentDate', currentDate);
    });
    this.items = [this.timeline];

    this.callParent();
  },
  getTimeline: function() {
      return this.timeline;
  },
  dateFocus: function(current) {
      this.currentTimeField.setValue(current);
      this.getTimeline().dateFocus(current);
  }
});

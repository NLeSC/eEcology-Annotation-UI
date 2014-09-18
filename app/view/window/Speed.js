/**
 * Speed window with menu to toggle speed types.
 */
Ext.define("TrackAnnot.view.window.Speed", {
    extend : 'TrackAnnot.view.window.ToggleableAbstract',
    requires: [
       'TrackAnnot.view.Metric.Speed'
    ],
    stateId: 'speed-window',
    chart: 'TrackAnnot.view.Metric.Speed'
});
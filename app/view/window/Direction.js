/**
 * Direction window with tool menu to toggle different direction types
 */
Ext.define('TrackAnnot.view.window.Direction', {
    extend : 'TrackAnnot.view.window.ToggleableAbstract',
    requires: ['TrackAnnot.view.Metric.Direction'],
    stateId: 'direction-window',
    chart: 'TrackAnnot.view.Metric.Direction'
});
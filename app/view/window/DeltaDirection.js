/**
 * Delta Direction window
 */
Ext.define('TrackAnnot.view.window.DeltaDirection', {
    extend : 'TrackAnnot.view.window.ToggleableAbstract',
    requires: ['TrackAnnot.view.Metric.DeltaDirection'],
    stateId: 'delta-direction-window',
    chart: 'TrackAnnot.view.Metric.DeltaDirection'
});
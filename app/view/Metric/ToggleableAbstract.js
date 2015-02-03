Ext.define('TrackAnnot.view.Metric.ToggleableAbstract', {
    extend : 'TrackAnnot.view.Metric.Abstract',
    config: {
        visibilityOfInstantaneous: true,
        visibilityOfTraject: true
    },
    updateVisibilityOfInstantaneous: function(newVisibility, oldVisibility) {
        if (newVisibility !== oldVisibility && !this.trackStore.isEmpty() && this.isVisible()) {
            this.draw();
        }
    },
    updateVisibilityOfTraject: function(newVisibility, oldVisibility) {
        if (newVisibility !== oldVisibility && !this.trackStore.isEmpty() && this.isVisible()) {
            this.draw();
        }
    }
});

Ext.define('TrackAnnot.store.Classifications', {
    extend : 'Ext.data.Store',
    model : 'TrackAnnot.model.Classification',
    importText: function(text, trackStore) {
        var me = this;
        var ssv = d3.dsv(" ", "text/plain");
        var data = ssv.parseRows(text);
        data.forEach(function(d) {
            var color = 'rgb(' + Math.floor(d[2]*255) + ',' + Math.floor(d[3]*255) + ',' +  Math.floor(d[4]*255) + ')';
            me.add({
                id: d[0],
                label: d[1],
                color: color
            });
        });
    },
    exportText : function() {
        var sep = " ";
        var linesep = "\n";
        var text = '';

        function roundit(d) {
            return Math.round(d/255*100)/100;
        }

        this.each(function(d) {
            var color = d3.rgb(d.data.color);
            text += [d.id, d.data.label, roundit(color.r), roundit(color.g), roundit(color.b)].join(sep) + linesep;
        });
        return text;
    }
});

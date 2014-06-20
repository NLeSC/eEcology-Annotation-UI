/**
 * Store for classifications
 */
Ext.define('TrackAnnot.store.Classifications', {
    extend : 'Ext.data.Store',
    model : 'TrackAnnot.model.Classification',
    importText: function(text) {
        var me = this;
        var ssv = d3.dsv(" ", "text/plain");
        var data = ssv.parseRows(text);
        data.forEach(function(d) {
            var color = 'rgb(' + Math.floor(d[2]*255) + ',' + Math.floor(d[3]*255) + ',' +  Math.floor(d[4]*255) + ')';
            me.add({
                id: +d[0],
                label: d[1],
                color: color
            });
        });
    },
    exportText : function() {
        var sep = " ";
        var linesep = "\n";
        var text = '';

        /**
         * Convert 0..255 into 0.00..1.00
         */
        function int2fract(d) {
            return Math.floor(d/255*100)/100;
        }

        this.each(function(d) {
            var color = d3.rgb(d.data.color);
            text += [d.data.id, d.data.label, int2fract(color.r), int2fract(color.g), int2fract(color.b)].join(sep) + linesep;
        });
        return text;
    }
});

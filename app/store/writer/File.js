/**
 * Helper class to write the content from a variable into a local file.
 * The variable must be a string.
 *
 * Code lifted from http://html5-demos.appspot.com/static/a.download.html
 */
Ext.define('TrackAnnot.store.writer.File', {
    requires: ['Ext.XTemplate'],
    config: {
        /**
         * @cfg {String} data
         * The data to be written to file.
         */
        data: null,
        mime_type: 'text/plain',
        filename: 'myfile.csv',
        label: 'here',
        /**
         * @cfg {String/Ext.Template} tpl
         * An Template string to use to render the data download link.
         */
        tpl: '<a download="{filename}" draggable="true" data-downloadurl="{downloadurl}" target="_blank" href="{url}">{label}</a>'
    },
    constructor: function (config) {
        this.initConfig(config);
        this.callParent();
    },
    applyTpl: function(tpl) {
        if (typeof tpl === 'string' ) {
            tpl = Ext.create('Ext.Template', tpl);
        }
        return tpl;
    },
    getDownloadLink: function() {
        var blob = new Blob([this.data], {type: this.mime_type});
        var url = window.URL.createObjectURL(blob);
        var downloadurl = [this.mime_type, this.filename, url].join(':');
        var values = {
            filename: this.filename,
            label: this.label,
            url: url,
            downloadurl: downloadurl
        };
        return this.tpl.apply(values);
    }
});
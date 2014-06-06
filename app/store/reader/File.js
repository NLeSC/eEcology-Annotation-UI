/**
 * Helper class to read the content of a local file into a variable
 */
Ext.define('TrackAnnot.store.reader.File', {
    /**
     * @event load
     * Fires after a file has been read.
     * @param {String} content Content of file
     * @param {File} file
     * @param {TrackAnnot.store.reader.File} this
     */
    mixins: {
        observable: 'Ext.util.Observable'
    },
    constructor: function (config) {
        this.mixins.observable.constructor.call(this, config);
        this.addEvents('load');
    },

    /**
     * Read the filefield as text. Fires 'load' event when done.
     *
     * Show alert message box on error
     *
     * @param {Ext.form.field.file} component The file field
     */
    readAsText: function(component) {
        var theFile = this.getFirstFileFromFileField(component);
        this.readFileAsText(theFile);
    },
    readFileAsText: function(theFile) {
        var me = this;
        var reader = new FileReader();
        reader.onloadend = function(theFile) {
            if (reader.readyState == FileReader.DONE) {
                me.fireEvent('load', reader.result, theFile, this);
            } else {
                Ext.Msg.show({
                    title: 'Reading file failed',
                    msg: reader.error,
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.WARNING
                });
            }
        };
        reader.readAsText(theFile);
    },
    getFirstFileFromFileField: function(component) {
        var fileinput = component.extractFileInput();
        var files = fileinput.files;
        var f = files[0];
        return f;
    }
});
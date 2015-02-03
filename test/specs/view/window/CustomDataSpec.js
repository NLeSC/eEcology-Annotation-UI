/* Blob.js
 * A Blob implementation.
 * 2013-06-20
 *
 * By Eli Grey, http://eligrey.com
 * By Devin Samarin, https://github.com/eboyjr
 * License: X11/MIT
 *   See LICENSE.md
 */

/*global unescape */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/Blob.js/blob/master/Blob.js */

if ((typeof Blob !== "function" && typeof Blob !== "object") || (Blob && Blob.toString() === '[object BlobConstructor]'))
this.Blob = (function(view) {
    "use strict";

    var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || view.MSBlobBuilder || (function(view) {
        var
              get_class = function(object) {
                return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
            }
            , FakeBlobBuilder = function BlobBuilder() {
                this.data = [];
            }
            , FakeBlob = function Blob(data, type, encoding) {
                this.data = data;
                this.size = data.length;
                this.type = type;
                this.encoding = encoding;
            }
            , FBB_proto = FakeBlobBuilder.prototype
            , FB_proto = FakeBlob.prototype
            , FileReaderSync = view.FileReaderSync
            , FileException = function(type) {
                this.code = this[this.name = type];
            }
            , file_ex_codes = (
                  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
                + "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
            ).split(" ")
            , file_ex_code = file_ex_codes.length
            , real_URL = view.URL || view.webkitURL || view
            , real_create_object_URL = real_URL.createObjectURL
            , real_revoke_object_URL = real_URL.revokeObjectURL
            , URL = real_URL
            , btoa = view.btoa
            , atob = view.atob

            , ArrayBuffer = view.ArrayBuffer
            , Uint8Array = view.Uint8Array
        ;
        FakeBlob.fake = FB_proto.fake = true;
        while (file_ex_code--) {
            FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
        }
        if (!real_URL.createObjectURL) {
            URL = view.URL = {};
        }
        URL.createObjectURL = function(blob) {
            var
                  type = blob.type
                , data_URI_header
            ;
            if (type === null) {
                type = "application/octet-stream";
            }
            if (blob instanceof FakeBlob) {
                data_URI_header = "data:" + type;
                if (blob.encoding === "base64") {
                    return data_URI_header + ";base64," + blob.data;
                } else if (blob.encoding === "URI") {
                    return data_URI_header + "," + decodeURIComponent(blob.data);
                } if (btoa) {
                    return data_URI_header + ";base64," + btoa(blob.data);
                } else {
                    return data_URI_header + "," + encodeURIComponent(blob.data);
                }
            } else if (real_create_object_URL) {
                return real_create_object_URL.call(real_URL, blob);
            }
        };
        URL.revokeObjectURL = function(object_URL) {
            if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
                real_revoke_object_URL.call(real_URL, object_URL);
            }
        };
        FBB_proto.append = function(data/*, endings*/) {
            var bb = this.data;
            // decode data to a binary string
            if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
                var
                      str = ""
                    , buf = new Uint8Array(data)
                    , i = 0
                    , buf_len = buf.length
                ;
                for (; i < buf_len; i++) {
                    str += String.fromCharCode(buf[i]);
                }
                bb.push(str);
            } else if (get_class(data) === "Blob" || get_class(data) === "File") {
                if (FileReaderSync) {
                    var fr = new FileReaderSync;
                    bb.push(fr.readAsBinaryString(data));
                } else {
                    // async FileReader won't work as BlobBuilder is sync
                    throw new FileException("NOT_READABLE_ERR");
                }
            } else if (data instanceof FakeBlob) {
                if (data.encoding === "base64" && atob) {
                    bb.push(atob(data.data));
                } else if (data.encoding === "URI") {
                    bb.push(decodeURIComponent(data.data));
                } else if (data.encoding === "raw") {
                    bb.push(data.data);
                }
            } else {
                if (typeof data !== "string") {
                    data += ""; // convert unsupported types to strings
                }
                // decode UTF-16 to binary string
                bb.push(unescape(encodeURIComponent(data)));
            }
        };
        FBB_proto.getBlob = function(type) {
            if (!arguments.length) {
                type = null;
            }
            return new FakeBlob(this.data.join(""), type, "raw");
        };
        FBB_proto.toString = function() {
            return "[object BlobBuilder]";
        };
        FB_proto.slice = function(start, end, type) {
            var args = arguments.length;
            if (args < 3) {
                type = null;
            }
            return new FakeBlob(
                  this.data.slice(start, args > 1 ? end : this.data.length)
                , type
                , this.encoding
            );
        };
        FB_proto.toString = function() {
            return "[object Blob]";
        };
        return FakeBlobBuilder;
    }(view));

    var Blob = function(blobParts, options) {
        var type = options ? (options.type || "") : "";
        var builder = new BlobBuilder();
        if (blobParts) {
            for (var i = 0, len = blobParts.length; i < len; i++) {
                if (Uint8Array && blobParts[i] instanceof Uint8Array) {
                    builder.append(blobParts[i].buffer);
                }
                else {
                    builder.append(blobParts[i]);
                }
            }
        }
        var blob = builder.getBlob(type);
        if (!blob.slice && blob.webkitSlice) {
            blob.slice = blob.webkitSlice;
        }
        return blob;
    };
    var getPrototypeOf = Object.getPrototypeOf || function(object) {
        return object.__proto__;
    };
    Blob.prototype = getPrototypeOf(new Blob());
    return Blob;


}(this));

describe('TrackAnnot.view.window.CustomData', function() {
    'use strict';

    var instance = null, chart = null, esj = ExtSpec.Jasmine;

    beforeEach(function() {
        this.addMatchers(esj.Matchers);
        instance = ExtSpec.create("TrackAnnot.view.window.CustomData", function() {
            this.callParent = jasmine.createSpy('callParent');
            this.setTitle = function(title) {
                this.title = title;
            };
            this.columnStore = {
                columns: [],
                loadData: function(data) {
                    this.columns = data.map(function(d) {
                        return {data: d};
                    });
                },
                getAt: function(index) {
                    return this.columns[index];
                }
            };
            this.columnSelector = {
                store: this.columnStore,
                selected: '',
                on: jasmine.createSpy('on'),
                select: function(selection) {
                    this.selected = selection;
                },
                getSubmitValue: function() {
                    return this.selected.data.name;
                }
            };
            ExtSpec.Jasmine.createConfigSpies(this);

            this.getTrackStore = function() {
                return {
                    getTimeExtent: function() {
                        return [
                            new Date('2010-06-28T00:00:00.000Z'),
                            new Date('2010-06-29T00:00:00.000Z')
                        ];
                    },
                    getTrackerId: function() {
                        return "355";
                    }
                };
            };
        });
        chart =  jasmine.createSpyObj('chart', ['dateFocus', 'loadData']);

    });

    describe('initComponent', function() {
        var creations = {}, trackStore;

        beforeEach(function() {
            Ext.create = function(name, config) {
                var mock = jasmine.createSpyObj(name, ['on']);
                creations[name] = {config: config, mock: mock};
                return mock;
            };
            trackStore = jasmine.createSpyObj('Track', ['on']);
            instance.getTrackStore = function() {
                return trackStore;
            };

            instance.initComponent();
        });

        it('should create chart item', function() {
            expect(instance.items[0]).toEqual(creations['TrackAnnot.view.Metric.CustomData'].mock);
        });

        it('should populate chart on combo change', function() {
            expect(creations['Ext.form.field.ComboBox'].mock.on).toHaveBeenCalledWith('select', instance.onColumnSelect, instance);
        });

        it('should populate chart on track store load', function() {
            expect(trackStore.on).toHaveBeenCalledWith('load', instance.populateChart, instance);
        });
    });

    describe('dateFocus function', function() {
        var current;

        beforeEach(function() {
            instance.chart = chart;
            current = new Date();
        });

        it('should call dateFocus on chart', function() {
            instance.dateFocus(current);

            expect(chart.dateFocus).toHaveBeenCalledWith(current);
        });

        it('should not call dateFocus on chart when source is self', function() {
            instance.dateFocus(current, instance);

            expect(chart.dateFocus).not.toHaveBeenCalled();
        });
    });

    describe('onFileFieldChange function', function() {
        beforeEach(function() {
            var parts = ['device_info_serial,date_time,gpstrend\n355,2010-06-28T00:02:46.000Z,42\n'];
            var file = new Blob(parts, {type: 'text/csv'});
            file.name = 'mydata.csv';
            var fileField = {
                    button: {
                        fileInputEl: {
                            dom: {
                                files: [file]
                            }
                        }
                    }
            };
            instance.fileField = fileField;
            spyOn(d3, 'csv');

            instance.onFileFieldChange();
        });

        it('should set title of window to filename', function() {
            expect(instance.title).toEqual('mydata.csv');
        });

        it('should call d3.csv with accessor and binded callback', function() {
            expect(d3.csv).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Function));
        });
    });

    describe('loadData', function() {
        var input;
        beforeEach(function() {
            instance.chart = chart;
            input = [{
                device_info_serial: '355',
                date_time: '2010-06-28T00:02:46.000Z',
                gpstrend: '42',
                score: '1',
                label: 'fly'
            }, {
                device_info_serial: '355',
                date_time: '2010-06-28T11:02:46.000Z',
                gpstrend: '1234',
                score: '2',
                label: 'fly'
            }, {
                device_info_serial: '1234',
                date_time: '2010-06-28T08:02:46.000Z',
                gpstrend: 1234,
                score: '2',
                label: 'fly'
            }, {
                device_info_serial: '355',
                date_time: '2014-01-01T00:00:00.000Z',
                gpstrend: '1234',
                score: '2',
                label: 'fly'
            }];

            instance.loadData(input);
        });

        it('should populate column selector', function() {
            expect(instance.columnStore.columns).toEqual([{
                data: {name: 'gpstrend'}
            }, {
                data: {name: 'score'}
            }]);
        });

        it('should select first column', function() {
            expect(instance.columnSelector.getSubmitValue()).toEqual('gpstrend');
        });

        it('should call chart.loadData() with srcubbed data', function() {
            var expected = [{
                device_info_serial: 355,
                date_time: new Date('2010-06-28T00:02:46.000Z'),
                gpstrend: 42,
                score: 1
            }, {
                device_info_serial: 355,
                date_time: new Date('2010-06-28T11:02:46.000Z'),
                gpstrend: 1234,
                score: 2
            }];
            expect(chart.loadData).toHaveBeenCalledWith(expected, 'gpstrend');
        });
    });

    describe('onColumnSelect function', function() {
        beforeEach(function() {
            instance.chart = chart;
            instance.filename = 'mydata.csv';
            instance.rawData = [{
                device_info_serial: 355,
                date_time: new Date('2010-06-28T00:02:46.000Z'),
                gpstrend: 42,
                score: 1
            }, {
                device_info_serial: 355,
                date_time: new Date('2010-06-28T11:02:46.000Z'),
                gpstrend: 1234,
                score: 2
            }, {
                device_info_serial: 1234,
                date_time: new Date('2010-06-28T08:02:46.000Z'),
                gpstrend: 1234,
                score: 2
            }, {
                device_info_serial: 355,
                date_time: new Date('2014-01-01T00:00:00.000Z'),
                gpstrend: 1234,
                score: 2
            }];

            var selection = {data: {name: 'score'}};
            instance.columnSelector.select(selection);

            instance.onColumnSelect(instance.columnSelector, [selection]);
        });

        it('should set title of window to "filename - selected column', function() {
            expect(instance.title).toEqual('mydata.csv - score');
        });

        it('should call chart.loadData() with filtered data', function() {
            var expected = [{
                device_info_serial: 355,
                date_time: new Date('2010-06-28T00:02:46.000Z'),
                gpstrend: 42,
                score: 1
            }, {
                device_info_serial: 355,
                date_time: new Date('2010-06-28T11:02:46.000Z'),
                gpstrend: 1234,
                score: 2
            }];
            expect(chart.loadData).toHaveBeenCalledWith(expected, 'score');
        });
    });
});

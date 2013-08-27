/*!
Ext Spec 1.3.1
Copyright © Qube 2012-2013
http://extspec.codeplex.com/

This library may be used under the terms of the Apache License 2.0 (Apache).
Please see License.txt accompanying this file for more information.
!*/
var ExtSpec;
(function (ExtSpec) {
    ExtSpec.global = ((function () {
        return this;
    })());
})(ExtSpec || (ExtSpec = {}));

/**
* Core Ext Spec module.
*/
var ExtSpec;
(function (ExtSpec) {
    'use strict';

    var resourceConfigs, shortTypes;

    /**
    * Returns true if the given value is found in the array, otherwise false.
    * @param {Object[]} list The list of items to match.
    * @param {Object} value The item to match against the list.
    * @returns {Boolean}
    */
    function arrayMatcher(list, value) {
        if (list instanceof Array) {
            return list.indexOf(value) >= 0;
        }

        return false;
    }

    /**
    * Returns true if the given value or alias is found in the array, otherwise false.
    * @param {Object[]} list The list of items to match.
    * @param {Object} value The item or alias to match against the list.
    * @returns {Boolean}
    */
    function aliasMatcher(list, value) {
        if (list instanceof Array) {
            return list.some(function (item) {
                return item === value || item.indexOf(value + '@') === 0;
            });
        }

        return false;
    }

    /**
    * Returns true if the given name is found in the array of ref objects, otherwise false.
    * @param {Object[]} list The list of ref objects to match.
    * @param {String} value The ref name to match against the list.
    * @returns {Boolean}
    */
    function refMatcher(list, value) {
        var i, len, item;

        if (list instanceof Array) {
            for (i = 0, len = list.length; i < len; i += 1) {
                item = list[i];

                if (item && item.ref === value) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
    * Returns true if the given key is found in the object, otherwise false.
    * @param {Object} object The object to match.
    * @param {String} name The key to find in the object.
    * @returns {Boolean}
    */
    function objectMatcher(object, key) {
        return object && object.hasOwnProperty(key);
    }

    /**
    * Wraps the console in a mutable object.
    */
    (function (ConsoleWrapper) {
        var c;

        if (ExtSpec.global.console) {
            c = ExtSpec.global.console;
        } else {
            c = {
                log: function () {
                    return;
                }
            };
        }

        function log() {
            return c.log.apply(c, arguments);
        }
        ConsoleWrapper.log = log;

        function warn() {
            var fn = c.warn || c.log;

            return fn.apply(c, arguments);
        }
        ConsoleWrapper.warn = warn;
    })(ExtSpec.ConsoleWrapper || (ExtSpec.ConsoleWrapper = {}));
    var ConsoleWrapper = ExtSpec.ConsoleWrapper;

    /**
    * Class for resource configurations.
    */
    var ResourceConfig = (function () {
        /**
        * Creates a new instance of the ResourceConfig class.
        * @param {String} property The resource type's property name.
        * @param {String} [suffix] The resource type's getter suffix.
        * @param {Function} [matcher] The resource type's matcher function. Defaults to valueMatcher if not defined.
        * @param {String} [itemProperty] The item property to match against if not the item itself.
        * @property {String} property The resource type's property name.
        * @property {String} suffix The resource type's getter suffix.
        * @property {Function} matcher The resource type's matcher function.
        * @property {String} itemProperty The item property to match against if not the item itself.
        */
        function ResourceConfig(property, suffix, matcher, itemProperty) {
            this.property = property;
            this.suffix = suffix;
            this.matcher = matcher || arrayMatcher;
            this.itemProperty = itemProperty;
        }
        return ResourceConfig;
    })();
    ExtSpec.ResourceConfig = ResourceConfig;

    resourceConfigs = {
        'md': new ResourceConfig('models', 'Model', aliasMatcher),
        'vw': new ResourceConfig('views', 'View', aliasMatcher),
        'ct': new ResourceConfig('controllers', 'Controller', aliasMatcher),
        'st': new ResourceConfig('stores', 'Store', aliasMatcher),
        'rf': new ResourceConfig('refs', undefined, refMatcher, 'ref'),
        'rq': new ResourceConfig('requires'),
        'cf': new ResourceConfig('config', undefined, objectMatcher)
    };

    shortTypes = {
        'st': 'string',
        'nm': 'number',
        'nn': 'nan',
        'in': 'infinity',
        'bl': 'boolean',
        'un': 'undefined',
        'nl': 'null',
        'ob': 'object',
        'dt': 'date',
        'fn': 'function',
        'ar': 'array',
        'rg': 'regexp'
    };

    /**
    * Returns the object type of the given value as mixed case string.
    * @param {Object} value Any value of any type.
    * @returns {String}
    */
    function typeOfObject(value) {
        if (value === null) {
            return 'Null';
        }

        if (value === undefined) {
            return 'Undefined';
        }

        return Object.prototype.toString.call(value).slice(8, -1);
    }
    ExtSpec.typeOfObject = typeOfObject;

    /**
    * Returns either the primitive or object type of a given value as a lower cased string. Includes number variants.
    * @param {Object} value Any value of any type.
    * @returns {String}
    */
    function typeOf(value) {
        if (value === null) {
            return 'null';
        }

        var type = typeof value;

        if (type === 'number') {
            if (isNaN(value)) {
                return 'nan';
            }

            if (!isFinite(value)) {
                return 'infinity';
            }
        }

        if (type === 'object' || type === 'function') {
            return ExtSpec.typeOfObject(value).toLowerCase();
        }

        return type;
    }
    ExtSpec.typeOf = typeOf;

    /**
    * Returns true if the primitive or complex type of a given value matches the comparison type, otherwise false.
    * @param {Object} value Any value of any type.
    * @param {String} compare The object type to compare as a lowercase string. Also accepts the following two character abbreviations:
    *     ar: array,
    *     bl: boolean,
    *     dt: date,
    *     fn: function,
    *     in: infinity,
    *     nl: null,
    *     nm: number,
    *     nn: nan,
    *     ob: object,
    *     rg: regexp,
    *     st: string,
    *     un: undefined
    * @returns {Boolean}
    */
    function isTypeOf(value, compare) {
        var type = ExtSpec.typeOf(value);

        return type === (shortTypes[compare] || compare);
    }
    ExtSpec.isTypeOf = isTypeOf;

    /**
    * Returns true if a given value is an object type and is not null, otherwise false.
    * @param {Object} value Any value of any type.
    * @returns {Boolean}
    */
    function isObjectType(value) {
        var type = typeof value;

        return value !== null && (type === 'object' || type === 'function');
    }
    ExtSpec.isObjectType = isObjectType;

    /**
    * Compares two objects, returning true if all the keys in the second object have equal values in the first.
    * @param {Object} value An object to compare.
    * @param {Object} match An object containing key value pairs to match.
    * @returns {Boolean}
    */
    function objectKeysMatch(value, match) {
        var key;

        for (key in match) {
            if (match.hasOwnProperty(key)) {
                if (!value.hasOwnProperty(key) || match[key] !== value[key]) {
                    return false;
                }
            }
        }

        return true;
    }
    ExtSpec.objectKeysMatch = objectKeysMatch;

    /**
    * Copies properties to the destination object from the source.
    * @param {Object} destination The destination object.
    * @param {Object} source The source object.
    * @param {String[]} [except] The properties to skip, or undefined to skip none.
    */
    function apply(destination, source, except) {
        var key, skip;

        if (!ExtSpec.isObjectType(destination)) {
            throw new Error('The destination argument must be an object type.');
        }

        if (!ExtSpec.isObjectType(source)) {
            throw new Error('The source argument must be an object type.');
        }

        for (key in source) {
            if (source.hasOwnProperty(key) && (!except || except.indexOf(key) < 0)) {
                destination[key] = source[key];
            }
        }
    }
    ExtSpec.apply = apply;

    /**
    * Ensures that each object in a namespace exists, and creates it if it does not. Returns the final object in the chain.
    * @param {String} namespace The namespace to assign using dot notation.
    * @param {Object} [root] The root object to attach the namespace. Will default to the global object if omitted.
    * @returns {Object}
    */
    function ensureNamespace(namespace, root) {
        if (!ExtSpec.isTypeOf(namespace, 'st') || namespace.length < 1) {
            throw new Error('The namespace parameter must be a non empty string.');
        }

        if (root && !ExtSpec.isObjectType(root)) {
            throw new Error('The root parameter must be of an object type if supplied.');
        }

        var object = root || ExtSpec.global, keys = namespace.split('.'), key, i, len;

        for (i = 0, len = keys.length; i < len; i += 1) {
            key = keys[i];

            if (!ExtSpec.isObjectType(object[key])) {
                object[key] = Object(object[key]);
            }

            object = object[key];
        }

        return object;
    }
    ExtSpec.ensureNamespace = ensureNamespace;

    /**
    * Adds a warning to the browser console.
    * @param {String} warning The warning message to output to the console.
    */
    function warn(warning) {
        warning = 'Ext Spec Warning: ' + warning;

        ConsoleWrapper.warn(warning);
    }
    ExtSpec.warn = warn;

    /**
    * Marks a method as obsolete and logs it to the console.
    * @param {String|Object} arg The method name or configuration argument.
    */
    function obsolete(arg) {
        var fqn, message, config;

        if (!ExtSpec.isTypeOf(arg, 'st')) {
            config = arg;
        } else {
            config = {
                method: arg
            };
        }

        fqn = config.namespace ? config.namespace + '.' + config.method : config.method;
        message = '"' + fqn + '" is obsolete' + (config.message ? ': ' + config.message : '.');

        ConsoleWrapper.warn(message);
    }
    ExtSpec.obsolete = obsolete;

    /**
    * Gets the static resource handling configuration for the given type.
    * @param {String} type A double character string representing a type. The following values are supported:
    *     md: model,
    *     vw: view,
    *     ct: controller,
    *     st: store,
    *     rf: ref,
    *     rq: require
    *     cf: config
    * @returns {Object}
    */
    function getResourceConfig(type) {
        if (!resourceConfigs.hasOwnProperty(type)) {
            throw new Error('Unsupported type "' + type + '".');
        }

        return resourceConfigs[type];
    }
    ExtSpec.getResourceConfig = getResourceConfig;

    /**
    * Retrieves the configuration object from an XTemplate array.
    * @param {Object} instance The object instance in which to find the tpl.
    * @returns {Object} The configuration object.
    */
    function getTplConfig(instance) {
        if (!isObjectType(instance)) {
            throw new Error('The instance argument is undefined or not an object.');
        }

        var tpl = instance && instance.tpl, config;

        if (isTypeOf(tpl, 'ar')) {
            config = tpl[tpl.length - 1];

            if (isObjectType(config)) {
                return config;
            }

            throw new Error('The last element of the "tpl" array is not a configuration object.');
        }

        throw new Error('The "tpl" property must be an array.');
    }
    ExtSpec.getTplConfig = getTplConfig;

    /**
    * Escapes a string to be used in a regular expression pattern.
    * @param {String} value The string to be escaped.
    * @returns {String} The escaped string.
    */
    function regExpEscape(value) {
        return value && value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    ExtSpec.regExpEscape = regExpEscape;
})(ExtSpec || (ExtSpec = {}));
var ExtSpec;
(function (ExtSpec) {
    /**
    * Module for capturing and reconstituting Ext JS class definitions.
    */
    (function (ClassManager) {
        'use strict';

        var configurations = {}, callbacks = {};

        /**
        * Sets an Ext JS class definition.
        * @param {String} className The class name to set.
        * @param {Object|Function} configuration The Ext JS class definition as an object or function.
        * @param {Function} [callback] The callback function.
        */
        function set(className, configuration, callback) {
            if (!ExtSpec.isTypeOf(className, 'st')) {
                throw new Error('Class name argument must be a string.');
            }

            configurations[className] = configuration;

            if (ExtSpec.isTypeOf(callback, 'fn')) {
                callbacks[className] = callback;
            }
        }
        ClassManager.set = set;

        /**
        * Gets an Ext JS class definition.
        * @param {String} className The class name to get.
        * @returns {Object}
        */
        function get(className) {
            if (!configurations.hasOwnProperty(className)) {
                throw new Error('The class named "' + className + '" could not be found.');
            }

            return configurations[className];
        }
        ClassManager.get = get;

        /**
        * Builds a constructor for the given class.
        * @param {String} className The class name to construct.
        * @param {Function} [preConstruct] The function to apply to the instance before a custom constructor.
        * @returns {Function}
        */
        function construct(className, preConstruct) {
            var configuration = ClassManager.get(className), ctor = function () {
                if (ExtSpec.isTypeOf(preConstruct, 'fn')) {
                    preConstruct.call(this, ctor);
                }

                return this.constructor.apply(this, arguments);
            };

            if (ExtSpec.isTypeOf(configuration, 'fn')) {
                configuration = configuration(ctor);

                if (configuration.hasOwnProperty('override')) {
                    throw new Error('Function form cannot be used for overrides (EXTJSIV-7805).');
                }
            }

            if (!ExtSpec.isObjectType(configuration)) {
                throw new Error('The definition for "' + className + '" must be an object type.');
            }

            if (!configuration.hasOwnProperty('constructor')) {
                configuration.constructor = function () {
                    return this;
                };
            }

            if (configuration.statics) {
                ExtSpec.apply(ctor, configuration.statics);
            }

            if (configuration.inheritableStatics) {
                ExtSpec.apply(ctor, configuration.inheritableStatics);
            }

            ExtSpec.apply(ctor.prototype, configuration, ['statics', 'inheritableStatics']);
            ctor.prototype.self = ctor;

            return ctor;
        }
        ClassManager.construct = construct;

        /**
        * Creates and returns a new instance of the given class.
        * @param {String} className The class name to instantiate.
        * @param {Function} [preConstruct] The function to apply to the instance before a custom constructor.
        * @returns {Object}
        */
        function create(className, preConstruct) {
            var Constructor = ClassManager.construct(className, preConstruct);

            return new Constructor();
        }
        ClassManager.create = create;

        /**
        * Gets the callback function passed to Ext.define.
        * @param {String} className The class name of the callback to get.
        * @returns {Function}
        */
        function callback(className) {
            if (!callbacks.hasOwnProperty(className)) {
                throw new Error('The class named "' + className + '" was not defined with a callback.');
            }

            return callbacks[className];
        }
        ClassManager.callback = callback;
    })(ExtSpec.ClassManager || (ExtSpec.ClassManager = {}));
    var ClassManager = ExtSpec.ClassManager;
})(ExtSpec || (ExtSpec = {}));

var ExtSpec;
(function (ExtSpec) {
    ExtSpec.create = ExtSpec.ClassManager.create;
})(ExtSpec || (ExtSpec = {}));

/**
* Mock Ext module.
*/
var Ext;
(function (Ext) {
    var realDefine = Ext.define;

    /**
    * Sets an Ext JS class definition.
    * @param {String} className The class name to set.
    * @param {Object|Function} configuration The Ext JS class definition as an object or function.
    * @param {Function} [callback] The callback function.
    */
    function innerDefine(className, configuration, callback) {
        ExtSpec.ClassManager.set.call(this, className, configuration, callback);

        if (realDefine) {
            return realDefine.call(this, className, configuration, callback);
        }
    }

    Object.defineProperty(Ext, 'define', {
        get: function () {
            return innerDefine;
        },
        set: function (value) {
            ExtSpec.warn('An attempt was made to replace Ext Spec\'s version of Ext.define. It is not recommended to use the real Ext JS library with Ext Spec. Both versions will now be executed.');
            realDefine = value;
        }
    });
})(Ext || (Ext = {}));
var ExtSpec;
(function (ExtSpec) {
    /**
    * Module for Jasmine specific helpers.
    */
    (function (Jasmine) {
        'use strict';

        /**
        * Discerns the action to execute on a spy from the given value.
        * @param {Object} value The value to analyze.
        * @returns {String}
        */
        function selectSpyAction(value) {
            switch (ExtSpec.typeOf(value)) {
                case 'function':
                    return 'fake';
                case 'array':
                    return 'spy';
                case 'undefined':
                    return 'none';
            }

            return 'return';
        }

        /**
        * Configures a spy using the provided details.
        * @param {jasmine.Spy} spy The spy to configure.
        * @param {Object} config The configuration for the spy.
        */
        function configureSpy(target, name, config) {
            var value = config.value, action = config.action || selectSpyAction(value), spy = target[name], newTarget;

            switch (action) {
                case 'return':
                    spy.andReturn(value);
                    break;
                case 'spy':
                    newTarget = {};
                    processSpies(newTarget, value);
                    spy.andReturn(newTarget);
                    break;
                case 'fake':
                    spy.andCallFake(value);
                    break;
                case 'call':
                    spy.andCallThrough();
                    break;
                case 'fluent':
                    spy.andReturn(target);
                    break;
            }
        }

        /**
        * Processes a single spy.
        * @param {Object} target The target on which to attach the spy.
        * @param {Object|String} config The spy name as a string or configuration object.
        */
        function processSpy(target, arg) {
            var name, hasConfig, config;

            if (ExtSpec.isTypeOf(arg, 'st')) {
                name = arg.toString();
            } else if (ExtSpec.isObjectType(arg)) {
                config = arg;
                name = config.name;
                hasConfig = true;

                switch (config.action) {
                    case 'object':
                        target[name] = {};
                        processSpies(target[name], config.value);
                        return;
                    case 'property':
                        target[name] = config.value;
                        return;
                }
            } else {
                return;
            }

            if (!ExtSpec.isTypeOf(target[name], 'fn')) {
                // the target is not a function, so assign it to a new spy
                target[name] = jasmine.createSpy(name);
            } else if (!target[name].isSpy) {
                // the target is a function but not a spy, so spy on it
                spyOn(target, name);
            }

            if (hasConfig) {
                configureSpy(target, name, config);
            }
        }

        /**
        * Processes an array of spy configurations and attaches them to a target object.
        * @param {Object} target The target on which to attach the spies.
        * @param {Object[]} spies The list of spies to attach to the target as strings, configuration objects or a combination of both.
        */
        function processSpies(target, spies) {
            if (!ExtSpec.isObjectType(target)) {
                throw new Error('The target parameter must be of an object type.');
            }

            var i, len;

            if (ExtSpec.isTypeOf(spies, 'ar')) {
                for (i = 0, len = spies.length; i < len; i += 1) {
                    processSpy(target, spies[i]);
                }
            }
        }

        /**
        * Concatenates the parts of an accessor name.
        * @param {String} current The current appended parts.
        * @param {String} next The next part to append.
        * @returns {String}
        */
        function accessorReducer(current, next) {
            return current + next.slice(0, 1).toUpperCase() + next.slice(1);
        }

        /**
        * Creates and returns a jasmine spy on the given instance with the provided name and suffix.
        * @param {Object} instance The instance on which to create the spy.
        * @param {String} name The name to build into a spy.
        * @param {String} [suffix] The suffix to append to the spy.
        * @param {String} [prefix] The prefix to append to the spy name. Defaults to "get".
        * @returns {Function}
        */
        function createSpy(instance, name, suffix, prefix) {
            suffix = suffix || '';
            prefix = prefix || 'get';

            var separator = name.indexOf('@'), accessorName = separator > 0 ? name.slice(0, separator) : name, accessor;

            accessorName = accessorName.split('.').reduce(accessorReducer, prefix) + suffix;

            if (accessorName in instance) {
                throw new Error('An accessor spy for "' + name + '" cannot be created because "' + accessorName + '" already exists.');
            }

            accessor = instance[accessorName] = jasmine.createSpy(accessorName);

            return accessor;
        }

        /**
        * Creates and returns a jasmine spy on the given instances with the provided name and type.
        * @param {Object} instance The instance on which to create the spy.
        * @param {String} name The name to build into a getter.
        * @param {String} type A single character representing the type of getter spies to create.
        * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
        * @param {String} [prefix] The prefix to append to the spy name. Defaults to "get".
        * @returns {Function}
        */
        function createAccessorSpy(instance, name, type, spies, prefix) {
            var config = ExtSpec.getResourceConfig(type), list = instance && instance[config.property], spy, target;

            if (config.matcher(list, name)) {
                spy = createSpy(instance, name, config.suffix, prefix);

                if (spies) {
                    target = {};
                    processSpies(target, spies);
                    spy.andReturn(target);
                }

                return spy;
            }

            throw new Error('The ' + config.property + ' property for this class does not contain the item "' + name + '".');
        }

        /**
        * Creates all spies on the given instance of the provided type.
        * @param {Object} instance The object on which to create the spies.
        * @param {String} type A single character representing the type of getter spies to create.
        * @param {String[]} list The list of items to spy, or undefined to create spies for all of the given type in the instance.
        */
        function createAccessorSpies(instance, type, list) {
            var config, i, len, name;

            if (ExtSpec.isTypeOf(list, 'ar')) {
                for (i = 0, len = list.length; i < len; i += 1) {
                    name = list[i];
                    createAccessorSpy(instance, name, type);
                }
            } else {
                config = ExtSpec.getResourceConfig(type);
                list = instance && instance[config.property];

                if (ExtSpec.isTypeOf(list, 'ar')) {
                    for (i = 0, len = list.length; i < len; i += 1) {
                        name = config.itemProperty ? list[i][config.itemProperty] : list[i];
                        createSpy(instance, name, config.suffix);
                    }
                }
            }
        }

        /**
        * Creates getter spies for all models defined in the given instance.
        * @param {Object} instance The object on which to create the spies.
        * @param {String[]} [models] The list of models to spy, or undefined to create spies for all models in the instance.
        */
        function createModelSpies(instance, models) {
            createAccessorSpies(instance, 'md', models);
        }
        Jasmine.createModelSpies = createModelSpies;

        /**
        * Creates a getter spy for the given model defined in the instance.
        * @param {Object} instance The object on which to create the spy.
        * @param {String} name The model name to build into a getter.
        * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
        * @returns {Function}
        */
        function createModelSpy(instance, name, spies) {
            return createAccessorSpy(instance, name, 'md', spies);
        }
        Jasmine.createModelSpy = createModelSpy;

        /**
        * Creates getter spies for all views defined in the given instance.
        * @param {Object} instance The object on which to create the spies.
        * @param {String[]} [views] The list of views to spy, or undefined to create spies for all views in the instance.
        */
        function createViewSpies(instance, views) {
            createAccessorSpies(instance, 'vw', views);
        }
        Jasmine.createViewSpies = createViewSpies;

        /**
        * Creates a getter spy for the given view defined in the instance.
        * @param {Object} instance The object on which to create the spy.
        * @param {String} name The view name to build into a getter.
        * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
        * @returns {Function}
        */
        function createViewSpy(instance, name, spies) {
            return createAccessorSpy(instance, name, 'vw', spies);
        }
        Jasmine.createViewSpy = createViewSpy;

        /**
        * Creates getter spies for all controllers defined in the given instance.
        * @param {Object} instance The object on which to create the spies.
        * @param {String[]} [controllers] The list of controllers to spy, or undefined to create spies for all controllers in the instance.
        */
        function createControllerSpies(instance, controllers) {
            createAccessorSpies(instance, 'ct', controllers);
        }
        Jasmine.createControllerSpies = createControllerSpies;

        /**
        * Creates a getter spy for the given controller defined in the instance.
        * @param {Object} instance The object on which to create the spy.
        * @param {String} name The controller name to build into a getter.
        * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
        * @returns {Function}
        */
        function createControllerSpy(instance, name, spies) {
            return createAccessorSpy(instance, name, 'ct', spies);
        }
        Jasmine.createControllerSpy = createControllerSpy;

        /**
        * Creates getter spies for all stores defined in the given instance.
        * @param {Object} instance The object on which to create the spies.
        * @param {String[]} [stores] The list of stores to spy, or undefined to create spies for all stores in the instance.
        */
        function createStoreSpies(instance, stores) {
            createAccessorSpies(instance, 'st', stores);
        }
        Jasmine.createStoreSpies = createStoreSpies;

        /**
        * Creates a getter spy for the given store defined in the instance.
        * @param {Object} instance The object on which to create the spy.
        * @param {String} name The store name to build into a getter.
        * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
        * @returns {Function}
        */
        function createStoreSpy(instance, name, spies) {
            return createAccessorSpy(instance, name, 'st', spies);
        }
        Jasmine.createStoreSpy = createStoreSpy;

        /**
        * Creates getter spies for all refs defined in the given instance.
        * @param {Object} instance The object on which to create the spies.
        * @param {String[]} [refs] The list of refs to spy, or undefined to create spies for all refs in the instance.
        */
        function createRefSpies(instance, refs) {
            createAccessorSpies(instance, 'rf', refs);
        }
        Jasmine.createRefSpies = createRefSpies;

        /**
        * Creates a getter spy for the given ref defined in the instance.
        * @param {Object} instance The object on which to create the spy.
        * @param {String} name The ref name to build into a getter.
        * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
        * @returns {Function}
        */
        function createRefSpy(instance, name, spies) {
            return createAccessorSpy(instance, name, 'rf', spies);
        }
        Jasmine.createRefSpy = createRefSpy;

        /**
        * Creates accessor spies for all configs defined in the given instance.
        * @param {Object} instance The object on which to create the spies.
        * @param {String[]} [configs] The list of configs to spy, or undefined to create spies for all configs in the instance.
        */
        function createConfigSpies(instance, configs) {
            var name, i, len;

            if (ExtSpec.isTypeOf(configs, 'ar')) {
                for (i = 0, len = configs.length; i < len; i += 1) {
                    name = configs[i];
                    createAccessorSpy(instance, name, 'cf', null, 'set');
                    createAccessorSpy(instance, name, 'cf');
                }
            } else {
                for (name in instance.config) {
                    if (instance.config.hasOwnProperty(name)) {
                        createSpy(instance, name, null, 'set');
                        createSpy(instance, name);
                    }
                }
            }
        }
        Jasmine.createConfigSpies = createConfigSpies;

        /**
        * Creates accessor spies for the given config defined in the instance.
        * @param {Object} instance The object on which to create the spy.
        * @param {String} name The config name to build into a getter and setter.
        * @param {Object[]} [spies] The list of spies to attach to the getter return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
        * @returns {Function}
        */
        function createConfigSpy(instance, name, spies) {
            createSpy(instance, name, null, 'set');

            return createAccessorSpy(instance, name, 'cf', spies);
        }
        Jasmine.createConfigSpy = createConfigSpy;

        /**
        * Creates an object and attaches spies using the given configuration.
        * @param {Object[]} spies The list of spies to attach either as strings, configuration objects or a combination of both. See spyOnObject for more details.
        * @returns {Object}
        */
        function createSpyObject(spies) {
            var target = {};

            processSpies(target, spies);

            return target;
        }
        Jasmine.createSpyObject = createSpyObject;

        /**
        * Creates spies on an object that automatically return the root object for method chaining.
        * @param {String} baseName The name of spy the class.
        * @param {String[]} spies The array of method names to make spies.
        */
        function createFluentSpyObject(baseName, spies) {
            var i, len, fluent = jasmine.createSpyObj(baseName, spies);

            for (i = 0, len = spies.length; i < len; i += 1) {
                fluent[spies[i]].andReturn(fluent);
            }

            return fluent;
        }
        Jasmine.createFluentSpyObject = createFluentSpyObject;

        /**
        * Spies on methods within the target object, or creates them if they don't already exist.
        * @param {Object} target The target on which to assign the spies.
        * @param {Object[]} spies The list of spies to attach either as strings, configuration objects or a combination of both. Configurations must contain a name and an optional value and / or action in the form:
        * {
        *     name: 'methodName',
        *     value: ['subMethod1', 'subMethod2'],
        *     action: 'spy'
        * }
        *
        * Supported actions are:
        *     call: equivalent of andCallThrough(),
        *     fake: equivalent of andCallFake(),
        *     spy: equivalent of andReturn(jasmine.createSpyObj()),
        *     return: equivalent of andReturn(),
        *     object: equivalent of target[name] = jasmine.createSpyObj(),
        *     property: equivalent of target[name] = value,
        *     fluent: equivalent of andReturn(target),
        *     none: do nothing
        *
        * If unspecified, the return action is assumed unless the value is a:
        *     function: assume fake,
        *     array: assume spy,
        *     undefined: assume none
        */
        function spyOnObject(target, spies) {
            processSpies(target, spies);
        }
        Jasmine.spyOnObject = spyOnObject;

        /**
        * Spies on methods within the given namespace, or creates them if they don't already exist.
        * @param {String} namespace The namespace (using dot notation) on which to assign the spies.
        * @param {Object[]} spies The list of spies to attach either as strings, configuration objects or a combination of both. See spyOnObject for more details.
        * @returns {Object}
        */
        function spyOnNamespace(namespace, spies) {
            var target = ExtSpec.ensureNamespace(namespace);

            processSpies(target, spies);

            return target;
        }
        Jasmine.spyOnNamespace = spyOnNamespace;

        /**
        * Fetches the return value assigned to a spy as part of a chain.
        * @param {Object} instance The object instance that contains spies.
        * @param {String} chain The method chain using dot notation but without parens.
        * @returns {Object}
        */
        function getSpyReturn(instance, chain) {
            var names = chain.split('.'), value = instance, name, len, i;

            for (i = 0, len = names.length; i < len; i += 1) {
                name = names[i];

                if (!value.hasOwnProperty(name)) {
                    throw new Error(name + ' could not be found on the instance.');
                }

                value = value[name];

                if (value && value.isSpy) {
                    value = value.plan();
                }
            }

            return value;
        }
        Jasmine.getSpyReturn = getSpyReturn;
    })(ExtSpec.Jasmine || (ExtSpec.Jasmine = {}));
    var Jasmine = ExtSpec.Jasmine;
})(ExtSpec || (ExtSpec = {}));
var ExtSpec;
(function (ExtSpec) {
    (function (Jasmine) {
        /**
        * Matchers for Jasmine.
        */
        (function (Matchers) {
            'use strict';

            /**
            * Test if the expectation's actual value contains a name of the given type, and sets an appropriate message if it is not found.
            * @param {jasmine.ExpectationResult} expectation The expectation to test.
            * @param {String} name The name to find in the expectation's actual value.
            * @param {String} type A single character representing the type to find.
            * @returns {Boolean}
            */
            function hasItem(expectation, name, type) {
                var config = ExtSpec.getResourceConfig(type), list = expectation.actual && expectation.actual[config.property];

                return config.matcher(list, name);
            }

            /**
            * Tests if the expectations's actual value extends or overrides a specific class.
            * @param {jasmine.ExpectationResult} expectation The expectation to test.
            * @param {String} name The class name to match against the actual value.
            * @param {String} property The property name to match against the name.
            * @returns {Boolean}
            */
            function isExtension(expectation, name, property) {
                var actual = expectation.actual;

                if (ExtSpec.isTypeOf(actual, 'fn')) {
                    actual = actual.prototype;
                }

                return actual && actual[property] === name;
            }

            /**
            * Tests if a spy's arguments match the provided event configuration.
            * @param {Object} config The event configuration.
            * @returns {Boolean}
            */
            function listenedMatcher(config) {
                if (!(config.actual && config.actual.isSpy)) {
                    throw new Error('Expected ' + jasmine.pp(config.actual) + ' to be a spy.');
                }

                var actual = config.actual, key, eventMap, listener, expected, i, len, args, arg = config.isManaged ? 1 : 0;

                if (!ExtSpec.isTypeOf(config.expected, 'st')) {
                    expected = config.expected;
                } else {
                    expected = {
                        event: config.expected
                    };
                }

                for (i = 0, len = actual.calls.length; i < len; i += 1) {
                    args = actual.calls[i].args;
                    eventMap = args[arg];

                    if (ExtSpec.isTypeOf(eventMap, 'st')) {
                        key = eventMap;
                        eventMap = {};
                        eventMap[key] = args[arg + 1];
                    }

                    if (eventMap.hasOwnProperty(expected.event)) {
                        if (!expected.listener) {
                            return true;
                        }

                        listener = eventMap[expected.event];

                        if ((listener.fn || listener) === expected.listener) {
                            return true;
                        }
                    }
                }

                return false;
            }

            /**
            * Passes the expectation if the given model name is found.
            * @param {String} modelName The model name to find.
            * @returns {Boolean}
            */
            function toHaveModel(modelName) {
                return hasItem(this, modelName, 'md');
            }
            Matchers.toHaveModel = toHaveModel;

            /**
            * Passes if the given view name is found.
            * @param {String} viewName The view name to find.
            * @returns {Boolean}
            */
            function toHaveView(viewName) {
                return hasItem(this, viewName, 'vw');
            }
            Matchers.toHaveView = toHaveView;

            /**
            * Passes if the given controller name is found.
            * @param {String} controllerName The controller name to find.
            * @returns {Boolean}
            */
            function toHaveController(controllerName) {
                return hasItem(this, controllerName, 'ct');
            }
            Matchers.toHaveController = toHaveController;

            /**
            * Passes if the given store name is found.
            * @param {String} storeName The store name to find.
            * @returns {Boolean}
            */
            function toHaveStore(storeName) {
                return hasItem(this, storeName, 'st');
            }
            Matchers.toHaveStore = toHaveStore;

            /**
            * Passes if the given ref name is found.
            * @param {String} refName The ref name to find.
            * @returns {Boolean}
            */
            function toHaveRef(refName) {
                return hasItem(this, refName, 'rf');
            }
            Matchers.toHaveRef = toHaveRef;

            /**
            * Passes if the given config name is found.
            * @param {String} configName The config name to find.
            * @returns {Boolean}
            */
            function toHaveConfig(configName) {
                return hasItem(this, configName, 'cf');
            }
            Matchers.toHaveConfig = toHaveConfig;

            /**
            * Passes if the given class name is required.
            * @param {String} refName The required class name to find.
            * @returns {Boolean}
            */
            function toRequire(className) {
                return hasItem(this, className, 'rq');
            }
            Matchers.toRequire = toRequire;

            /**
            * Passes if the class instance or constructor extends the given class name.
            * @param {String} className The class name to match.
            * @returns {Boolean}
            */
            function toExtend(className) {
                return isExtension(this, className, 'extend');
            }
            Matchers.toExtend = toExtend;

            /**
            * Passes if the class instance or constructor overrides the given class name.
            * @param {String} className The class name to match.
            * @returns {Boolean}
            */
            function toOverride(className) {
                return isExtension(this, className, 'override');
            }
            Matchers.toOverride = toOverride;

            /**
            * Passes if the keys in the expected object have matching values in a spy argument.
            * @param {Object} expected The object containing keys and values to match.
            * @param {Number} [arg] The zero based argument index to compare. Defaults to zero (the first).
            * @returns {Boolean}
            */
            function toHaveBeenCalledWithConfig(expected, arg) {
                var i, len, spy = this.actual, config;

                if (!ExtSpec.isTypeOf(arg, 'nm')) {
                    arg = 0;
                }

                if (spy && spy.isSpy) {
                    for (i = 0, len = spy.calls.length; i < len; i += 1) {
                        config = spy.calls[i].args[arg];

                        if (config && ExtSpec.objectKeysMatch(config, expected)) {
                            return true;
                        }
                    }
                }

                return false;
            }
            Matchers.toHaveBeenCalledWithConfig = toHaveBeenCalledWithConfig;

            /**
            * Passes if the spy added a listener for the given event.
            * @param {String|Object} expected The event name or configuration to match.
            * @returns {Boolean}
            */
            function toHaveAddedListener(expected) {
                return listenedMatcher({
                    actual: this.actual,
                    expected: expected,
                    isManaged: false
                });
            }
            Matchers.toHaveAddedListener = toHaveAddedListener;

            /**
            * Passes if the spy removed a listener for the given event.
            * @param {String|Object} expected The event name or configuration to match.
            * @returns {Boolean}
            */
            function toHaveRemovedListener(expected) {
                return listenedMatcher({
                    actual: this.actual,
                    expected: expected,
                    isManaged: false
                });
            }
            Matchers.toHaveRemovedListener = toHaveRemovedListener;

            /**
            * Passes if the spy added a listener for the given event.
            * @param {String|Object} expected The event name or configuration to match.
            * @returns {Boolean}
            */
            function toHaveAddedManagedListener(expected) {
                return listenedMatcher({
                    actual: this.actual,
                    expected: expected,
                    isManaged: true
                });
            }
            Matchers.toHaveAddedManagedListener = toHaveAddedManagedListener;

            /**
            * Passes if the spy removed a listener for the given event.
            * @param {String|Object} expected The event name or configuration to match.
            * @returns {Boolean}
            */
            function toHaveRemovedManagedListener(expected) {
                return listenedMatcher({
                    actual: this.actual,
                    expected: expected,
                    isManaged: true
                });
            }
            Matchers.toHaveRemovedManagedListener = toHaveRemovedManagedListener;

            /**
            * Passes if the spy controlled the given event.
            * @param {String|Object} expected The event name or configuration to match.
            * @returns {Boolean}
            */
            function toHaveControlled(expected) {
                if (!(this.actual && this.actual.isSpy)) {
                    throw new Error('Expected ' + jasmine.pp(this.actual) + ' to be a spy.');
                }

                var actual = this.actual, selector, selectorMap, selectorPattern, args, config, listener, i, len;

                if (!ExtSpec.isTypeOf(expected, 'st')) {
                    config = expected;
                } else {
                    config = {
                        event: expected
                    };
                }

                if (ExtSpec.isTypeOf(config.selector, 'rg')) {
                    selectorPattern = config.selector;
                } else {
                    selectorPattern = new RegExp(ExtSpec.regExpEscape(config.selector || ''));
                }

                for (i = 0, len = actual.calls.length; i < len; i += 1) {
                    args = actual.calls[i].args;
                    selectorMap = args[0];

                    if (ExtSpec.isTypeOf(selectorMap, 'st')) {
                        selector = selectorMap;
                        selectorMap = {};
                        selectorMap[selector] = args[1];
                    }

                    for (selector in selectorMap) {
                        if (selectorMap.hasOwnProperty(selector) && selectorPattern.test(selector) && selectorMap[selector].hasOwnProperty(config.event)) {
                            if (!config.listener) {
                                return true;
                            }

                            listener = selectorMap[selector][config.event];

                            if ((listener.fn || listener) === config.listener) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            }
            Matchers.toHaveControlled = toHaveControlled;
        })(Jasmine.Matchers || (Jasmine.Matchers = {}));
        var Matchers = Jasmine.Matchers;
    })(ExtSpec.Jasmine || (ExtSpec.Jasmine = {}));
    var Jasmine = ExtSpec.Jasmine;
})(ExtSpec || (ExtSpec = {}));
var ExtSpec;
(function (ExtSpec) {
    (function (Jasmine) {
        /**
        * Obsolete matchers for Jasmine.
        */
        (function (Matchers) {
            'use strict';

            var bindRe = /(?:^|\.)(?:on|addListener|mon|addManagedListener)$/, unbindRe = /(?:^|\.)(?:un|removeListener|mun|removeMangedListener)$/, managedRe = /(?:^|\.)(?:mon|addManagedListener|mun|removeMangedListener)$/;

            /**
            * Sets the message for a jasmine expectation.
            * @param {Object} expectation The expectation.
            * @param {String} prefix The start of the message.
            * @param {String} suffix The end of the message.
            */
            function setExpectationMessage(expectation, prefix, suffix) {
                var message = prefix + (expectation.isNot ? ' not ' : ' ') + suffix;

                expectation.message = function () {
                    return message;
                };
            }

            /**
            * Passes the expectation if the actual function matches the expected function.
            * @param {Object} expectation The expectation.
            * @param {Boolean} bind True if the function handles event binding, false for unbinding.
            * @param {String} event The event name.
            * @param {String|Function} actual The actual listener function or its name.
            * @param {String|Function} expected The expected listener function or its name.
            * @param {Object} [scope] The scope if provided.
            * @returns {Boolean}
            */
            function eventBindingsMatch(expectation, bind, event, actual, expected, scope) {
                if (ExtSpec.isTypeOf(expected, 'fn') && ExtSpec.isTypeOf(actual, 'st')) {
                    actual = scope[actual];
                }

                setExpectationMessage(expectation, 'Expected ' + jasmine.pp(event) + ' event with ' + (bind ? 'binding to ' : 'unbinding from ') + jasmine.pp(actual), 'to have been ' + (bind ? 'bound to ' : 'unbound from ') + jasmine.pp(expected) + '.');

                return actual === expected;
            }

            /**
            * Passes the expectation if the event binding matches the expected listener.
            * @param {Object} expectation The expectation.
            * @param {Boolean} bind True if the method handles event binding, false if it handles unbinding.
            * @param {String} event The event name.
            * @param {String|Function} expected The expected listener function or its name.
            * @param {Number} [call] The index of the spy call to analyze, or undefined to analyze the most recent call.
            * @returns {Boolean}
            */
            function hasBoundEvent(expectation, bind, event, expected, call) {
                if (!(expectation.actual && expectation.actual.isSpy)) {
                    throw new Error('Expected ' + jasmine.pp(expectation.actual) + ' to be a spy.');
                }

                var spyName = expectation.actual.identity, allowedMethods = bind ? bindRe : unbindRe, actual, args, managed, eventName, options, config;

                if (!allowedMethods.test(spyName)) {
                    throw new Error('Expected ' + jasmine.pp(expectation.actual) + ' to be an event ' + (bind ? 'binder.' : 'unbinder.'));
                }

                actual = ExtSpec.isTypeOf(call, 'nm') ? expectation.actual.calls[call] : expectation.actual.mostRecentCall;
                args = actual.args;
                managed = managedRe.test(spyName) ? 1 : 0;
                eventName = args[managed];

                if (!ExtSpec.isTypeOf(eventName, 'st')) {
                    options = eventName;

                    if (options.hasOwnProperty(event)) {
                        config = options[event];

                        return eventBindingsMatch(expectation, bind, event, config.fn || config, expected, config.scope || options.scope || actual.object);
                    }
                } else {
                    if (eventName === event) {
                        return eventBindingsMatch(expectation, bind, event, args[1 + managed], expected, args[2 + managed] || actual.object);
                    }
                }

                setExpectationMessage(expectation, 'Expected event ' + jasmine.pp(event) + ' with no ' + (bind ? 'binding' : 'unbinding'), 'to have been ' + (bind ? 'bound to ' : 'unbound from ') + jasmine.pp(expected) + '.');
                return false;
            }

            /**
            * Passes if the spy bound the given event name to the expected listener.
            * @param {String} event The name of the event.
            * @param {Function|String} expected The listener function or its name to match.
            * @param {Number} [call] The index of the spy call to analyze, or undefined to analyze the most recent call.
            * @returns {Boolean}
            * @deprecated Use toHaveAddedListener or toHaveAddedManagedListener.
            */
            function toHaveBoundEvent(event, expected, call) {
                ExtSpec.obsolete({
                    namespace: 'ExtSpec.Jasmine.Matchers',
                    method: 'toHaveBoundEvent',
                    message: 'Use toHaveAddedListener or toHaveAddedManagedListener.'
                });

                return hasBoundEvent(this, true, event, expected, call);
            }
            Matchers.toHaveBoundEvent = toHaveBoundEvent;

            /**
            * Passes if the spy unbound the given event name from the expected listener.
            * @param {String} event The name of the event.
            * @param {Function|String} expected The listener function or its name to match.
            * @param {Number} [call] The index of the spy call to analyze, or undefined to analyze the most recent call.
            * @returns {Boolean}
            * @deprecated Use toHaveRemovedListener or toHaveRemovedManagedListener.
            */
            function toHaveUnboundEvent(event, expected, call) {
                ExtSpec.obsolete({
                    namespace: 'ExtSpec.Jasmine.Matchers',
                    method: 'toHaveUnboundEvent',
                    message: 'Use toHaveRemovedListener or toHaveRemovedManagedListener.'
                });

                return hasBoundEvent(this, false, event, expected, call);
            }
            Matchers.toHaveUnboundEvent = toHaveUnboundEvent;

            /**
            * Passes if the spy controlled the given event name using the expected listener.
            * @param {String} event The name of the event.
            * @param {Function|String} expected The listener function or its name to match.
            * @param {String} [selector] The optional component query selector to match.
            * @param {Number} [call] The index of the spy call to analyze, or undefined to analyze the most recent call.
            * @returns {Boolean}
            * @deprecated Use toHaveControlled.
            */
            function toHaveControlledEvent(event, expected, selector, call) {
                ExtSpec.obsolete({
                    namespace: 'ExtSpec.Jasmine.Matchers',
                    method: 'toHaveControlledEvent',
                    message: 'Use toHaveControlled.'
                });

                if (!(this.actual && this.actual.isSpy)) {
                    throw new Error('Expected ' + jasmine.pp(this.actual) + ' to be a spy.');
                }

                if (this.actual.identity !== 'control') {
                    throw new Error('Expected ' + jasmine.pp(this.actual) + ' to be an event controller.');
                }

                var actual, selectors, options, key, config, match;

                actual = ExtSpec.isTypeOf(call, 'nm') ? this.actual.calls[call] : this.actual.mostRecentCall;
                selectors = actual.args[0];

                if (ExtSpec.isTypeOf(selectors, 'st')) {
                    key = selectors;
                    selectors = {};
                    selectors[key] = actual.args[1];
                }

                if (selector) {
                    if (selectors.hasOwnProperty(selector)) {
                        options = selectors[selector];

                        if (options.hasOwnProperty(event)) {
                            config = options[event];

                            return eventBindingsMatch(this, true, event, config.fn || config, expected, config.scope || options.scope || actual.object);
                        }
                    }
                } else {
                    for (key in selectors) {
                        if (selectors.hasOwnProperty(key)) {
                            options = selectors[key];

                            if (options.hasOwnProperty(event)) {
                                config = options[event];
                                match = eventBindingsMatch(this, true, event, config.fn || config, expected, config.scope || options.scope || actual.object);

                                if (match) {
                                    return true;
                                }
                            }
                        }
                    }
                }

                setExpectationMessage(this, 'Expected ' + jasmine.pp(event) + ' event' + (selector ? ' using ' + jasmine.pp(selector) + ' selector' : ''), 'to have been controlled with ' + jasmine.pp(expected) + '.');
                return false;
            }
            Matchers.toHaveControlledEvent = toHaveControlledEvent;
        })(Jasmine.Matchers || (Jasmine.Matchers = {}));
        var Matchers = Jasmine.Matchers;
    })(ExtSpec.Jasmine || (ExtSpec.Jasmine = {}));
    var Jasmine = ExtSpec.Jasmine;
})(ExtSpec || (ExtSpec = {}));

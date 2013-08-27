declare module ExtSpec {
    var global;
}
/**
* Core Ext Spec module.
*/
declare module ExtSpec {
    /**
    * Wraps the console in a mutable object.
    */
    module ConsoleWrapper {
        function log(...args: any[]);
        function warn(...args: any[]);
    }
    /**
    * Class for resource configurations.
    */
    class ResourceConfig {
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
        constructor(property: string, suffix?: string, matcher?: (list: any, value: any) => boolean, itemProperty?: string);
        public property: string;
        public suffix: string;
        public matcher: (list: any, value: any) => boolean;
        public itemProperty: string;
    }
    /**
    * Returns the object type of the given value as mixed case string.
    * @param {Object} value Any value of any type.
    * @returns {String}
    */
    function typeOfObject(value: any): string;
    /**
    * Returns either the primitive or object type of a given value as a lower cased string. Includes number variants.
    * @param {Object} value Any value of any type.
    * @returns {String}
    */
    function typeOf(value: any): string;
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
    function isTypeOf(value: any, compare: string): boolean;
    /**
    * Returns true if a given value is an object type and is not null, otherwise false.
    * @param {Object} value Any value of any type.
    * @returns {Boolean}
    */
    function isObjectType(value: any): boolean;
    /**
    * Compares two objects, returning true if all the keys in the second object have equal values in the first.
    * @param {Object} value An object to compare.
    * @param {Object} match An object containing key value pairs to match.
    * @returns {Boolean}
    */
    function objectKeysMatch(value: any, match: any): boolean;
    /**
    * Copies properties to the destination object from the source.
    * @param {Object} destination The destination object.
    * @param {Object} source The source object.
    * @param {String[]} [except] The properties to skip, or undefined to skip none.
    */
    function apply(destination: any, source: any, except?: string[]): void;
    /**
    * Ensures that each object in a namespace exists, and creates it if it does not. Returns the final object in the chain.
    * @param {String} namespace The namespace to assign using dot notation.
    * @param {Object} [root] The root object to attach the namespace. Will default to the global object if omitted.
    * @returns {Object}
    */
    function ensureNamespace(namespace: string, root?: any): any;
    /**
    * Adds a warning to the browser console.
    * @param {String} warning The warning message to output to the console.
    */
    function warn(warning: string): void;
    /**
    * Describes the configuration argument for the obsolete method.
    */
    interface IObsoleteConfig {
        /**
        * The method name.
        */
        method: string;
        /**
        * The namespace.
        */
        namespace?: string;
        /**
        * The message desribing alternative workarounds.
        */
        message?: string;
    }
    /**
    * Marks a method as obsolete and logs it to the console.
    * @param {String} method The method name.
    */
    function obsolete(method: string): void;
    /**
    * Marks a method as obsolete and logs it to the console.
    * @param {Object} config The method configuration argument.
    */
    function obsolete(config: IObsoleteConfig): void;
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
    function getResourceConfig(type: string): ResourceConfig;
    /**
    * Retrieves the configuration object from an XTemplate array.
    * @param {Object} instance The object instance in which to find the tpl.
    * @returns {Object} The configuration object.
    */
    function getTplConfig(instance: any): any;
    /**
    * Escapes a string to be used in a regular expression pattern.
    * @param {String} value The string to be escaped.
    * @returns {String} The escaped string.
    */
    function regExpEscape(value: string): string;
}
/**
* Module for capturing and reconstituting Ext JS class definitions.
*/
declare module ExtSpec.ClassManager {
    /**
    * Sets an Ext JS class definition.
    * @param {String} className The class name to set.
    * @param {Object|Function} configuration The Ext JS class definition as an object or function.
    * @param {Function} [callback] The callback function.
    */
    function set(className: string, configuration: any, callback?: Function): void;
    /**
    * Gets an Ext JS class definition.
    * @param {String} className The class name to get.
    * @returns {Object}
    */
    function get(className: string): any;
    /**
    * Builds a constructor for the given class.
    * @param {String} className The class name to construct.
    * @param {Function} [preConstruct] The function to apply to the instance before a custom constructor.
    * @returns {Function}
    */
    function construct(className: string, preConstruct?: Function): any;
    /**
    * Creates and returns a new instance of the given class.
    * @param {String} className The class name to instantiate.
    * @param {Function} [preConstruct] The function to apply to the instance before a custom constructor.
    * @returns {Object}
    */
    function create(className: string, preConstruct?: Function);
    /**
    * Gets the callback function passed to Ext.define.
    * @param {String} className The class name of the callback to get.
    * @returns {Function}
    */
    function callback(className);
}
declare module ExtSpec {
    var create: (className: string, preConstruct?: Function) => any;
}
/**
* Mock Ext module.
*/
declare module Ext {
    var define: (className: string, configuration: any, callback?: Function) => any;
}
/**
* Module for Jasmine specific helpers.
*/
declare module ExtSpec.Jasmine {
    /**
    * Creates getter spies for all models defined in the given instance.
    * @param {Object} instance The object on which to create the spies.
    * @param {String[]} [models] The list of models to spy, or undefined to create spies for all models in the instance.
    */
    function createModelSpies(instance: any, models?: string[]): void;
    /**
    * Creates a getter spy for the given model defined in the instance.
    * @param {Object} instance The object on which to create the spy.
    * @param {String} name The model name to build into a getter.
    * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
    * @returns {Function}
    */
    function createModelSpy(instance: any, name: string, spies?: any[]): jasmine.Spy;
    /**
    * Creates getter spies for all views defined in the given instance.
    * @param {Object} instance The object on which to create the spies.
    * @param {String[]} [views] The list of views to spy, or undefined to create spies for all views in the instance.
    */
    function createViewSpies(instance: any, views?: string[]): void;
    /**
    * Creates a getter spy for the given view defined in the instance.
    * @param {Object} instance The object on which to create the spy.
    * @param {String} name The view name to build into a getter.
    * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
    * @returns {Function}
    */
    function createViewSpy(instance: any, name: string, spies?: any[]): jasmine.Spy;
    /**
    * Creates getter spies for all controllers defined in the given instance.
    * @param {Object} instance The object on which to create the spies.
    * @param {String[]} [controllers] The list of controllers to spy, or undefined to create spies for all controllers in the instance.
    */
    function createControllerSpies(instance: any, controllers?: string[]): void;
    /**
    * Creates a getter spy for the given controller defined in the instance.
    * @param {Object} instance The object on which to create the spy.
    * @param {String} name The controller name to build into a getter.
    * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
    * @returns {Function}
    */
    function createControllerSpy(instance: any, name: string, spies?: any[]): jasmine.Spy;
    /**
    * Creates getter spies for all stores defined in the given instance.
    * @param {Object} instance The object on which to create the spies.
    * @param {String[]} [stores] The list of stores to spy, or undefined to create spies for all stores in the instance.
    */
    function createStoreSpies(instance: any, stores?: string[]): void;
    /**
    * Creates a getter spy for the given store defined in the instance.
    * @param {Object} instance The object on which to create the spy.
    * @param {String} name The store name to build into a getter.
    * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
    * @returns {Function}
    */
    function createStoreSpy(instance: any, name: string, spies?: any[]): jasmine.Spy;
    /**
    * Creates getter spies for all refs defined in the given instance.
    * @param {Object} instance The object on which to create the spies.
    * @param {String[]} [refs] The list of refs to spy, or undefined to create spies for all refs in the instance.
    */
    function createRefSpies(instance: any, refs?: string[]): void;
    /**
    * Creates a getter spy for the given ref defined in the instance.
    * @param {Object} instance The object on which to create the spy.
    * @param {String} name The ref name to build into a getter.
    * @param {Object[]} [spies] The list of spies to attach to the return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
    * @returns {Function}
    */
    function createRefSpy(instance: any, name: string, spies?: any[]): jasmine.Spy;
    /**
    * Creates accessor spies for all configs defined in the given instance.
    * @param {Object} instance The object on which to create the spies.
    * @param {String[]} [configs] The list of configs to spy, or undefined to create spies for all configs in the instance.
    */
    function createConfigSpies(instance: any, configs?: string[]): void;
    /**
    * Creates accessor spies for the given config defined in the instance.
    * @param {Object} instance The object on which to create the spy.
    * @param {String} name The config name to build into a getter and setter.
    * @param {Object[]} [spies] The list of spies to attach to the getter return object either as strings, configuration objects or a combination of both. See spyOnObject for more details.
    * @returns {Function}
    */
    function createConfigSpy(instance: any, name: string, spies?: any[]): jasmine.Spy;
    /**
    * Creates an object and attaches spies using the given configuration.
    * @param {Object[]} spies The list of spies to attach either as strings, configuration objects or a combination of both. See spyOnObject for more details.
    * @returns {Object}
    */
    function createSpyObject(spies: any[]): any;
    /**
    * Creates spies on an object that automatically return the root object for method chaining.
    * @param {String} baseName The name of spy the class.
    * @param {String[]} spies The array of method names to make spies.
    */
    function createFluentSpyObject(baseName: string, spies: string[]): any;
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
    function spyOnObject(target: any, spies: any[]): void;
    /**
    * Spies on methods within the given namespace, or creates them if they don't already exist.
    * @param {String} namespace The namespace (using dot notation) on which to assign the spies.
    * @param {Object[]} spies The list of spies to attach either as strings, configuration objects or a combination of both. See spyOnObject for more details.
    * @returns {Object}
    */
    function spyOnNamespace(namespace: string, spies: any[]): any;
    /**
    * Fetches the return value assigned to a spy as part of a chain.
    * @param {Object} instance The object instance that contains spies.
    * @param {String} chain The method chain using dot notation but without parens.
    * @returns {Object}
    */
    function getSpyReturn(instance: any, chain: string): any;
}
/**
* Matchers for Jasmine.
*/
declare module ExtSpec.Jasmine.Matchers {
    /**
    * The configuration structure for a listened expectation.
    */
    interface IListenedConfig {
        /**
        * The event name to match.
        */
        event: string;
        /**
        * The listener to match.
        */
        listener?: Function;
    }
    /**
    * The configuration structure for a controlled expectation.
    */
    interface IControlledConfig extends IListenedConfig {
        /**
        * The string or regular expression selector to match.
        */
        selector?: any;
    }
    /**
    * Passes the expectation if the given model name is found.
    * @param {String} modelName The model name to find.
    * @returns {Boolean}
    */
    function toHaveModel(modelName: string): boolean;
    /**
    * Passes if the given view name is found.
    * @param {String} viewName The view name to find.
    * @returns {Boolean}
    */
    function toHaveView(viewName: string): boolean;
    /**
    * Passes if the given controller name is found.
    * @param {String} controllerName The controller name to find.
    * @returns {Boolean}
    */
    function toHaveController(controllerName: string): boolean;
    /**
    * Passes if the given store name is found.
    * @param {String} storeName The store name to find.
    * @returns {Boolean}
    */
    function toHaveStore(storeName: string): boolean;
    /**
    * Passes if the given ref name is found.
    * @param {String} refName The ref name to find.
    * @returns {Boolean}
    */
    function toHaveRef(refName: string): boolean;
    /**
    * Passes if the given config name is found.
    * @param {String} configName The config name to find.
    * @returns {Boolean}
    */
    function toHaveConfig(configName: string): boolean;
    /**
    * Passes if the given class name is required.
    * @param {String} refName The required class name to find.
    * @returns {Boolean}
    */
    function toRequire(className: string): boolean;
    /**
    * Passes if the class instance or constructor extends the given class name.
    * @param {String} className The class name to match.
    * @returns {Boolean}
    */
    function toExtend(className: string): boolean;
    /**
    * Passes if the class instance or constructor overrides the given class name.
    * @param {String} className The class name to match.
    * @returns {Boolean}
    */
    function toOverride(className: string): boolean;
    /**
    * Passes if the keys in the expected object have matching values in a spy argument.
    * @param {Object} expected The object containing keys and values to match.
    * @param {Number} [arg] The zero based argument index to compare. Defaults to zero (the first).
    * @returns {Boolean}
    */
    function toHaveBeenCalledWithConfig(expected: any, arg?: number): boolean;
    /**
    * Passes if the spy added a listener for the given event name.
    * @param {String} expected The event name to match.
    * @returns {Boolean}
    */
    function toHaveAddedListener(expected: string): boolean;
    /**
    * Passes if the spy added a listener for the given event configuration.
    * @param {Object} expected The event configuration to match.
    * @returns {Boolean}
    */
    function toHaveAddedListener(expected: IListenedConfig): boolean;
    /**
    * Passes if the spy removed a listener for the given event name.
    * @param {String} expected The event name to match.
    * @returns {Boolean}
    */
    function toHaveRemovedListener(expected: string): boolean;
    /**
    * Passes if the spy removed a listener for the given event configuration.
    * @param {Object} expected The event configuration to match.
    * @returns {Boolean}
    */
    function toHaveRemovedListener(expected: IListenedConfig): boolean;
    /**
    * Passes if the spy added a listener for the given event name.
    * @param {String} expected The event name to match.
    * @returns {Boolean}
    */
    function toHaveAddedManagedListener(expected: string): boolean;
    /**
    * Passes if the spy added a listener for the given event configuration.
    * @param {Object} expected The event configuration to match.
    * @returns {Boolean}
    */
    function toHaveAddedManagedListener(expected: IListenedConfig): boolean;
    /**
    * Passes if the spy removed a listener for the given event name.
    * @param {String} expected The event name to match.
    * @returns {Boolean}
    */
    function toHaveRemovedManagedListener(expected: string): boolean;
    /**
    * Passes if the spy removed a listener for the given event configuration.
    * @param {Object} expected The event configuration to match.
    * @returns {Boolean}
    */
    function toHaveRemovedManagedListener(expected: IListenedConfig): boolean;
    /**
    * Passes if the spy controlled the given event name.
    * @param {String} expected The event name to match.
    * @returns {Boolean}
    */
    function toHaveControlled(expected: string): boolean;
    /**
    * Passes if the spy controlled the given event configuration.
    * @param {Object} expected The configuration to match.
    * @returns {Boolean}
    */
    function toHaveControlled(expected: IControlledConfig): boolean;
}
/**
* Obsolete matchers for Jasmine.
*/
declare module ExtSpec.Jasmine.Matchers {
    function toHaveBoundEvent(event: string, expected: Function, call?: number): boolean;
    function toHaveBoundEvent(event: string, expected: string, call?: number): boolean;
    function toHaveUnboundEvent(event: string, expected: Function, call?: number): boolean;
    function toHaveUnboundEvent(event: string, expected: string, call?: number): boolean;
    function toHaveControlledEvent(event: string, expected: Function, selector?: string, call?: number): boolean;
    function toHaveControlledEvent(event: string, expected: string, selector?: string, call?: number): boolean;
}

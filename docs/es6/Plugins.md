### @squirrel-forge/ui-form
> [Back to table of contents](../README.md)

# Documentation
### Javascript / Plugins
> [Form](Form.md) <[ Plugins ]> [Table of contents](../README.md)

## Table of contents
 - [UiFormPluginFieldControl](#UiFormPluginFieldControl)
 - [UiFormPluginJSONResponse](#UiFormPluginJSONResponse)
 - [UiFormPluginPrefetch](#UiFormPluginPrefetch)
 - [UiFormPluginReCaptcha](#UiFormPluginReCaptcha)
 - [UiFormPluginValues](#UiFormPluginValues)

---

### UiFormPluginFieldControl
UiFormPluginFieldControl class - UiForm plugin for input states and errors.

#### Component settings
Component settings are changed/extended as following.
```javascript
const extendConfig = {
    fields : {
        
        // Submit disabled control by event types
        // @type {Object}
        submit : {
            disableOn : [ 'loading', 'sending', 'success' ],
            enableOn : [ 'default', 'reset' ],
        },
        
        // Input/group state and error selectors
        // @type {Object}
        selectors : {
            input : {
                state : '.input',
                error : '.input__error',
            },
            group : {
                state : '.input-group',
                error : '.input-group__error',
            },
        },
        
        // Input states and relations
        // @†ype {Object}
        states : {
            'field.disabled' : { classOn : 'input--disabled' },
            'field.focus' : { classOn : 'input--focus', unsets : [ 'field.blur', 'field.error' ] },
            'field.blur' : { classOn : 'input--blur', unsets : [ 'field.focus', 'field.error.visible' ] },
            'field.filled' : { classOn : 'input--filled', unsets : [ 'field.empty' ] },
            'field.empty' : { classOn : 'input--empty', unsets : [ 'field.filled' ] },
            'field.input' : { classOn : 'input--input', autoUnset : true },
            'field.change' : { classOn : 'input--change', autoUnset : true, unsets : [ 'field.error.visible' ] },
            'field.error' : { classOn : 'input--error' },
            'field.error.visible' : { classOn : 'input--error-visible', callbackOff : ( name, element ) => { /* Clears error host */ } },
            'submit.disabled' : { classOn : 'submit--disabled' },
        },
        
        // Use values states, filled, empty, input and change
        // @type {boolean}
        valueStates : true,
        
        // Input events to bind
        // @type {string}
        bindEvents : [ 'focus', 'blur', 'input', 'change' ],
        
        // Event binding rules
        // @type {Object}
        eventRules : {
            initialized : '*',
            ready : '*',
            focus : '*',
            blur : '*',
            input : [ 'textarea', 'input-password', 'input-search', 'input-number', 'input-text', 'input-email' ],
            change : [ 'select', 'textarea', 'input-checkbox', 'input-file', 'input-radio', 'input-range', 'input-date' ],
        },
        
        // Error handling
        // @type {Object}
        errors : {

            // Only set error state
            // @type {boolean}
            onlyState : false,

            // Grouped/array inputs show error on first input only
            // @type {boolean}
            showOnFirstOnly : true,

            // Render only first field error
            // @type {boolean}
            renderOnlyFirst : false,

            // String to use for joining errors on render
            // @type {string}
            renderJoinString : ', ',

            // Error render custom callback
            // @type {Function}
            renderCallback : null,

            // Clear errors on form reset
            // @type {boolean}
            clearOnReset : true,

            // Clear errors on soft reset
            // @type {boolean}
            clearOnResetSoft : true,

            // Field map or callback for mapping
            // @type {null|Object|Function}
            mapFields : null,

            // Replace existing errors by remapped errors
            // @type {boolean}
            replaceMapped : false,

            // Remove old fields of remapped error fields
            // @type {boolean}
            removeMapped : false,

            // Attribute name for field individual error selector
            // @†ype {string}
            attrErrorSelector : 'data-error-selector',

            // Scroll to first error with scrollIntoView or custom callback
            // @type {boolean|Function}
            scrollToFirst : true,
        },
    },

    // Dom references
    // @type {Object}
    dom : {
        
        // Input fields selector
        // @type {string}
        fields : 'input, select, textarea'
    },
};
```

#### Class overview
```javascript
// Component event names: field.error
class UiFormPluginFieldControl extends UiPlugin {
  static pluginName : String
  constructor( options, context, debug ) {}
  initComponent( context ) {} // void
  submitDisable( state = true ) {} // void
  clearAllFieldsErrors( error = true, visibility = true, only = null ) {} // void
  clearFieldErrors( input, error = true, visibility = true ) {} // void
  remapFieldsErrors( errors, options ) {} // void
  showFieldsErrors( errors, onlyState = null ) {} // void
  showFieldErrors( field, errors, onlyState = null ) {} // void
  fieldHasErrors( field ) {} // boolean
}
```
For more details check the [UiFormPluginFieldControl source file](../../src/es6/Plugins/UiFormPluginFieldControl.js).

---

### UiFormPluginJSONResponse
UiFormPluginJSONResponse class - UiForm plugin for easy JSON response handling.

#### Component settings
Component settings are changed/extended as following.
```javascript
const extendConfig = {
    response : {

        // Response data property to read redirect url from
        // @type {null|string}
        redirect : 'redirect',

        // Response data property to read errors object from
        // @type {null|string}
        errors : 'errors',

        // Custom success callback
        // @type {null|Function|successCallback}
        successCallback : null,

        // Custom error callback
        // @type {null|Function|errorCallback}
        errorCallback : null,

        // Error object used when none is available from the response
        // @type {Object}
        unknown : { general : 'An unknown error occured, please try again later.' },
    },
};
```

#### Class overview
```javascript
class UiFormPluginJSONResponse extends UiPlugin {
  static pluginName : String
  constructor( options, context, debug ) {}
}
```
For more details check the [UiFormPluginJSONResponse source file](../../src/es6/Plugins/UiFormPluginJSONResponse.js).

---

### UiFormPluginPrefetch
UiFormPluginPrefetch class - UiForm plugin for prefetching information or field values.

When using this plugin, make sure to load it before all others since it modifies the default event and state flow.

#### Component settings
Component settings are changed/extended as following.
```javascript
const extendConfig = {

    // Changes default state to ready
    // @type {string}
    defaultState : 'ready',

    // Changes default event to ready
    // @type {string}
    defaultEvent : 'ready',

    // Extends sendable states
    // @type {Array<string>}
    sendableStates : [ 'ready' ],

    // Prefetch options
    // @type {Object}
    prefetch : {

        // AsyncRequest default options see @squirrel-forge/ui-util for details
        // @type {Object}
        asyncOptions : {},

        // Request method for prefetch request
        // @type {string}
        method : 'post',

        // Prefetch url, must be set to use prefetch
        // @type {null|string}
        url : null,

        // Response fields data property
        // @type {string}
        fields : 'fields',

        // Use flat fields data type
        // @type {boolean}
        flatFields : false,

        // Custom prefetch callback, replaces default request
        // @type {null|Function}
        prefetchCallback : null,

        // Custom response callback, runs in addition to fields set
        // @type {null|Function}
        responseCallback : null,

        // Refetch request on reset
        // @type {boolean}
        refetchOnReset : true,

        // Refetch request on soft reset
        // @type {boolean}
        refetchOnResetSoft : false,

        // Reload page on error
        // @type {boolean}
        reloadOnError : false,

        // Reload after delay
        // @type {number}
        reloadOnErrorDelay : 5000,
    },
};
```

#### Class overview
```javascript
// Component event names: prefetch.success, prefetch.error, error, ready
class UiFormPluginPrefetch extends UiPlugin {
  static pluginName : String
  constructor( options, context, debug ) {}
}
```
For more details check the [UiFormPluginPrefetch source file](../../src/es6/Plugins/UiFormPluginPrefetch.js).

---

### UiFormPluginReCaptcha
UiFormPluginReCaptcha class - UiForm plugin for google recaptcha integration.

#### Component settings
Component settings are changed/extended as following.
```javascript
const extendConfig = {
    recaptcha : {

        // Google recaptcha sitekey
        //  Must be set to enable plugin, can be set via data-recaptcha-key attribute on the form
        // @type {null|string}
        sitekey : null,

        // ReCaptcha options
        // @type {Object}
        options : { size : 'invisible' },

        // Loader callback name
        // @type {string}
        loaderName : 'grecaptchaOnLoad',

        // Token callback name
        // @type {string}
        setTokenName : 'grecaptchaSetToken',

        // Execute callback name
        // @type {string}
        executeName : 'grecaptchaExecute',

        // Append a recaptcha host element if none is defined
        // @type {(null|'form'|'body'|HTMLElement)}
        appendHost : 'form',

        // Recaptcha host element if appended
        // @type {string}
        host : '<div data-recaptcha-host />',

        // Script source including the loaderName option callback
        // @type {string}
        script : 'https://www.google.com/recaptcha/api.js?onload=grecaptchaOnLoad',

        // Script marker attribute, used for dom.recaptchaScript selector
        // @type {string}
        scriptAttribute : 'data-recaptcha-script',
    },

    // Dom references
    // @type {Object}
    dom : {

        // Recaptcha host element selector
        // @type {string}
        recaptchaHost : '[data-recaptcha-host]',

        // Recaptcha submit button selector
        // @type {string}
        recaptchaSubmit : '[data-recaptcha-submit]',

        // Recaptcha script selector
        // @type {string}
        recaptchaScript : '[data-recaptcha-script]',
    },
};
```

#### Class overview
```javascript
class UiFormPluginReCaptcha extends UiPlugin {
  static pluginName : String
  constructor( options, context, debug ) {}
  initComponent( context ) {} // void
}
```
For more details check the [UiFormPluginReCaptcha source file](../../src/es6/Plugins/UiFormPluginReCaptcha.js).

---

### UiFormPluginValues
UiFormPluginValues class - UiForm plugin for input values handling.

#### Component settings
Component settings are changed/extended as following.
```javascript
const extendConfig = {
    values : {

        // Enable input data change state
        // @type {boolean}
        changeState : false
    },

    // Dom references
    // @type {Object}
    dom : {

        // Values input selector
        // @type {string}
        values : 'input, select, textarea'
    },
};
```

#### Class overview
```javascript
class UiFormPluginValues extends UiPlugin {
  static pluginName : String
  constructor( options, context, debug ) {}
  initComponent( context ) {} // void
  values : FormValues
  updateValuesStates() {} // void
  hasChanges() {} // null|boolean
  getInputs( field ) {} // Array|NodeList
  getValues( flat = false, selector = null ) {} // Object
  setValues( values, flat = false ) {} // void
}
```
For more details check the [UiFormPluginValues source file](../../src/es6/Plugins/UiFormPluginValues.js).

---

> [Form](Form.md) <[ Plugins ]> [Table of contents](../README.md)

### @squirrel-forge/ui-form
> [Back to table of contents](../README.md#table-of-contents)

# Documentation
### Javascript / Plugins
> [Form](Form.md) <[ Plugins ]> [Table of contents](../README.md#table-of-contents)

## Table of contents
 - [UiFormPluginFieldControl](#uiformpluginfieldcontrol)
 - [UiFormPluginJSONResponse](#uiformpluginjsonresponse)
 - [UiFormPluginPrefetch](#uiformpluginprefetch)
 - [UiFormPluginReCaptcha](#uiformpluginrecaptcha)
 - [UiFormPluginValidate](#uiformpluginvalidate)
 - [UiFormPluginValues](#uiformpluginvalues)

---

### UiFormPluginFieldControl
UiFormPluginFieldControl class - UiForm plugin for input states and errors.
The component extends [UiPlugin](https://github.com/squirrel-forge/ui-core/blob/main/docs/Abstracts.md#uiplugin) from [@squirrel-forge/ui-core](https://github.com/squirrel-forge/ui-core) module.

#### Component settings
Component settings are changed/extended as following.
```javascript
const extendConfig = {
    fields : {

        // Validation options
        // @type {Object}
        validate : {

            // Skip validation code
            // @type {boolean}
            skip : true,

            // Pure HTML5 validation only, no plugins will run
            // @type {boolean}
            pureHtml5 : false,

            // Error reporting level for each event
            // @type {Object}
            eventReporting : {
                blur : true,
                change : true,
            },
        },

        // Submit disabled control by event types
        // @type {Object}
        submit : {

            // Disable submit on events
            // @type {Array<string>}
            disableOn : [ 'loading', 'sending', 'success' ],

            // Enable submit on events
            // @type {Array<string>}
            enableOn : [ 'default', 'reset' ],

            // Show disabled error
            // @type {boolean}
            showDisabledError : true,

            // Field to use for the disabled error, defaults to fields.errors.global if not set
            // @type {null|string}
            output : null,

            // Error to show when clicking disabled submit
            // @type {string|Array|Function}
            disabledError : 'Form has errors or is already completed.',

            // Wraps the submit button to catch event when disabled
            // @type {string}
            disabledWrap : '<div data-ui-form-fields-submit-disabled />',
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
            'field.was.validated' : { classOn : 'input--was-validated' },
            'field.disabled' : { classOn : 'input--disabled' },
            'field.focus' : { classOn : 'input--focus', unsets : [ 'field.blur' ] },
            'field.blur' : { classOn : 'input--blur', unsets : [ 'field.focus' ] },
            'field.filled' : { classOn : 'input--filled', unsets : [ 'field.empty' ] },
            'field.empty' : { classOn : 'input--empty', unsets : [ 'field.filled' ] },
            'field.input' : { classOn : 'input--input', autoUnset : true },
            'field.change' : { classOn : 'input--change', autoUnset : true },
            'field.error' : { classOn : 'input--error' },
            'field.error.visible' : { classOn : 'input--error-visible' },
            'submit.disabled' : { classOn : 'button--disabled' },
            'group.disabled' : { classOn : 'input-group--disabled' },
            'group.error' : { classOn : 'input-group--error' },
            'group.error.visible' : { classOn : 'input-group--error-visible' },
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
            input : [ 'textarea-textarea', 'input-password', 'input-search', 'input-number', 'input-text', 'input-email', 'input-tel', 'input-url' ],
            change : [ 'select-select-one', 'select-select-multiple', 'input-checkbox', 'input-file', 'input-radio', 'input-range', 'input-date', 'input-color', 'input-time' ],
        },

        // Error handling
        // @type {Object}
        errors : {

            // Field to use for global errors
            // @type {string}
            global : 'general',

            // Only set error state
            // @type {boolean}
            onlyState : false,

            // Prefer group error instead of input error
            // @type {boolean}
            preferGroupOutput : true,

            // For grouped/array inputs show error on position input only
            // @type {null|number|'first'|'last'}
            showOnPositionOnly : null,

            // Render only first field error
            // @type {boolean}
            renderOnlyFirst : false,

            // String to use for joining errors on render
            // @type {string}
            renderJoinString : ', ',

            // Error render custom callback
            // @type {Function}
            renderCallback : null,

            // Clear field error on event
            // @type {Object}
            clearOnEvents : {
                state : [ 'focus' ],
                error : [ 'blur', 'change' ],
            },

            // Clear errors on form reset
            // @type {boolean}
            clearOnReset : true,

            // Clear errors on soft reset
            // @type {boolean}
            clearOnResetSoft : false,

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
        fields : 'input, select, textarea',

        // Disabled submit wrapper selector
        // @type {string}
        disabledSubmit : '[data-ui-form-fields-submit-disabled]',
    },
};
```

#### Class overview
```javascript
// Component event names: field.error
class UiFormPluginFieldControl extends UiPlugin {
  static pluginName : String
  constructor( options, context, debug ) {}
  setObjectFieldError( errors, error, field = null, params = [] ) {} // void
  submitDisable( state = true, only = null ) {} // void
  fieldSetState( element, state ) {} // HTMLElement
  fieldUnsetState( element, state ) {} // HTMLElement
  fieldIsState( element, state ) {} // boolean
  fieldIsValid( field, report ) {} // boolean
  clearAllFieldsErrors( error = true, visibility = true, only = null ) {} // void
  clearFieldErrors( input, error = true, visibility = true ) {} // void
  remapFieldsErrors( errors, options ) {} // void
  showFieldsErrors( errors, onlyState = null ) {} // void
  showFieldErrors( field, errors, onlyState = null ) {} // void
  fieldHasErrors( field ) {} // boolean
}
```
For more details check the [UiFormPluginFieldControl source file](../src/es6/Plugins/UiFormPluginFieldControl.js).

#### Fields markup
The default fields markup, representing the element structure, classes and relationships can be modified using the settings:
```html
<label class="input input--(focus|blur|change|filled|empty|required|valid|invalid|error|error-visible|disabled)">
    <!-- Regular inputs usually have the label before the input -->
    <strong class="input__label">:label</strong>
    <!-- The input wrapper contains one actual input -->
    <span class="input__input">
        <!-- Regular inputs -->
        <input type="text" name=":fieldname" />
        <textarea name=":fieldname"></textarea>

        <!-- Select requires an additional element to style the drop arrow reliably -->
        <select name=":fieldname">
            <option value=":value">:label</option>
        </select>
        <span class="input__pseudo"></span>

        <!-- For checkboxes and radio buttons we use an additional element for styling reliably -->
        <input type="checkbox" name=":fieldname" />
        <span class="input__pseudo"></span>
    </span>
    <!-- For checkboxes and radio buttons you might want to place the label after the input -->
    <strong class="input__label">:label</strong>
    <!-- To display an error we require a wrapper that can be used for the messge output -->
    <em class="input__error"></em>
</label>
```

If you wish to add an error output for something that is not an input, use following markup to add a unused/hidden input:
```html
<label class="input input--hidden input--disabled">
    <span class="input__input"><input type="hidden" name="general" disabled /></span>
    <em class="input__error"></em>
</label>
```
Use the *showFieldsErrors* or *showFieldErrors* methods to display customized error messages.

If you prefer a minimal setup, fields can define a personal error selector if there is no regular or group error output found,
this will select the first matching element within the form. They also do not require the **label** *.input* wrapper as a state host,
as the input can be the state host itself.
```html
<form>
    <input data-error-selector=".select-something .within-the-form" />
    <div class="select-something">
        <em class="within-the-form"></em>
    </div>
</form>
```

#### Field groups
To group inputs, allowing them to use one parent error output, use following markup:
```html
<fieldset class="input-group input-group--(error|error-visible)">
    <!-- multiple field inputs, radio buttons, checkboxes -->
    <em class="input-group__error"></em>
</fieldset>
```
States will still be set on the individual inputs, but the error display will use the group display and
therefore the inputs do not require individual outputs anymore, this can be tuned with the *fields.errors* options *preferGroupOutput* and *showOnPositionOnly*.

---

### UiFormPluginJSONResponse
UiFormPluginJSONResponse class - UiForm plugin for easy JSON response handling.
The component extends [UiPlugin](https://github.com/squirrel-forge/ui-core/blob/main/docs/Abstracts.md#uiplugin) from [@squirrel-forge/ui-core](https://github.com/squirrel-forge/ui-core) module.

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

        // Response data property to read response message from
        // @type {null|string}
        message : 'message',

        // Field to use for global errors, defaults to fields.errors.global if not set
        // @type {null|string}
        output : null,

        // Custom success callback
        // @type {null|Function|successCallback}
        successCallback : null,

        // Custom error callback
        // @type {null|Function|errorCallback}
        errorCallback : null,

        // Error used when none is available from the response
        // @type {string|Array|Function}
        unknown : 'An unknown error occured, please try again later.',
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
For more details check the [UiFormPluginJSONResponse source file](../src/es6/Plugins/UiFormPluginJSONResponse.js).

---

### UiFormPluginPrefetch
UiFormPluginPrefetch class - UiForm plugin for prefetching information or field values.
The component extends [UiPlugin](https://github.com/squirrel-forge/ui-core/blob/main/docs/Abstracts.md#uiplugin) from [@squirrel-forge/ui-core](https://github.com/squirrel-forge/ui-core) module.

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
  token : null|String
}
```
For more details check the [UiFormPluginPrefetch source file](../src/es6/Plugins/UiFormPluginPrefetch.js).

---

### UiFormPluginReCaptcha
UiFormPluginReCaptcha class - UiForm plugin for google recaptcha integration.
The component extends [UiPlugin](https://github.com/squirrel-forge/ui-core/blob/main/docs/Abstracts.md#uiplugin) from [@squirrel-forge/ui-core](https://github.com/squirrel-forge/ui-core) module.

#### Component settings
Component settings are changed/extended as following.
```javascript
// Event context: PluginContext|HTMLFormElement
// Events:
//  - recaptcha.load
//  - recaptcha.token
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

        // Recaptcha challenge input field name
        // @type {string}
        recaptchaChallengeField : '[name="g-recaptcha-response"]',

        // Recaptcha host element selector
        // @type {string}
        recaptchaHost : '[data-recaptcha-host]',

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
}
```
For more details check the [UiFormPluginReCaptcha source file](../src/es6/Plugins/UiFormPluginReCaptcha.js).

---

### UiFormPluginValidate
UiFormPluginValidate class - UiForm plugin for input and form validation.
The component extends [UiPlugin](https://github.com/squirrel-forge/ui-core/blob/main/docs/Abstracts.md#uiplugin) from [@squirrel-forge/ui-core](https://github.com/squirrel-forge/ui-core) module.

#### Component settings
Component settings are changed/extended as following.
```javascript
const extendConfig = {

    // Skip validation code, changes the default to: false
    // @type {boolean}
    skipValidate : false,

    // Extend validation options
    // @type {Object}
    validate : {

        // Only do states, do not run plugin showFieldsErrors or showFieldErrors
        // @type {boolean}
        onlyState : false,

        // Clear states on form reset
        // @type {boolean}
        clearOnReset : true,

        // Clear states on soft reset
        // @type {boolean}
        clearOnResetSoft : false,

        // Validator factory function
        // @type {Function}
        validator : null,
    },

    // Extend fields
    // @type {Object}
    fields : {

        // Input states and relations
        // @†ype {Object}
        states : {
            'field.valid' : { classOn : 'input--valid', unsets : [ 'field.invalid' ] },
            'field.invalid' : { classOn : 'input--invalid', unsets : [ 'field.valid' ] },
        },

        // Validation options
        // @type {Object}
        validate : {

            // Skip validation code, changes the default to: false
            // @type {boolean}
            skip : false,

            // Error reporting level for each event
            // @type {Object}
            eventReporting : {
                blur : 'error',
                input : 'state',
                change : 'error',
            },
        },
    },
};
```

#### Class overview
```javascript
class UiFormPluginValidate extends UiPlugin {
  static pluginName : String
  constructor( options, context, debug ) {}
  initComponent( context ) {} // void
  validateForm( report = 'error' ) {} // boolean
  validateField( input, report = 'error' ) {} // boolean
  lastErrors() {} // null|Object
}
```
For more details check the [UiFormPluginValidate source file](../src/es6/Plugins/UiFormPluginValidate.js).

---

### UiFormPluginValues
UiFormPluginValues class - UiForm plugin for input values handling.
The component extends [UiPlugin](https://github.com/squirrel-forge/ui-core/blob/main/docs/Abstracts.md#uiplugin) from [@squirrel-forge/ui-core](https://github.com/squirrel-forge/ui-core) module.

#### Component settings
Component settings are changed/extended as following.
```javascript
const extendConfig = {
    values : {

        // Enable input data change state
        // @type {boolean}
        changeState : false,

        // Set values as default values
        // @type {boolean}
        asDefault : true,
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
For more details check the [UiFormPluginValues source file](../src/es6/Plugins/UiFormPluginValues.js).

---

> [Form](Form.md) <[ Plugins ]> [Table of contents](../README.md#table-of-contents)

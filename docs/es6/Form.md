### @squirrel-forge/ui-core
> [Back to table of contents](../README.md)

# Documentation
### Javascript / Form
> [Table of contents](../README.md) <[ Form ]> [Plugins](Plugins.md)

## Table of contents
 - [FormValues](#FormValues)
 - [UiFormComponent](#UiFormComponent)

---

### FormValues
FormValues class - Class for handling form input values.

#### Class overview
```javascript
class FormValues {
  static input_info( name, value ) {} // Object
  static convert_from_flat( values ) {} // Object
  constructor( form, includeDisabled = false, debug = null ) {}
  debug : null|Console
  form : HTMLFormElement
  includeDisabled : Boolean
  get( flat = false, selector = 'input, select, textarea' ) {} // Object
  set( values, flat = false, errors = true ) {} // void
  inputs( field, errors = true ) {} // Array|NodeList
}
```
For more details check the [FormValues source file](../../src/es6/Form/FormValues.js).

---

### UiFormComponent
UiFormComponent class - Async form component with events and plugins support.

#### Component settings
Component settings might be changed or extended through plugins.
```javascript
const defaults = {

    // By default async is disabled
    // @type {boolean}
    async : false,

    // AsyncRequest default options see @squirrel-forge/ui-util for details
    // @type {Object}
    asyncOptions : {},

    // Validation, currently supports html5 validation
    // @type {boolean}
    validate : false,

    // Default state
    // @type {string}
    defaultState : 'initialized',

    // Default event
    // @type {string}
    defaultEvent : 'initialized',

    // States that allow the form to be sent
    // @type {Array<string>}
    sendableStates : [ 'initialized' ],

    // Reset the form if async submit encountered an error
    // @type {boolean}
    resetOnError : true,

    // Do only soft reset on error
    // @type {boolean}
    resetOnErrorSoft : true,

    // Add the submit button value to async request if available
    // @type {boolean}
    addSubmitValue : true,

    // Fake/hidden submit button used for internal submit handling
    // @type {string}
    fake : '<button class="ui-form-fake-submit" ... />',

    // Dom references
    // @type {Object}
    dom : {

        // Reset buttons
        // @type {string}
        reset : 'button[type="reset"], input[type="reset"]',

        // Submit buttons
        // @type {string}
        submit : 'button:not([type]), button[type="submit"], input[type="submit"]',

        // Fake/hidden internal submit button created through the fake option
        // @type {string}
        fake : '.ui-form-fake-submit',
    }
};
```

#### Class overview
```javascript
// Event names: initialized, progress, sending, submit, before.submit, async.modify, error, success, complete, reset
class UiFormComponent extends UiComponent {
  static make( form, settings = null, plugins = [], debug = null ) {} // UiFormComponent
  static makeAll( plugins = [], debug = null, context = document ) {} // UiFormComponent[]
  static selector : String
  constructor( element, settings = null, plugins = [], extend = [], init = true, debug = null ) {}
  init() {} // void
  bind() {} // void
  isValid() {} // boolean
  canSubmit() {} // boolean
  submit( silent = false ) {} // boolean
  abortSubmit() {} // void
  reset( soft = false ) {} // void
}
```
For more details check the [UiFormComponent source file](../../src/es6/Form/UiFormComponent.js).

---

> [Table of contents](../README.md) <[ Form ]> [Plugins](Plugins.md)

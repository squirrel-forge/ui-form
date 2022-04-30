### @squirrel-forge/ui-form
> [Back to table of contents](../README.md#table-of-contents)

# Documentation
### Javascript / Form
> [Table of contents](../README.md#table-of-contents) <[ Form ]> [Plugins](Plugins.md)

## Table of contents
 - [FormValues](#FormValues)
 - [Html5Validator](#Html5Validator)
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
For more details check the [FormValues source file](../src/es6/Form/FormValues.js).

---

### Html5Validator
Html5Validator class - Class for handling form field validation via html5 methods.

#### Class overview
```javascript
class Html5Validator {
  constructor( form, fields = 'input, select, textarea', debug = null ) {}
  errorAttribute : string
  reset() {} // void
  data() {} // Html5Validator
  valid( only ) {} // boolean
  errors() {} // null|Object
}
```
For more details check the [Html5Validator source file](../src/es6/Form/Html5Validator.js).

---

### UiFormComponent
UiFormComponent class - Async form component with events and plugins support.

#### Component settings
Component settings might be changed or extended through plugins.
```javascript
const defaults = {

    // By default async is disabled
    // @type {boolean}
    async : true,

    // AsyncRequest default options see @squirrel-forge/ui-util for details
    // @type {Object}
    asyncOptions : {},

    // Skip validation code
    // @type {boolean}
    skipValidate : false,

    // Pure HTML5 validation only, no plugins will run
    // @type {boolean}
    validatePureHtml5 : false,

    // Validation report level
    // @type {boolean}
    validateReport : true,

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
    fake : '<button data-ui-form-fake-submit ... />',

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
        fake : '[data-ui-form-fake-submit]',
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
  valid : Boolean
  init() {} // void
  bind() {} // void
  isValid( report = false ) {} // boolean
  canSubmit() {} // boolean
  submit( silent = false ) {} // boolean
  abortSubmit() {} // void
  reset( soft = false ) {} // void
}
```
For more details check the [UiFormComponent source file](../src/es6/Form/UiFormComponent.js).

#### Using the component
For details refer to the settings, class overview and code file mentioned above.
```javascript
import { UiFormComponent } from '@squirrel-forge/ui-form';

// Will initialize a specific form
UiFormComponent.make( document.querySelector( '.ui-form' ) );

// Will initialize all forms in the current document
UiFormComponent.makeAll();
```

#### Component markup
Following markup is required for an async form.
```html
<form is="ui-form" class="ui-form" action="" method="post" enctype="multipart/form-data"></form>
```
Set a JSON config the following way:
```html
<form data-config='{"option":{"name":true},"optionName":true}'></form>
```
Set individual config options via following attribute syntax:
```html
<!-- Will resolve to: option.name & optionName = true -->
<form data-option-name="true"></form>
```

---

> [Table of contents](../README.md#table-of-contents) <[ Form ]> [Plugins](Plugins.md)

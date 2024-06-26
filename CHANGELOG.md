# Changelog

## 0.11.0
 - Updated *FormComponent* to use the new *eventPrefix* option from ui-core to fix browser issues with the default *reset* event.
 - Added *disabled* state to *FormComponent* must be set via the corresponding instance property.
 - Updated *HTML5Validator* default property names for validate and error attributes.
 - Added *errorsToHTML()* for easy html conversion.
 - Updated *FormValues* to handle number input, fixed textarea and file setter and allow for any type of container.
 - Updated *UiFormPluginFieldControl* event prefix and map unknown errors to global option.
 - Updated *UiFormPluginJSONResponse* to allow for response code based errors.
 - Updated *UiFormPluginPrefetch* event prefix.
 - Updated *UiFormPluginReCaptcha* event prefix.

## 0.10.0
 - Added *UiFormTemplate* for rendering forms.
 - Added *UiFieldsetTemplate* for rendering fieldsets.
 - Added *UiInputTemplate* for rendering inputs.
 - Added sass modules for usage with the @use syntax.
 - Improve *FormValues* value setting and getting and fixed set as default.
 - Extend *Html5Validator* with some simple custom validation options and improve structure.
 - Updated folder structure.

## 0.9.13
 - Fixed *FormValues.get_input_value()* for checkboxes and radios that have an explicit empty value attribute.

## 0.9.12
 - Fixed *FormValues* not setting textarea value when using *FormValues.setAsDefault = true*.

## 0.9.11
 - Fixed *UiFormPluginReCaptcha* fixed condition for non blocking *no key available* error.
 - Updated *UiFormComponent* *before.submit* event prevented debug message.

## 0.9.10
 - Added *submit.click* event to *UiFormComponent*, fired when a submit button is clicked and the form is valid.
 - Modified internal submit button click event to only record button if not submitted via fake submit/programmatically.
 - Fixed *UiFormPluginReCaptcha* token submission and added *executeTimeout* option for error notification.
 - Added *recaptchaLoading* and *recaptchaError* local states to *UiFormPluginReCaptcha* plugin extending form states.

## 0.9.9
 - Added *reset* and *soft* arguments to *abortSubmit* method, both default to *true*.
 - Added *submit.aborted* event when using the *abortSubmit*, but is only fired if an actual request was aborted.
 - Added *setAsDefault* boolean property to *FormValues* class, default is *true*.
 - Added second argument *only* to *UiFormPluginFieldControl.disableSubmit()* method, can be *null* or an *Array* of submit buttons.
 - Ensure that *UiFormPluginFieldControl.event_default()* is only called when the corresponding form is initialized.
 - Added *FormValues.setValuesAsDefault* property, and updated setter methods to update values as default by default.
 - Added *values.asDefault* option to *UiFormPluginValues* plugin.
 - Updated *UiFormPluginReCaptcha* to allow for multiple submits, note that available options have changed.
 - Added some todo notes.

## 0.9.8
 - Fixed *UiFormPluginJSONResponse* wrong bracketing causing exception for error property checks.

## 0.9.7
 - Fixed *UiFormPluginReCaptcha* broken *dispatchEvent()* method calls.

## 0.9.6
 - Added *UiFormComponent.bindSubmits()* and *UiFormComponent.bindResets()* to allow for manual binding of submit and reset buttons.

## 0.9.5
 - Added *SubmitEvent* and *ClickedSubmit* references to *before.submit* and *sending* events on *UiFormComponent* if available.
 - Added *clickedSubmit* property to *UiFormComponent*, may be *null* if not submitted via button or on auto reset.
 - Only reset *clickedSubmit* on form reset.
 - Fixed more code docs.
 - Updated component event docs and extension references.

## 0.9.4
 - Fixed some code docs.
 - Removed dev imports.

## 0.9.3
 - Fixed *UiFormPluginJSONResponse* invalid "fields" plugin reference with "fieldcontrol".
 - Added some dev notes and reduced clearFieldErrors missing output reference from error to warning.

## 0.9.2
 - Fixed *UiFormPluginFieldControl* option *fields.errors.mapFields* and corresponding method, now maps correctly.

## 0.9.1
 - Added/updated *UiFormPluginFieldControl* disabled error and field options.
 - Added *UiFormPluginFieldControl.setObjectFieldError()* to add an error to an existing or new error object.
 - Synced *UiFormPluginJSONResponse* error/message/unknown output with *UiFormPluginFieldControl* and changed option *disabledErrors* to *disabledError*.

## 0.9.0
 - Form component and fields plugin *skipValidate* and *validate.skip* now also affect the pure html validate options.
 - Improved JSON response plugin error handling and added message property consumption as output error.
 - Changed JSON response plugin unknown option.
 - Remove recaptcha plugin execute callback.
 - Add *recaptcha.load* and *recaptcha.token* events to recaptcha plugin
 - Improve recaptcha plugin internal submit button fetching.
 - *UiFormComponent* only add submit value if available.
 - Updated dependencies.
 - Updated documentation.

## 0.8.0
 - Updated dependencies.
 - Updated documentation.
 - Removed *UiFormComponent.make()* and *UiFormComponent.makeAll()* in favor of new abstracts on *UiComponent*.
 - Updated *UiFormComponent* constructor.

## 0.7.0
 - Cleaned up the form validation logic, includes pure html5 option and plugins.
 - Added field validation support including pure html5 option and plugins.
 - Added submit onclick disabled error messages support.
 - Added *UiFormPluginValidate* and *Html5Validator* classes.
 - Added *FormValues.fieldname()* and *UiFormPluginValues.getFieldName()* methods.
 - Added *input-group* support for error states and display.
 - Fixed *input.error* and *input.error.visible* state and error clearing.
 - Changed *UiFormComponent* config option *async* default value to *true*.
 - Fixed *HTML5Validator.validate_field* handling for radio button groups.
 - Fixed *UiFormPluginValidate* field states for radio groups.
 - Updated documentation and dependencies.

## 0.6.0
 - Added validation events and states, *valid* and *invalid*.
 - Added validation plugin support.
 - Moved submit event validation to submit method, to reduce double calling.
 - Changed internal fake submit selector.

## 0.5.3
 - Fixed *UiFormPluginFieldControl* value states debug when disabled.
 - Fixed/completed *UiFormPluginFieldControl* input event binding types.

## 0.5.2
 - Fixed soft reset detect via attribute to use currentTarget which is always the button.

## 0.5.1
 - Fixed html5 form validation.
 - Change prefetch default *reloadOnError* to *false* and increase *reloadOnErrorDelay* to *5000*ms until a better solution comes up.

## 0.5.0
 - Initial prototype.

# Changelog

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

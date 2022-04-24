# Changelog

## 0.7.0
 - Cleaned up the form validation logic, includes pure html5 option and plugins.
 - Added field validation support including pure html5 option and plugins.
 - Added submit onclick disabled error messages support.
 - Added *UiFormPluginValidate* and *Html5Validator* classes.
 - Added *FormValues.fieldname()* and *UiFormPluginValues.getFieldName()* methods.
 - Updated docs.

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

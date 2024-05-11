/**
 * Requires
 */
import { Exception } from '@squirrel-forge/ui-util';
import { FormValues } from './FormValues.js';

/**
 * @typedef {Function} HTML5FieldValidator
 * @param {string} attr - Field validation attribute
 * @param {HTMLInputElement|HTMLTextAreaElement} field - Field to be validated
 * @return {null|string|string[]} - Null, override error or list of errors to append
 */

/**
 * Html5 validator exception
 * @class
 * @extends Exception
 */
class Html5ValidatorException extends Exception {}

/**
 * Html5 validator
 * @class
 */
export class Html5Validator {

    /**
     * Debug object
     * @private
     * @property
     * @type {null|console|Object}
     */
    #debug = null;

    /**
     * Form element
     * @private
     * @property
     * @type {null|HTMLFormElement}
     */
    #form = null;

    /**
     * Form fields references
     * @private
     * @property
     * @type {null|NodeList|Array}
     */
    #fields = null;

    /**
     * Validation errors
     * @private
     * @property
     * @type {null|Object}
     */
    #errors = null;

    /**
     * Custom error attribute name
     * @public
     * @property
     * @type {string}
     */
    errorAttribute = 'data-ui-form-html5-error';

    /**
     * Custom validation attribute name
     * @public
     * @property
     * @type {string}
     */
    validateAttribute = 'data-ui-form-html5-validate';

    /**
     * Custom field validator
     * @public
     * @property
     * @type {null|HTML5FieldValidator}
     */
    validateField = null;

    /**
     * Constructor
     * @constructor
     * @param {HTMLFormElement} form - Form element
     * @param {string|NodeList|Array} fields - Fields selector or list
     * @param {null|console|Object} debug - Debug object
     */
    constructor( form, fields = 'input, select, textarea', debug = null ) {
        if ( !( form instanceof HTMLFormElement ) ) {
            throw new Html5ValidatorException( 'Argument form must be a HTMLFormElement' );
        }
        this.#debug = debug;
        this.#form = form;
        this.#fields = fields;
        if ( typeof fields === 'string' ) {
            fields = form.querySelectorAll( fields );
        }
        if ( !( fields instanceof NodeList || fields instanceof Array ) ) {
            throw new Html5ValidatorException( 'Argument fields must be a string selector, NodeList or an Array of Elements' );
        }
    }

    #get_fields() {
        let fields = this.#fields;
        if ( typeof fields === 'string' ) {
            fields = this.#form.querySelectorAll( fields );
        }
        if ( !fields.length ) {
            throw new Html5ValidatorException( 'Argument fields must resolve to at least one element' );
        }
        return fields;
    }

    /**
     * Validate internal
     * @private
     * @param {null|string|Array} only - Limit to fieldname/s
     * @return {{valid: boolean, errors: {}}} - Status object
     */
    #validate( only ) {
        const fields = this.#get_fields();
        const status = { valid : true, errors : {} };
        for ( let i = 0; i < fields.length; i++ ) {
            const field = fields[ i ];
            const { name } = FormValues.input_info( field.name, null );
            if ( only === null || only === name || only instanceof Array && only.includes( name )  ) {
                if ( this.#debug ) this.#debug.log( this.constructor.name + '::validate', name );
                this.#validate_field( field, name, status );
            } else if ( this.#debug ) {
                this.#debug.log( this.constructor.name + '::validate Did not match criteria:', only, name, field );
            }
        }
        return status;
    }

    /**
     * Validate field
     * @private
     * @param {HTMLElement} field - Input field
     * @param {string} name - Fieldname
     * @param {Object} status - Status object
     * @return {void}
     */
    #validate_field( field, name, status ) {

        // Validate the field and get the default message
        let valid = field.checkValidity(),
            message = field.validationMessage,
            validator, custom_errors;

        // Radio groups must be validated as a group, or one might be valid while all others are not
        if ( field.type === 'radio' ) {
            const group = this.#form.querySelectorAll( '[name="' + field.getAttribute( 'name' ) + '"]' );
            message = group[ 0 ].validationMessage;

            // Catch custom validation info from first element only
            if ( group[ 0 ].hasAttribute( this.validateAttribute ) ) {
                validator = group[ 0 ].getAttribute( this.validateAttribute );
            }
            valid = false;
            for ( let i = 0; i < group.length; i++ ) {
                if ( group[ i ].checkValidity() ) {
                    valid = true;
                    break;
                }
            }
        } else if ( field.hasAttribute( this.validateAttribute ) ) {

            // If not a radio catch custom validation info if set
            validator = field.getAttribute( this.validateAttribute );
        }

        // Run the custom validation info
        if ( validator ) custom_errors = this.#run_validator( validator, field );

        // If not valid or has custom errors
        if ( !valid || custom_errors ) {
            status.valid = false;

            // Allow multiple errors
            if ( !status.errors[ name ] ) status.errors[ name ] = [];

            // Get error message
            if ( !valid && field.hasAttribute( this.errorAttribute ) ) {
                message = field.getAttribute( this.errorAttribute );
            }

            // Custom errors string overrides any other error message
            if ( typeof custom_errors === 'string' ) {
                message = custom_errors;
            }

            // Append error message
            if ( message && message.length ) {
                status.errors[ name ].push( message );
            }

            // Append any custom errors
            if ( custom_errors instanceof Array && custom_errors.length ) {
                status.errors[ name ].push( ...custom_errors );
            }
        }
    }

    /**
     * Run custom validator
     * @private
     * @param {string} info - Attribute value
     * @param {HTMLInputElement|HTMLTextAreaElement} field - Field element
     * @return {string|string[]|null} - Null or error/s
     */
    #run_validator( info, field ) {
        if ( this.#debug ) this.#debug.log( this.constructor.name + '::run_validator', info, field );
        if ( this.validateField ) {
            try {
                return this.validateField( info, field );
            } catch ( err ) {
                throw new Html5ValidatorException( 'Field validator caused an error', err );
            }
        }
        return null;
    }

    /**
     * Reset validator
     * @public
     * @return {Html5Validator} - Validator instance
     */
    reset() {
        this.#errors = null;
        return this;
    }

    /**
     * Set data interface not required for html5 validation
     * @public
     * @return {Html5Validator} - Validator instance
     */
    data() {
        return this;
    }

    /**
     * Validate
     * @param {null|string|Array} only - Limit to fieldname/s
     * @return {boolean} - Validation state
     */
    valid( only = null ) {
        if ( this.#debug ) this.#debug.log( this.constructor.name + '::valid', only );
        const status = this.#validate( only );
        this.#errors = status.valid ? null : status.errors;
        return status.valid;
    }

    /**
     * Get last validation errors
     * @return {Object|null} - Errors object
     */
    errors() {
        return this.#errors;
    }
}

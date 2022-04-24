/**
 * Requires
 */
import { Exception } from '@squirrel-forge/ui-util';

/**
 * Html5 validator exception
 * @class
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
    errorAttribute = 'data-html5-custom-error';

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
        if ( typeof fields === 'string' ) {
            fields = form.querySelectorAll( fields );
        }
        if ( !( fields instanceof NodeList || fields instanceof Array ) ) {
            throw new Html5ValidatorException( 'Argument fields must be a string selector or a NodeList' );
        }
        if ( !fields.length ) {
            throw new Html5ValidatorException( 'Argument fields must resolve to at least one element' );
        }
        this.#fields = fields;
    }

    /**
     * Validate internal
     * @private
     * @param {null|string|Array} only - Limit to fieldname/s
     * @return {{valid: boolean, errors: {}}} - Status object
     */
    #validate( only ) {
        const status = { valid : true, errors : {} };
        for ( let i = 0; i < this.#fields.length; i++ ) {
            const field = this.#fields[ i ];
            const name = field.name;
            if ( only === null || only === name || only instanceof Array && only.includes( name )  ) {
                this.#validate_field( field, name, status );
            } else if ( this.debug ) {
                this.debug.log( this.constructor.name + '::validate Did not match criteria:', only, name, field );
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
        if ( !field.checkValidity() ) {
            status.valid = false;

            // Allow multiple errors
            if ( !status.errors[ name ] ) status.errors[ name ] = [];

            // Get error message
            let message = field.validationMessage;
            if ( field.hasAttribute( this.errorAttribute ) ) {
                message = field.getAttribute( this.errorAttribute );
            }

            // Append error message
            if ( message && message.length ) {
                status.errors[ name ].push( message );
            } else if ( this.debug ) {
                this.debug.error( this.constructor.name + '::validate_field Could not resolve a valid error message:', name, field );
            }
        }
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

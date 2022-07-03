/**
 * Requires
 */
import {
    UiPlugin
} from '@squirrel-forge/ui-core';

// Import for local dev
// } from '../../../../ui-core';
import {
    Exception
} from '@squirrel-forge/ui-util';

// Import for local dev
// } from '../../../../ui-util';

/**
 * Ui form plugin validate exception
 * @class
 * @extends Exception
 */
class UiFormPluginValidateException extends Exception {}

/**
 * Ui form plugin validate
 * @class
 * @extends UiPlugin
 */
export class UiFormPluginValidate extends UiPlugin {

    /**
     * Plugin name getter
     * @static
     * @return {string} - Plugin name
     */
    static get pluginName() {
        return 'validate';
    }

    /**
     * Validator instance
     * @private
     * @property
     * @type {null|Object}
     */
    #validator = null;

    /**
     * Constructor
     * @constructor
     * @param {null|Object} options - Options object
     * @param {Object|UiFormComponent} context - Plugin context
     * @param {null|console|Object} debug - Debug object
     */
    constructor( options, context, debug ) {
        super( options, context, debug );

        // Extend default config
        this.extendConfig = {

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

        // Extend component states
        this.extendStates = {
            valid : {
                global : false,
                classOn : 'ui-form--valid',
                unsets : [ 'invalid' ],
            },
            invalid : {
                global : false,
                classOn : 'ui-form--invalid',
                unsets : [ 'valid' ],
            },
        };

        // Register events
        this.registerEvents = [
            [ 'reset', ( event ) => { this.#event_reset( event ); } ],
        ];
    }

    /**
     * Init component
     * @public
     * @param {Object|UiFormComponent} context - Plugin context
     * @return {void}
     */
    initComponent( context ) {

        // Bind form element events
        super.initComponent( context );

        // Create form validator if available
        const validator = this.context.config.get( 'validate.validator' );
        if ( typeof validator !== 'function' ) {
            throw new UiFormPluginValidateException( 'The validator option must be a constructor' );
        }
        this.#validator = validator( context );
    }

    /**
     * Reset event
     * @private
     * @param {Event} event - Reset event
     * @return {void}
     */
    #event_reset( event ) {
        const options = this.context.config.get( 'validate' );
        if ( event.detail && (
            !event.detail.soft && options.clearOnReset
            || event.detail.soft && options.clearOnResetSoft
        ) ) {

            // Unset form states
            this.context.states.unset( 'valid' );
            this.context.states.unset( 'invalid' );

            // Unset fields states
            const fields = this.context.getDomRefs( 'fields' );
            for ( let i = 0; i < fields.length; i++ ) {
                this.context.plugins.run( 'fieldUnsetState', [ fields[ i ], 'valid' ] );
                this.context.plugins.run( 'fieldUnsetState', [ fields[ i ], 'invalid' ] );
            }
        }
    }

    /**
     * Run validator
     * @param {string|Array} only - Only given fieldname/s
     * @return {boolean} - Validation result
     */
    #validate( only ) {
        const values = this.context.plugins.has( 'values' ) ? this.context.plugins.exec( 'values', 'getValues' ) : null;
        return this.#validator.data( values ).valid( only );
    }

    /**
     * Get fieldname from input
     * @param {HTMLElement} only - Input element
     * @return {string} - Fieldname
     */
    #get_field_name( only ) {
        let name = only;
        if ( only instanceof HTMLElement ) {
            name = this.context.plugins.exec( 'values', 'getFieldName', [ only ] );
        }
        if ( typeof name !== 'string' || !name.length ) {
            throw new UiFormPluginValidateException( 'Invalid fieldname: ' + only );
        }
        return name;
    }

    /**
     * Validate form
     * @param {boolean|'state'|'error'} report - Report level
     * @return {boolean} - Validation result
     */
    validateForm( report = 'error' ) {
        const valid = this.#validate();

        // Event data
        const form = this.context.dom;
        const data = { form, report };
        if ( !valid ) data.errors = this.#validator.errors();

        // Reporting
        if ( report ) {
            const event_state = valid ? 'valid' : 'invalid';
            this.context.states.set( event_state );
            this.context.dispatchEvent( event_state, data );

            // Set field errors/states
            const fields = this.context.getDomRefs( 'fields' );
            for ( let i = 0; i < fields.length; i++ ) {
                this.validateField( fields[ i ], report );
            }

            // Use fields error display and state
            if ( !valid && !this.context.config.get( 'validate.onlyState' ) ) {
                this.context.plugins.run( 'showFieldsErrors', [ data.errors, report === 'state' ] );
            }
        }
        return valid;
    }

    /**
     * Validate field
     * @param {string|HTMLElement} input - Input name or element
     * @param {boolean|'state'|'error'} report - Report level
     * @return {boolean} - Validation result
     */
    validateField( input, report = 'error' ) {

        // Event data
        const field = this.#get_field_name( input );
        const valid = this.#validate( field );
        const data = { field, input, report };
        if ( !valid ) data.errors = this.#validator.errors()[ field ];

        // Reporting
        if ( report ) {
            const event_state = valid ? 'valid' : 'invalid';
            let inputs = [ input ];
            if ( input.type === 'radio' ) {
                inputs = this.context.dom.querySelectorAll( '[name="' + input.getAttribute( 'name' ) + '"]' );
            }
            for ( let i = 0; i < inputs.length; i++ ) {
                this.context.plugins.run( 'fieldSetState', [ inputs[ i ], event_state ] );
            }
            this.context.dispatchEvent( 'field.' + event_state, data );

            // Use fields error display and state
            if ( !valid && !this.context.config.get( 'validate.onlyState' ) ) {
                this.context.plugins.run( 'showFieldErrors', [ field, data.errors, report === 'state' ] );
            }
        }
        return valid;
    }

    /**
     * Get last errors
     * @public
     * @return {null|Object} - Errors object
     */
    lastErrors() {
        return this.#validator.errors();
    }
}

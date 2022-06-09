/**
 * Requires
 */
import {
    UiPlugin,
    ElementClassStates
} from '@squirrel-forge/ui-core';

// Import for local dev
// } from '../../../../ui-core';
import {
    Exception,
    isPojo,
    isEmpty,
    getElementTagType,
    wrap,
    str2node
} from '@squirrel-forge/ui-util';

// Import for local dev
// } from '../../../../ui-util';

/**
 * Ui form plugin field control exception
 * @class
 */
class UiFormPluginFieldControlException extends Exception {}

/**
 * Ui form plugin field control
 * @class
 */
export class UiFormPluginFieldControl extends UiPlugin {

    /**
     * Plugin name getter
     * @public
     * @static
     * @return {string} - Plugin name
     */
    static get pluginName() {
        return 'fieldcontrol';
    }

    /**
     * Element class states
     * @private
     * @property
     * @type {null|Object|ElementClassStates}
     */
    #states = null;

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
                // @type {Array<string>}
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

                    // TODO: Prevent clear if not sendable/locked/completed?

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
    }

    /**
     * Init component
     *  Is run during construction, some things might not be available yet
     * @public
     * @param {Object|UiFormComponent} context - Plugin context
     * @return {void}
     */
    initComponent( context ) {

        // Register events
        //  Must be defined here since the defaultEvent might be modified during init by other plugins
        this.registerEvents = [
            [ this.context.config.exposed.defaultEvent, ( event ) => { this.#event_default( event ); } ],
            [ 'sending', ( event ) => { this.#event_sending( event ); } ],
            [ 'submit', ( event ) => { this.#submit_disabled_state( event ); } ],
            [ 'error', ( event ) => { this.#submit_disabled_state( event ); } ],
            [ 'complete', ( event ) => { this.#submit_disabled_state( event ); } ],
            [ 'reset', ( event ) => { this.#event_reset( event ); } ],
        ];

        // Bind form element events
        super.initComponent( context );

        // Prepare class states handler
        this.#states = new ElementClassStates( this.context.config.get( 'fields.states' ) );

        // Bind form input element events
        this.#bind_inputs( context );

        // Setup submit disabled error support
        this.#setup_submit_disable_support();
    }

    /**
     * Setup wrapper and handlers for disabled submit error support
     * @private
     * @return {void}
     */
    #setup_submit_disable_support() {
        const options = this.context.config.get( 'fields.submit' );

        // Wrap submits if showDisabledError is active
        if ( options.showDisabledError ) {
            const fake = this.context.getDomRefs( 'fake', false );
            const refs = this.context.getDomRefs( 'submit' );
            for ( let i = 0; i < refs.length; i++ ) {
                if ( refs[ i ] !== fake ) {

                    // Wrap submit
                    const wrapper = str2node( options.disabledWrap, false );
                    wrap( refs[ i ], wrapper );

                    // Bind event
                    wrapper.addEventListener( 'click', ( event ) => { this.#event_clickDisabled( event ); } );
                }
            }
        }
    }

    /**
     * Default event
     * @private
     * @param {Event} event - Default initialized|ready event
     * @return {void}
     */
    #event_default( event ) {
        this.#submit_disabled_state( event );
        this.#set_fields_initial_state( event );
    }

    /**
     * Sending event
     * @private
     * @param {Event} event - Sending event
     * @return {void}
     */
    #event_sending( event ) {
        this.#submit_disabled_state( event );
        this.clearAllFieldsErrors();
    }

    /**
     * Reset event
     * @private
     * @param {Event} event - Reset event
     * @return {void}
     */
    #event_reset( event ) {
        const options = this.context.config.get( 'fields.errors' );
        if ( event.detail && (
            !event.detail.soft && options.clearOnReset
            || event.detail.soft && options.clearOnResetSoft
        ) ) {
            this.clearAllFieldsErrors();
        }
        this.#submit_disabled_state( event );
    }

    /**
     * Input events
     * @private
     * @param {Event} event - Input events
     * @param {HTMLElement} element - Input element
     * @return {void}
     */
    #event_input( event, element ) {
        const host = this.fieldSetState( element, event.type );
        this.#field_value_state( event, element, host );
        this.#field_clear_error( event, element );
        this.#field_validation( event, element );
        if ( this.debug ) this.debug.log( this.constructor.name + '::event_input', event.type, element, host );
    }

    /**
     * Submit disabled event
     * @private
     * @param {Event} event - Click event
     * @return {void}
     */
    #event_clickDisabled( event ) {
        if ( event.currentTarget && event.currentTarget.firstElementChild.disabled ) {
            const options = this.context.config.get( 'fields.submit' );
            const errors = {};
            this.setObjectFieldError( errors, options.disabledError, options.output, [ event, this ] );
            this.context.plugins.run( 'showFieldsErrors', [ errors, null, this ] );
        }
    }

    /**
     * Set field error on object
     * @param {Object} errors - Errors object target
     * @param {string|Array|Function} error - Error value
     * @param {null|string} field - Optional error field property name, default: config.fields.errors.global
     * @param {Array} params - Optional value function arguments
     * @return {void}
     */
    setObjectFieldError( errors, error, field = null, params = [] ) {
        if ( !isPojo( errors ) ) {
            throw new UiFormPluginFieldControlException( 'Argument errors must be a plain object reference' );
        }

        /**
         * Every check callback
         * @param {*} v - Value to check
         * @return {boolean} - True if valid
         */
        const all_strings = ( v ) => { return typeof v === 'string' && v.length; };

        // Get default field if not set
        if ( !field || !field.length ) field = this.context.config.get( 'fields.errors.global' );

        // Process value
        if ( typeof error === 'function' ) {
            error = error( ...params, this.context );
        }

        // Validate error value
        if ( !( typeof error === 'string' && error.length || error instanceof Array && error.every( all_strings ) ) ) {
            throw new UiFormPluginFieldControlException( 'Argument value must be a non empty String, Array or Function' );
        }

        // Should be an array
        if ( !( errors[ field ] instanceof Array ) ) {
            errors[ field ] = errors[ field ] ? [ errors[ field ] ] : [];
        }

        // Join or append value
        if ( error instanceof Array ) {
            errors[ field ] = errors[ field ].concat( error );
        } else {
            errors[ field ].push( error );
        }
    }

    /**
     * Field clear error on event
     * @private
     * @param {Event} event - Input event
     * @param {HTMLElement} element - Input element
     * @return {void}
     */
    #field_clear_error( event, element ) {
        const events = this.context.config.get( 'fields.errors.clearOnEvents' );
        if ( events ) {
            const error = events.state && events.state.includes( event.type );
            const visibility = events.error && events.error.includes( event.type );
            if ( error || visibility ) {
                let inputs = [ element ];
                const group = this.#get_host( element, 'group' );
                if ( group && group !== element ) {
                    inputs = group.querySelectorAll( this.context.config.get( 'dom.fields' ) );
                }
                this.#loop_inputs( inputs, ( input ) => {
                    this.clearFieldErrors( input, error, visibility );
                }, true );
            }
        }
    }

    /**
     * Field state method
     * @private
     * @param {HTMLElement} element - Input element
     * @param {string} state - Field state name
     * @param {string} method - State method
     * @return {HTMLElement} - State host
     */
    #field_state( element, state, method = 'set' ) {
        const host = this.#get_host( element, 'input' );
        const state_name = 'field.' + state;
        if ( this.#states.has( state_name ) ) this.#states[ method ]( state_name, host );
        return host;
    }

    /**
     * Set field state
     * @public
     * @param {HTMLElement} element - Input element
     * @param {string} state - Field state name
     * @return {HTMLElement} - State host
     */
    fieldSetState( element, state ) {
        return this.#field_state( element, state );
    }

    /**
     * Unset field state
     * @public
     * @param {HTMLElement} element - Input element
     * @param {string} state - Field state name
     * @return {HTMLElement} - State host
     */
    fieldUnsetState( element, state ) {
        return this.#field_state( element, state, 'unset' );
    }

    /**
     * Field is state
     * @public
     * @param {HTMLElement} element - Input element
     * @param {string} state - Field state name only
     * @return {null|boolean} - Null if state does not exist
     */
    fieldIsState( element, state ) {
        const host = this.#get_host( element, 'input' );
        const state_name = 'field.' + state;
        if ( this.#states.has( state_name ) ) return this.#states.is( state_name, host );
        return null;
    }

    /**
     * Run field validation
     * @private
     * @param {Event} event - Input event
     * @param {HTMLElement} element - Input element
     * @return {void}
     */
    #field_validation( event, element ) {
        const options = this.context.config.get( 'fields.validate' );

        // Skip validation
        if ( options.skip ) return;

        // Check for validation events
        const events = Object.keys( options.eventReporting );
        if ( events.includes( event.type ) ) {
            this.fieldIsValid( element, options.eventReporting[ event.type ] );
        }
    }

    /**
     * Field is valid
     * @public
     * @param {HTMLElement} field - Input element
     * @param {undefined|null|'state'|'error'|boolean} report - Report level
     * @return {boolean} - True if field is valid
     */
    fieldIsValid( field, report ) {
        const options = this.context.config.get( 'fields.validate' );

        // Skip validation
        if ( options.skip ) return true;

        // Pure html5 validation
        if ( options.pureHtml5 ) {

            // Check if we have just validated
            const host = this.#get_host( field );
            const state = 'field.was.validated';

            // Prevent reporting if we are revalidating,
            // this prevents an unwanted focus loop on the input if it is invalid
            if ( this.#states.is( state, host ) ) {
                report = false;
                this.#states.unset( state, host );
            } else {
                this.#states.set( state, host );
            }

            // Validate with default html5
            const check = report ? 'reportValidity' : 'checkValidity';
            if ( !field[ check ]() ) {
                if ( this.debug ) this.debug.log( this.constructor.name + '::fieldIsValid Field data invalid using:', check );
                return false;
            }
            return true;
        }

        // Plugin validation
        const results = this.context.plugins.run( 'validateField', [ field, report ] );
        let is_valid = true;
        const reasons = [];
        const entries = Object.entries( results );
        for ( let i = 0; i < entries.length; i++ ) {
            const [ plugin, result ] = entries[ i ];
            if ( result === false ) {
                is_valid = false;
                reasons.push( plugin );
            }
        }

        // Notify reasons
        if ( this.debug && !is_valid ) {
            this.debug.log( this.constructor.name + '::fieldIsValid Field invalid, reasons:', reasons );
        }
        return is_valid;
    }

    /**
     * Set value type by event type
     * @private
     * @param {Event} event - Event
     * @param {HTMLElement} input - Input element
     * @param {HTMLElement} host - State host element
     * @return {void}
     */
    #field_value_state( event, input, host ) {
        const options = this.context.config.get( 'fields' );
        if ( options.valueStates && options.eventRules[ event.type ] ) {
            const elements = options.eventRules[ event.type ];
            if ( this.context.plugins.has( 'values' ) ) {
                const plugin = this.context.plugins.get( 'values' );
                const type = getElementTagType( input );
                if ( elements === '*' || elements.includes( type ) ) {
                    const method = 'get_' + input.tagName.toLowerCase() + '_value';
                    const value = plugin.values[ method ]( input );
                    this.#states.set( isEmpty( value ) ? 'field.empty' : 'field.filled', host );
                }
            } else if ( this.debug ) {
                this.debug.warn( this.constructor.name + '::field_value_state No values plugin available' );
            }
        } else if ( options.valueStates && this.debug ) {
            this.debug.warn( this.constructor.name + '::field_value_state Unknown event type:', event );
        }
    }

    /**
     * Set submit disabled state by event type
     * @private
     * @param {Event} event - Event
     * @return {void}
     */
    #submit_disabled_state( event ) {
        const options = this.context.config.get( 'fields.submit' );
        if ( options && options.disableOn instanceof Array && options.enableOn instanceof Array ) {
            const type = event.type === this.context.config.exposed.defaultEvent ? 'default' : event.type;
            if ( options.disableOn.includes( type ) ) {
                this.submitDisable();
            } else if ( options.enableOn.includes( type ) ) {
                this.submitDisable( false );
            }
        }
    }

    /**
     * Set field initial state
     * @private
     * @param {Event} event - Event object
     * @return {void}
     */
    #set_fields_initial_state( event ) {
        this.#loop_inputs( this.context, ( element ) => {

            // Set value state
            this.#event_input( event, element );
        } );
    }

    /**
     * Get event host
     * @private
     * @param {HTMLElement} element - Input element
     * @param {('input'|'group')} type - Host type
     * @param {('state'|'error')} which - Target type
     * @return {HTMLElement} - Selected host element
     */
    #get_host( element, type = 'input', which = 'state' ) {
        const selector = this.context.config.exposed.fields.selectors[ type ];

        // Given selector exists with at least a state
        if ( selector && selector.state ) {
            const host = element.closest( selector.state );

            // Only if we have a host
            if ( host ) {
                if ( which === 'state' ) {
                    return host;
                } else {

                    // Get relation element
                    const nested = host.querySelector( selector[ which ] );
                    if ( nested ) return nested;
                }
            }
        }

        // If error selector but with an individual selector from element
        if ( which === 'error' ) {
            const attr = element.getAttribute( this.context.config.exposed.fields.errors.attrErrorSelector );
            if ( attr && attr.length ) {
                const form = this.context.dom.querySelector( attr );
                if ( form ) return form;
                const doc = document.querySelector( attr );
                if ( doc ) return doc;
            }
            return null;
        }
        return element;
    }

    /**
     * Bind form input events
     * @private
     * @param {Object|UiFormPluginFieldControl} context - Plugin object
     * @return {void}
     */
    #bind_inputs( context ) {
        const options = this.context.config.get( 'fields' );
        this.#loop_inputs( context, ( element ) => {

            // Cycle all event types
            for ( let j = 0; j < options.bindEvents.length; j++ ) {
                const eventName = options.bindEvents[ j ];
                if ( options.eventRules[ eventName ] ) {
                    const matches = options.eventRules[ eventName ];
                    const type = getElementTagType( element );
                    if ( matches === '*' || matches.includes( type ) ) {
                        element.addEventListener( eventName, ( event ) => { this.#event_input( event, element ); } );
                    }
                }
            }
        } );
    }

    /**
     * Set submit disabled
     * @public
     * @param {boolean} state - False to enable all submits
     * @return {void}
     */
    submitDisable( state = true ) {
        if ( this.debug ) this.debug.log( this.constructor.name + '::submitDisable', state ? 'Disabled' : 'Enabled' );
        const fake = this.context.getDomRefs( 'fake', false );
        const refs = this.context.getDomRefs( 'submit' );
        for ( let i = 0; i < refs.length; i++ ) {
            if ( refs[ i ] !== fake ) {
                refs[ i ].disabled = state;
                if ( this.#states.has( 'submit.disabled' ) ) {
                    this.#states[ state ? 'set' : 'unset' ]( 'submit.disabled', refs[ i ] );
                }
            }
        }
    }

    /**
     * Loop over form inputs
     * @private
     * @param {Array|NodeList|Object|UiFormPluginFieldControl} context - PLugin object or list of inputs
     * @param {Function} callback - Element callback
     * @param {boolean} hidden - Use hidden fields, default: false
     * @return {void}
     */
    #loop_inputs( context, callback, hidden = false ) {
        const elements = context.getDomRefs ? context.getDomRefs( 'fields' ) : context;
        if ( elements && elements.length ) {
            for ( let i = 0; i < elements.length; i++ ) {
                const element = elements[ i ];

                // Skip all hidden elements
                if ( !hidden && element.type && element.type === 'hidden' ) {
                    continue;
                }

                try {
                    callback( element );
                } catch ( e ) {
                    throw new UiFormPluginFieldControlException( 'Loop inputs broke, argument callback caused an error', e );
                }
            }
        }
    }

    /**
     * Validate errors object
     * @private
     * @param {Object} errors - Errors object
     * @return {void}
     */
    #validate_errors( errors ) {
        if ( !isPojo( errors ) ) {
            throw new UiFormPluginFieldControlException( 'Argument errors must be a plain Object' );
        }
    }

    /**
     * Clear fields errors
     * @public
     * @param {boolean} error - Clear error state
     * @param {boolean} visibility - Clear error
     * @param {null|Array} only - Limit to given input names
     * @return {void}
     */
    clearAllFieldsErrors( error = true, visibility = true, only = null ) {
        if ( !error && !visibility ) return;
        this.#loop_inputs( this.context, ( element ) => {
            if ( !only || !only.length || only.includes( element.name ) ) {
                this.clearFieldErrors( element, error, visibility );
            }
        }, true );
    }

    /**
     * Clear field errors
     * @public
     * @param {HTMLElement} input - Input element
     * @param {boolean} error - Clear error state
     * @param {boolean} visibility - Clear error
     * @return {void}
     */
    clearFieldErrors( input, error = true, visibility = true ) {
        if ( !error && !visibility ) return;
        const host = this.#get_host( input );
        let group = this.#get_host( input, 'group' );
        if ( group === input ) group = null;
        if ( host ) {
            if ( error ) {
                this.#states.unset( 'field.error', host );
                if ( group ) this.#states.unset( 'group.error', group );
            }
            if ( visibility ) {
                this.#states.unset( 'field.error.visible', host );
                if ( group ) this.#states.unset( 'group.error.visible', group );
                const host_output = this.#get_host( input, 'input', 'error' );
                const group_output = this.#get_host( input, 'group', 'error' );
                if ( host_output ) host_output.innerHTML = '';
                if ( group && group_output ) group_output.innerHTML = '';
                if ( !host_output && !group_output && this.debug ) {
                    this.debug.error( this.constructor.name + '::clearFieldErrors Could not find error output for:', input );
                }
            }
        } else if ( this.debug ) {
            this.debug.error( this.constructor.name + '::clearFieldErrors Could not find state host for', input );
        }
    }

    /**
     * Remap errors object
     * @public
     * @param {Object} errors - Errors object
     * @param {Object} options - Field control options
     * @return {void}
     */
    remapFieldsErrors( errors, options ) {
        this.#validate_errors( errors );
        if ( options.mapFields ) {

            // Callback overrides regular mapping
            if ( typeof options.mapFields === 'function' ) {
                options.mapFields( errors, options, this );
                return;
            }

            // Rewrite with a from->to map
            const map = Object.entries( options.mapFields );
            for ( let i = 0; i < map.length; i++ ) {
                const [ from, to ] = map[ i ];
                if ( errors[ from ] ) {

                    // Append errors to existing
                    if ( !options.replaceMapped && errors[ to ] ) {
                        errors[ to ] = errors[ to ].concat( errors[ from ] );
                    } else {

                        // Set remapped error
                        errors[ to ] = errors[ from ];
                    }

                    // Remove old field
                    if ( options.removeMapped ) {
                        delete errors[ from ];
                    }
                }
            }
        }
    }

    /**
     * Show fields errors
     * @public
     * @param {Object} errors - Errors object
     * @param {null|boolean} onlyState - Only set state
     * @return {void}
     */
    showFieldsErrors( errors, onlyState = null ) {
        this.#validate_errors( errors );
        const options = this.context.config.get( 'fields.errors' );
        if ( onlyState === null ) {
            onlyState = options.onlyState;
        } else if ( typeof onlyState !== 'boolean' ) {
            onlyState = false;
        }

        // Map errors
        this.remapFieldsErrors( errors, options );

        // Cycle and render errors
        const entries = Object.entries( errors );
        for ( let i = 0; i < entries.length; i++ ) {
            const [ key, value ] = entries[ i ];
            this.showFieldErrors( key, value, onlyState );
        }

        // Scroll to first error
        this.#scroll_to_first_error( options );
    }

    /**
     * Scroll to first natural error
     * @private
     * @param {Object} options - Fields error options
     * @return {void}
     */
    #scroll_to_first_error( options ) {
        if ( options.scrollToFirst ) {
            if ( !( options.scrollToFirst === true || typeof options.scrollToFirst === 'function' ) ) {
                throw new UiFormPluginFieldControlException( 'Config option scrollToFirst must be falsy, true or a Function' );
            }

            // Find first field in natural order with an error
            let target;
            const inputs = this.context.getDomRefs( 'fields' );
            for ( let i = 0; i < inputs.length; i++ ) {
                if ( this.fieldHasErrors( inputs[ i ].name ) ) {
                    target = this.#get_host( inputs[ i ] );
                    break;
                }
            }

            // If we have a target select the scroll method
            if ( target ) {
                if ( this.debug ) this.debug.log( this.constructor.name + '::scroll_to_first_error Scrolling to:', target );
                if ( options.scrollToFirst === true ) {
                    target.scrollIntoView();
                } else {
                    options.scrollToFirst( target );
                }
            } else if ( this.debug ) {
                this.debug.warn( this.constructor.name + '::scroll_to_first_error No field with errors found' );
            }
        }
    }

    /**
     * Get field related inputs
     * @private
     * @param {string} field - Field name
     * @return {NodeList|Array} - Field related input elements
     */
    #get_field_inputs( field ) {
        let inputs;
        if ( this.context.plugins.has( 'values' ) && field.includes( '.' ) ) {
            inputs = this.context.plugins.exec( 'values', 'getInputs', [ field ] );
        } else {
            inputs = this.context.dom.querySelectorAll( '[name="' + field + '"]' );

            // Fallback mainly for multiple selects/file inputs
            if ( !inputs.length ) {
                inputs = this.context.dom.querySelectorAll( '[name="' + field + '[]"]' );
            }
        }
        return inputs;
    }

    /**
     * Field has errors check
     * @public
     * @param {string} field - Field name
     * @return {boolean} - True if input or group have errors
     */
    fieldHasErrors( field ) {

        // Get field inputs
        const inputs = this.#get_field_inputs( field );

        // Notify not found
        if ( !inputs || !inputs.length ) {
            throw new UiFormPluginFieldControlException( 'No inputs found for field:' + field );
        }

        // Get errors for inputs
        for ( let i = 0; i < inputs.length; i++ ) {
            const input = inputs[ i ];
            const host = this.#get_host( input );
            let group = this.#get_host( input, 'group' );
            if ( group === input ) group = null;
            if ( host ) {
                if ( this.#states.is( 'field.error', host ) ) return true;
                if ( group && this.#states.is( 'group.error', group ) ) return true;
            } else if ( this.debug ) {
                this.debug.error( this.constructor.name + '::fieldHasErrors Could not find state host for', input );
            }
        }
        return false;
    }

    /**
     * Show field errors
     * @public
     * @param {string} field - Field name
     * @param {Object} errors - Errors object
     * @param {null|boolean} onlyState - Only set state
     * @return {void}
     */
    showFieldErrors( field, errors, onlyState = null ) {
        if ( typeof field !== 'string' || !field.length ) {
            throw new UiFormPluginFieldControlException( 'Argument field must be a non empty string' );
        }

        // Enforce errors as Array
        if ( !( errors instanceof Array ) ) errors = [ errors ];

        // Only state option
        const options = this.context.config.get( 'fields.errors' );
        if ( onlyState === null ) {
            onlyState = options.onlyState;
        } else if ( typeof onlyState !== 'boolean' ) {
            onlyState = false;
        }

        // Get field inputs
        const inputs = this.#get_field_inputs( field );

        // Notify not found
        if ( !inputs || !inputs.length ) {
            if ( this.debug ) this.debug.error( this.constructor.name + '::showFieldErrors No inputs found for field:', field );
            return;
        }

        // Get show position option
        let show_pos = options.showOnPositionOnly;
        const named_pos = { first : 1, last : inputs.length };
        switch ( typeof show_pos ) {
        case 'string' :
            show_pos = named_pos[ show_pos ] ? named_pos[ show_pos ] : null;
            break;
        case 'number' :
            if ( show_pos > named_pos.last ) {
                show_pos = named_pos.last;
            } else if ( show_pos < 1 ) {
                show_pos = 1;
            }
            break;
        default :
            show_pos = 0;
        }

        // Set errors for inputs
        for ( let i = 0; i < inputs.length; i++ ) {
            const input = inputs[ i ];
            const host = this.#get_host( input );
            let group = this.#get_host( input, 'group' );
            if ( group === input ) group = null;
            if ( host ) {
                this.#states.set( 'field.error', host );
                if ( group ) this.#states.set( 'group.error', group );
                if ( !onlyState ) {
                    if ( !show_pos || i === show_pos - 1 ) {
                        const host_output = this.#get_host( input, 'input', 'error' );
                        const group_output = this.#get_host( input, 'group', 'error' );
                        if ( options.preferGroupOutput && group && group_output ) {
                            if ( !this.#render_errors( errors, group_output, options ) ) {
                                this.#states.set( 'group.error.visible', group );
                            }
                        } else if ( host_output ) {
                            if ( !this.#render_errors( errors, host_output, options ) ) {
                                this.#states.set( 'field.error.visible', host );
                            }
                        } else if ( this.debug ) {
                            this.debug.error( this.constructor.name + '::showFieldErrors Could not find error output for:', input );
                        }
                        if ( show_pos ) break;
                    } else if ( this.debug ) {
                        this.debug.warn( this.constructor.name + '::showFieldErrors Skipped ' + ( i + 1 ) + '/' + show_pos + ':', input );
                    }
                } else if ( this.debug ) {
                    this.debug.warn( this.constructor.name + '::showFieldErrors Only state for:', input );
                }
            } else if ( this.debug ) {
                this.debug.error( this.constructor.name + '::showFieldErrors Could not find state host for:', input );
            }

            // Dispatch as field event
            this.context.dispatchEvent( 'field.error', { input, host, group, field, errors } );
        }
    }

    /**
     * Render field errors
     * @private
     * @param {Object} errors - Errors object
     * @param {HTMLElement} output - Output element
     * @param {Object} options - Field control options
     * @return {boolean} - True if error visible state should not be added
     */
    #render_errors( errors, output, options ) {
        const not_allowed = [ 'img', 'link', 'input', 'textarea', 'select', 'button', 'br' ];
        if ( !( output instanceof HTMLElement ) || not_allowed.includes( output.tagName.toLowerCase() ) ) {
            if ( this.debug ) this.debug.error( this.constructor.name + '::render_errors Invalid error render output:', output );
            return;
        }
        let no_show_state = false;
        if ( options.renderCallback ) {
            no_show_state = options.renderCallback( errors, output, options, this );
        } else if ( errors instanceof Array ) {
            if ( options.renderOnlyFirst ) {
                errors = errors.shift();
            } else {
                errors = [ ...new Set( errors ) ].join( options.renderJoinString );
            }
            no_show_state = !( errors && errors.length );
            output.innerHTML = errors;
        } else {
            throw new UiFormPluginFieldControlException( 'Argument errors must always be an Array' );
        }
        return no_show_state;
    }
}

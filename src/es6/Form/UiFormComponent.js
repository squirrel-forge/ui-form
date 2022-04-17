/**
 * Requires
 */
import { UiComponent } from '@squirrel-forge/ui-core';
import { AsyncRequest, Exception, cloneObject, appendHTML, bindNodeList } from '@squirrel-forge/ui-util';

/**
 * Ui form component exception
 */
class UiFormComponentException extends Exception {}

/**
 * Ui form component
 * @class
 */
export class UiFormComponent extends UiComponent {

    /**
     * Make ui-form component
     * @param {HTMLFormElement} form - Form
     * @param {null|Object} settings - Config object
     * @param {Array} plugins - Plugins array
     * @param {null|false|console|Object} debug - Debug object
     * @return {UiFormComponent} - Component object
     */
    static make( form, settings = null, plugins = [], debug = null ) {
        if ( debug === null ) {
            const value = form.getAttribute( 'debug' ) || form.getAttribute( 'data-debug' );
            if ( UiFormComponent.configValueFromAttr( value ) === true ) {
                debug = console;
            }
        } else if ( debug === true ) {
            debug = console;
        }
        return new UiFormComponent( form, settings, plugins, [], true, debug );
    }

    /**
     * Initialize all ui-form elements in context
     * @param {Array} plugins - Plugins array
     * @param {null|console|Object} debug - Debug object
     * @param {document|HTMLElement} context - Context to initialize
     * @return {Array<UiFormComponent>} - Initialized components
     */
    static makeAll( plugins = [], debug = null, context = document ) {
        const result = [];
        const forms = context.querySelectorAll( UiFormComponent.selector );
        for ( let i = 0; i < forms.length; i++ ) {
            result.push( this.make( forms[ i ], null, plugins, debug ) );
        }
        return result;
    }

    /**
     * Element selector getter
     * @public
     * @return {string} - Element selector
     */
    static get selector() {
        return 'form[is="ui-form"]:not([data-state])';
    }

    /**
     * Async request
     * @private
     * @property
     * @type {null|AsyncRequest}
     */
    #request = null;

    /**
     * Clicked submit button
     * @private
     * @property
     * @type {null|HTMLButtonElement|HTMLInputElement}
     */
    #clicked_submit = null;

    /**
     * Constructor
     * @constructor
     * @param {HTMLFormElement} element - Form element
     * @param {null|Object} settings - Config object
     * @param {Array<Function|Array<Function,*>>} plugins - Plugins to load
     * @param {Array<Object>} extend - Extend default config
     * @param {boolean} init - Run init method
     * @param {null|console|Object} debug - Debug object
     */
    constructor( element, settings = null, plugins = [], extend = [], init = true, debug = null ) {

        // Check element type
        if ( !( element instanceof HTMLFormElement ) ) throw new UiFormComponentException( 'Argument element must be a HTMLFormElement' );

        /**
         * Default config
         * @type {Object}
         */
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
            fake : '<button class="ui-form-fake-submit" type="submit" style="'
                + 'z-index:-1;position:fixed;left:-1000px;width:1px;height:1px;'
                + 'padding:0;margin:0;border:0;opacity:0.01'
                + '" tabindex="-1" />',

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

        /**
         * Default states
         * @type {Object}
         */
        const states = {
            initialized : {
                classOn : 'ui-form--initialized',
                unsets : [ 'sending', 'success', 'error', 'complete' ],
            },
            sending : {
                classOn : 'ui-form--sending',
            },
            success : {
                classOn : 'ui-form--success',
                unsets : [ 'sending' ],
            },
            error : {
                classOn : 'ui-form--error',
                unsets : [ 'sending' ],
            },
            complete : {
                global : false,
                classOn : 'ui-form--complete',
            },
        };

        // Initialize parent
        super( element, settings, defaults, extend, states, plugins, init, debug );
    }

    /**
     * Initialize component
     * @public
     * @return {void}
     */
    init() {

        // No default html5 validation, is triggered by code
        this.dom.noValidate = true;

        // Add fake submit
        const fake = this.config.exposed.fake;
        if ( fake ) appendHTML( this.dom, fake );

        // Bind events
        this.bind();

        // Complete init
        super.init();
    }

    /**
     * Bind component related events
     * @public
     * @return {void}
     */
    bind() {

        // Reset buttons
        const resets = this.getDomRefs( 'reset' );
        if ( resets && resets.length ) {
            bindNodeList( resets, [
                [ 'click', ( event ) => {
                    event.preventDefault();
                    this.reset( event.target.getAttribute( 'data-soft' ) === 'true' );
                } ],
            ] );
        }

        // Submit buttons
        const submits = this.getDomRefs( 'submit' );
        if ( !submits || !submits.length ) {
            throw new UiFormComponentException( 'Form requires at least one submit button' );
        }
        bindNodeList( submits, [
            [ 'click', ( event ) => { this.#event_submitClick( event, event.currentTarget ); } ],
        ] );

        // Form events
        this.addEventList( [
            [ 'submit', ( event ) => { this.#event_submit( event ); } ],
            [ 'sending', ( event ) => { this.event_state( event ); } ],
            [ 'success', ( event ) => { this.event_state( event ); } ],
            [ 'error',  ( event ) => { this.event_state( event ); } ],
            [ 'complete', ( event ) => { this.#event_complete( event ); } ],
        ] );
    }

    /**
     * Event complete handler
     * @param {Event} event - Complete event
     * @return {void}
     */
    #event_complete( event ) {
        this.event_state( event );

        // Reset after submit failed with an error response
        if ( event.detail.target.error && this.config.get( 'resetOnError' ) ) {
            this.reset( this.config.get( 'resetOnErrorSoft' ) );
        }
    }

    /**
     * Event submit handler
     * @param {Event} event - Submit event
     * @return {void}
     */
    #event_submit( event ) {

        // Cannot be submitted
        if ( !this.canSubmit( true ) ) {
            event.preventDefault();
            if ( this.debug ) this.debug.log( this.constructor.name + '::event_submit form not submittable' );
            return;
        }

        // Allow plugins and external handlers to prevent submission
        this.dispatchEvent( 'before.submit', { event } );

        // Form validation
        if ( !this.isValid() ) event.preventDefault();

        // Abort submit, default behaviour was prevented
        if ( event.defaultPrevented ) {
            if ( this.debug ) this.debug.group( this.constructor.name + '::event_submit default prevented via before.submit event' );
            return;
        }

        // Prevent actual submit for ajax mode
        if ( this.config.exposed.async ) {

            // Prevent default form submission
            event.preventDefault();

            // Send via async request
            this.#submit_async();
        }

        // Begin sending
        this.states.set( 'sending' );
        this.dispatchEvent( 'sending' );

        // Clear clicked submit button
        this.#clicked_submit = null;
    }

    /**
     * Check if form is valid
     * @public
     * @param {boolean} report - Report errors
     * @return {boolean} - True if valid
     */
    isValid( report = false ) {
        const options = this.config.exposed.validate;
        if ( options ) {

            // Default html5 validation
            if ( options === true ) {

                // Check if silent or report
                const check = report ? 'reportValidity' : 'checkValidity';
                if ( this.dom[ check ] && !this.dom[ check ]() ) {
                    if ( this.debug ) this.debug.log( this.constructor.name + '::isValid Validate prevented submit' );
                    return false;
                }
            } else if ( this.debug ) {

                // TODO: run plugins custom validation!
                this.debug.warn( this.constructor.name + '::isValid NOT IMPLEMENTED: validation plugins', options, report );
            }
        }
        return true;
    }

    /**
     * Event submit click
     * @private
     * @param {Event} event - Click event
     * @param {HTMLButtonElement} button - Button element
     * @return {void}
     */
    #event_submitClick( event, button ) {
        if ( this.debug ) this.debug.log( this.constructor.name + '::event_submitClick', event, button );

        // Submit click validation
        if ( !this.isValid( true ) ) {
            event.preventDefault();
            return;
        }

        // Remember click target
        if ( this.config.exposed.addSubmitValue ) {
            this.#clicked_submit = button;
        }
    }

    /**
     * Async form submit
     * @private
     * @return {void}
     */
    #submit_async() {

        // Get async default options
        const options = cloneObject( this.config.exposed.asyncOptions );

        // Set url and method from form element only if not specified
        if ( !options.url ) options.url = this.dom.getAttribute( 'action' );
        if ( !options.method ) options.method = this.dom.getAttribute( 'method' );

        // Create request and set self as parent, to allow event bubbling of: progress, success, error and complete
        this.#request = new AsyncRequest( options, this, this.debug );

        // Send as form data
        const data = new FormData( this.dom );

        // Add submit value
        if ( this.#clicked_submit && this.#clicked_submit.name && this.#clicked_submit.value ) {
            data.append( this.#clicked_submit.name, this.#clicked_submit.value );
            this.#clicked_submit = null;
        }
        if ( this.debug ) this.debug.log( this.constructor.name + '::submit_async', options, data );

        // Send
        this.#request.send( data, ( processed, request ) => {

            // Allow plugins and external handlers to modify submission data
            this.dispatchEvent( 'async.modify', { processed, request } );
        } );
    }

    /**
     * Can submit
     * @public
     * @param {boolean} silent - Set true for a boolean result
     * @return {boolean} - Submittable state
     */
    canSubmit( silent = false ) {
        let can_submit = true;
        if ( !this.config.exposed.sendableStates.includes( this.states.global ) ) {
            if ( !silent ) {
                if ( this.states.is( 'complete' ) ) throw new UiFormComponentException( 'Form already sent' );
                throw new UiFormComponentException( 'Form not submittable' );
            }
            can_submit = false;
        }
        return can_submit;
    }

    /**
     * Submit form
     * @public
     * @param {boolean} silent - Set true for a boolean result
     * @return {boolean} - Submitted state
     */
    submit( silent = false ) {
        if ( this.canSubmit( silent ) && this.config.exposed.fake ) {
            const fake = this.getDomRefs( 'fake', false );
            if ( fake && fake.click ) {
                fake.click();
            } else {
                throw new UiFormComponentException( 'No fake submit available' );
            }
            return true;
        } else if ( this.debug ) {
            this.debug.error( this.constructor.name + '::submit Not a submittable state or no fake submit defined' );
        }
        return false;
    }

    /**
     * Abort async submit
     * @public
     * @return {void}
     */
    abortSubmit() {
        if ( this.#request ) {
            this.#request.abort();
            this.#request = null;
        }
    }

    /**
     * Reset form
     * @public
     * @param {boolean} soft - True to perform soft reset only
     * @return {void}
     */
    reset( soft = false ) {
        this.abortSubmit();
        if ( !soft ) this.dom.reset();
        this.#clicked_submit = null;
        this.states.set( this.config.get( 'defaultState' ) );
        this.dispatchEvent( 'reset', { soft } );
    }
}

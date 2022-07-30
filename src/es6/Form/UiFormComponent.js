/**
 * Requires
 */
import { UiComponent } from '@squirrel-forge/ui-core';
import { AsyncRequest, Exception, cloneObject, appendHTML, bindNodeList } from '@squirrel-forge/ui-util';

/**
 * Ui form component exception
 * @class
 * @extends Exception
 */
class UiFormComponentException extends Exception {}

/**
 * Ui form component
 * @class
 * @extends UiComponent
 */
export class UiFormComponent extends UiComponent {

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
     * @param {Object} defaults - Default config
     * @param {Array<Object>} extend - Extend default config
     * @param {Object} states - States definition
     * @param {Array<Function|Array<Function,*>>} plugins - Plugins to load
     * @param {null|UiComponent} parent - Parent object
     * @param {null|console|Object} debug - Debug object
     * @param {boolean} init - Run init method
     */
    constructor(
        element,
        settings = null,
        defaults = null,
        extend = null,
        states = null,
        plugins = null,
        parent = null,
        debug = null,
        init = true
    ) {

        // Check element type
        if ( !( element instanceof HTMLFormElement ) ) throw new UiFormComponentException( 'Argument element must be a HTMLFormElement' );

        /**
         * Default config
         * @type {Object}
         */
        defaults = defaults || {

            // Run in async mode, default true
            // @type {boolean}
            async : true,

            // AsyncRequest default options see @squirrel-forge/ui-util for details
            // @type {Object}
            asyncOptions : {},

            // Skip validation code
            // @type {boolean}
            skipValidate : true,

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
            fake : '<button data-ui-form-fake-submit type="submit" style="'
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
                fake : '[data-ui-form-fake-submit]',
            }
        };

        /**
         * Default states
         * @type {Object}
         */
        states = states || {
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
        super( element, settings, defaults, extend, states, plugins, parent, debug, init );
    }

    /**
     * Initialize component
     * @public
     * @return {void}
     */
    init() {

        // No default html5 validation
        // it's triggered by code in the isValid method
        this.dom.noValidate = true;

        // Add fake submit
        const fake = this.config.get( 'fake' );
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
        if ( resets && resets.length ) this.bindResets( resets );

        // Submit buttons
        const submits = this.getDomRefs( 'submit' );
        if ( !submits || !submits.length ) {
            throw new UiFormComponentException( 'Form requires at least one submit button' );
        }
        this.bindSubmits( submits );

        // Form events
        this.addEventList( [
            [ 'valid', ( event ) => { this.event_state( event ); } ],
            [ 'invalid', ( event ) => { this.event_state( event ); } ],
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

        // TODO: check for no submit and if a submit button is focused within the form
        // if ( !this.#clicked_submit && this.config.get( 'clickedSubmitDetect' ) ) {}

        // Cannot be submitted
        if ( !this.canSubmit( true ) ) {
            event.preventDefault();
            if ( this.debug ) this.debug.log( this.constructor.name + '::event_submit form not submittable' );
            return;
        }

        // Add some info to the sending event
        const event_data = { event : event, button : this.#clicked_submit };

        // Allow plugins and external handlers to prevent submission
        if ( !this.dispatchEvent( 'before.submit', event_data ) || event.defaultPrevented ) {
            if ( this.debug ) {
                this.debug.log( this.constructor.name + '::event_submit default prevented via isValid method or before.submit event' );
            }
            return;
        }

        // Prevent actual submit for ajax mode
        if ( this.config.get( 'async' ) ) {

            // Prevent default form submission
            event.preventDefault();

            // Send via async request
            this.#submit_async();
        }

        // Begin sending
        this.states.set( 'sending' );
        this.dispatchEvent( 'sending', event_data );
    }

    /**
     * Clicked submit getter
     * @public
     * @return {null|HTMLButtonElement} - Submit button if available
     */
    get clickedSubmit() {
        return this.#clicked_submit;
    }

    /**
     * Valid state getter
     * @public
     * @return {boolean} - True if valid
     */
    get valid() {
        return this.isValid( false );
    }

    /**
     * Bind reset buttons
     * @public
     * @param {Array|NodeList} resets - List of reset buttons
     * @return {void}
     */
    bindResets( resets ) {
        if ( resets instanceof Array || resets instanceof NodeList && resets.length ) {
            bindNodeList( resets, [
                [ 'click', ( event ) => {
                    event.preventDefault();
                    this.reset( event.currentTarget.getAttribute( 'data-soft' ) === 'true' );
                } ],
            ] );
        }
    }

    /**
     * Bind list of submit buttons
     * @public
     * @param {Array|NodeList} submits List of submit buttons
     * @return {void}
     */
    bindSubmits( submits ) {
        if ( submits instanceof Array || submits instanceof NodeList && submits.length ) {
            bindNodeList( submits, [
                [ 'click', ( event ) => { this.#event_submitClick( event, event.currentTarget ); } ],
            ] );
        }
    }

    /**
     * Check if form is valid
     * @public
     * @param {boolean} report - Report errors
     * @return {boolean} - True if valid
     */
    isValid( report = false ) {

        // Skip validation
        if ( this.config.get( 'skipValidate' ) ) return true;

        // Pure html5 validation
        if ( this.config.get( 'validatePureHtml5' ) ) {
            const check = report ? 'reportValidity' : 'checkValidity';
            if ( !this.dom[ check ]() ) {
                if ( this.debug ) this.debug.log( this.constructor.name + '::isValid Form data invalid using:', check );
                return false;
            }
            return true;
        }

        // Plugin validation
        const results = this.plugins.run( 'validateForm', [ report ] );
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
            this.debug.log( this.constructor.name + '::isValid Form invalid, reasons:', reasons );
        }
        return is_valid;
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
        if ( !this.isValid( this.config.get( 'validateReport' ) ) ) {

            // Swallow the event and pretend it never happened
            event.preventDefault();
            event.stopPropagation();

            // Prevents other click handlers, like the recaptcha plugin from running
            event.stopImmediatePropagation();
            return;
        }

        // Remember click target
        this.#clicked_submit = button;
    }

    /**
     * Async form submit
     * @private
     * @return {void}
     */
    #submit_async() {

        // Get async default options
        const options = cloneObject( this.config.get( 'asyncOptions' ) );

        // Set url and method from form element only if not specified
        if ( !options.url ) options.url = this.dom.getAttribute( 'action' );
        if ( !options.method ) options.method = this.dom.getAttribute( 'method' );

        // Create request and set self as parent, to allow event bubbling of: progress, success, error and complete
        this.#request = new AsyncRequest( options, this, this.debug );

        // Send as form data
        const data = new FormData( this.dom );

        // Add submit value
        if ( this.config.get( 'addSubmitValue' )
            && this.#clicked_submit
            && this.#clicked_submit.name
            && this.#clicked_submit.value
        ) data.append( this.#clicked_submit.name, this.#clicked_submit.value );
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
        if ( !this.config.get( 'sendableStates' ).includes( this.states.global ) ) {
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
     * @param {undefined|null|'state'|'error'|boolean} report - Report errors
     * @param {boolean} silent - Set true for a boolean result
     * @return {boolean} - Submitted state
     */
    submit( report, silent = false ) {
        if ( this.canSubmit( silent ) ) {
            const fake = this.getDomRefs( 'fake', false );
            if ( !fake || !fake.click ) {
                throw new UiFormComponentException( 'No fake submit available' );
            }
            if ( typeof report === 'undefined' ) report = this.config.get( 'validateReport' );
            if ( this.isValid( report ) ) {
                fake.click();
                return true;
            }
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

        // TODO: check cross browser consistency, firefox seems to reset the form on reset event.
        this.dispatchEvent( 'reset', { soft } );
    }
}

/**
 * Requires
 */
import { UiPlugin } from '@squirrel-forge/ui-core';
import { Exception, appendHTML } from '@squirrel-forge/ui-util';

/**
 * Ui form plugin recaptcha exception
 * @class
 * @extends Exception
 */
class UiFormPluginReCaptchaException extends Exception {}

/**
 * Ui form plugin recaptcha
 * @class
 * @extends UiPlugin
 */
export class UiFormPluginReCaptcha extends UiPlugin {

    /**
     * Plugin name getter
     * @static
     * @return {string} - Plugin name
     */
    static get pluginName() {
        return 'recaptcha';
    }

    /**
     * Last challende token generated
     * @private
     * @property
     * @type {null|string}
     */
    #token = null;

    /**
     * Execute timeout
     * @private
     * @property
     * @type {null|number}
     */
    #timeout = null;

    /**
     * ReCaptcha host
     * @private
     * @property
     * @type {null|HTMLElement}
     */
    #host = null;

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
            recaptcha : {

                // Google recaptcha sitekey
                //  Must be set to enable plugin, can be set via data-recaptcha-key attribute on the form
                // @type {null|string}
                sitekey : null,

                // ReCaptcha options
                // @type {Object}
                options : { size : 'invisible' },

                // Loader callback name
                // @type {string}
                loaderName : 'grecaptchaOnLoad',

                // Token callback name
                // @type {string}
                setTokenName : 'grecaptchaSetToken',

                // Append a recaptcha host element if none is defined
                // @type {(null|'form'|'body'|HTMLElement)}
                appendHost : 'form',

                // Recaptcha host element if appended
                // @type {string}
                host : '<div data-recaptcha-host />',

                // Script source including the loaderName option callback
                // @type {string}
                script : 'https://www.google.com/recaptcha/api.js?onload=grecaptchaOnLoad',

                // Script marker attribute, used for dom.recaptchaScript selector
                // @type {string}
                scriptAttribute : 'data-recaptcha-script',

                // Recaptcha execute method timeout
                // @type {number}
                executeTimeout : 120000,
            },

            // Dom references
            // @type {Object}
            dom : {

                // Recaptcha challenge input field name
                // @type {string}
                recaptchaChallengeField : '[name="g-recaptcha-response"]',

                // Recaptcha host element selector
                // @type {string}
                recaptchaHost : '[data-recaptcha-host]',

                // Recaptcha script selector
                // @type {string}
                recaptchaScript : '[data-recaptcha-script]',
            },
        };

        // Extend component states
        this.extendStates = {
            recaptchaLoading : { global : false, classOn : 'ui-form--recaptcha-loading' },
            recaptchaError : { global : false, classOn : 'ui-form--recaptcha-error' },
        };

        // Event prefix
        const prefix = ( this.context.config.get( 'eventPrefix' ) || '' );

        // Register events
        this.registerEvents = [
            [ prefix + 'submit.click', ( event ) =>  { this.#event_submitClick( event ); } ],
            [ prefix + 'reset', () =>  { this.#event_reset(); } ],
        ];
    }

    /**
     * Init component
     * @public
     * @param {Object|UiFormComponent} context - Plugin context
     * @return {void}
     */
    initComponent( context ) {
        super.initComponent( context );
        const options = this.context.config.get( 'recaptcha' );

        // Notify not running
        if ( !options.sitekey || !options.sitekey.length ) {
            if ( this.debug ) this.debug.error( this.constructor.name + '::initComponent ReCaptcha requires a sitekey' );
            return;
        }

        // Require host element
        this.#require_host( options );

        // Set global recaptcha callback
        this.#register_globals( options );

        // Require the recaptcha script
        this.#require_script( options );
    }

    /**
     * Challenge token getter
     * @public
     * @return {string|null} - Challenge token if available
     */
    get token() {
        return this.#token;
    }

    /**
     * Reset event
     * @return {void}
     */
    #event_reset() {
        this.#token = null;
        if ( window.grecaptcha ) window.grecaptcha.reset();
    }

    /**
     * Event submit.click
     * @private
     * @param {Event} event - Submit click event
     * @return {void}
     */
    #event_submitClick( event ) {

        // If there is no token then we need fetch one first
        if ( !this.#token ) {
            if ( this.context.states.is( 'recaptchaError' ) ) this.context.states.unset( 'recaptchaError' );
            this.context.states.set( 'recaptchaLoading' );

            // Execute on and prevent submit event by preventing click and propagation
            if ( window.grecaptcha ) {
                event.preventDefault();
                event.stopPropagation();
                window.grecaptcha.execute();

                // Timeout error state
                const options = this.context.config.get( 'recaptcha' );
                if ( options.executeTimeout ) {
                    this.#timeout = window.setTimeout( () => {
                        this.context.states.unset( 'recaptchaLoading' );
                        this.context.states.set( 'recaptchaError' );
                        throw new UiFormPluginReCaptchaException( 'grecaptcha.execute() is very slow or timed out' );
                    }, options.executeTimeout );
                }
            } else {
                this.context.states.set( 'recaptchaError' );
                throw new UiFormPluginReCaptchaException( 'Missing window.grecaptcha Object' );
            }
        }
    }

    /**
     * Require a host element
     * @private
     * @param {Object} options - Plugin options
     * @return {void}
     */
    #require_host( options ) {
        let exists = this.context.getDomRefs( 'recaptchaHost', false );
        if ( !exists ) {
            let parent = this.context.dom;
            if ( options.appendHost === 'document' ) {
                parent = document.body;
            } else if ( options.appendHost instanceof HTMLElement ) {
                if ( !options.appendHost.isConnected ) {
                    throw new UiFormPluginReCaptchaException( 'The appendHost option element must be connected' );
                }
                parent = options.appendHost;
            }
            appendHTML( parent, options.host );
            exists = this.context.getDomRefs( 'recaptchaHost', false );
        }
        if ( !exists ) {
            throw new UiFormPluginReCaptchaException( 'A host element is required for ReCaptcha to render' );
        }
        this.#host = exists;
    }

    /**
     * Callback for recaptcha script load
     * @private
     * @param {Object} options - Plugin options
     * @return {void}
     */
    #callback_loader( options ) {
        if ( window.grecaptcha ) {

            // Event prefix
            const prefix = ( this.context.config.get( 'eventPrefix' ) || '' );

            // Fire interceptable load event
            if ( !this.context.dispatchEvent( prefix + 'recaptcha.load', { plugin : this }, true, true ) ) {
                if ( this.debug ) this.debug.log( this.constructor.name + '::callback_loader Cancelled by ' + prefix + 'recaptcha.load event' );
                return;
            }

            // Get options and render
            const grecaptchaOptions = options.options;
            grecaptchaOptions.sitekey = options.sitekey;
            grecaptchaOptions.callback = options.setTokenName;
            if ( this.debug ) this.debug.log( this.constructor.name + '::callback_loader Render ReCaptcha', grecaptchaOptions );
            window.grecaptcha.render( this.#host, grecaptchaOptions );
        } else {
            throw new UiFormPluginReCaptchaException( 'Loader missing window.grecaptcha Object' );
        }
    }

    /**
     * Callback for recaptcha set token
     * @private
     * @param {string} token - Token to verify
     * @return {void}
     */
    #callback_setToken( token ) {
        if ( this.debug ) this.debug.log( this.constructor.name + '::callback_setToken', token );
        if ( this.#timeout ) {
            window.clearTimeout( this.#timeout );
            this.#timeout = null;
        }
        this.#token = token;

        /* TODO: set token for each form when using multiple forms?
        const inputs = this.context.getDomRefs( 'recaptchaChallengeField' );
        if ( inputs.length ) {
            for ( let i = 0; i < inputs.length; i++ ) {
                inputs[ i ].setAttribute( 'value', token );
            }
        }
        */

        // Event prefix
        const prefix = ( this.context.config.get( 'eventPrefix' ) || '' );
        this.context.states.unset( 'recaptchaLoading' );
        if ( this.context.dispatchEvent( prefix + 'recaptcha.token', { token : token, plugin : this }, true, true ) ) {
            this.context.submit();
        }
    }

    /**
     * Register global callbacks
     * @private
     * @param {Object} options - Plugin options
     * @return {void}
     */
    #register_globals( options ) {

        // Check for free names
        if ( window[ options.loaderName ] ) {
            throw new UiFormPluginReCaptchaException( 'Loader name is already taken: ', options.loaderName );
        }
        if ( window[ options.setTokenName ] ) {
            throw new UiFormPluginReCaptchaException( 'Set token name is already taken: ', options.setTokenName );
        }

        /**
         * GreCaptcha plugin loader callback
         * @public
         * @return {void}
         */
        window[ options.loaderName ] = () => { this.#callback_loader( options ); };

        /**
         * Set recaptcha token and submit
         * @public
         * @param {string} token - ReCaptcha token
         * @return {void}
         */
        window[ options.setTokenName ] = ( token ) => { this.#callback_setToken( token, options ); };
    }

    /**
     * Require the recaptcha script
     * @private
     * @param {Object} options - Plugin options
     * @return {void}
     */
    #require_script( options ) {
        const exists = this.context.getDomRefs( 'recaptchaScript', false );
        if ( exists ) {
            throw new UiFormPluginReCaptchaException( 'ReCaptcha script already set' );
        }
        const script = document.createElement( 'script' );
        script.setAttribute( options.scriptAttribute, '' );
        script.async = true;
        script.defer = true;
        script.src = options.script;
        document.body.appendChild( script );
    }
}

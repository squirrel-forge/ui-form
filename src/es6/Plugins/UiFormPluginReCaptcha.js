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
            },

            // Dom references
            // @type {Object}
            dom : {

                // Recaptcha host element selector
                // @type {string}
                recaptchaHost : '[data-recaptcha-host]',

                // Recaptcha submit button selector
                // @type {string}
                recaptchaSubmit : '[data-recaptcha-submit]',

                // Recaptcha script selector
                // @type {string}
                recaptchaScript : '[data-recaptcha-script]',
            },
        };

        // Register events
        this.registerEvents = [
            [ 'reset', () =>  { this.#event_reset(); } ],
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
        if ( !options.sitekey ) {
            if ( this.debug ) this.debug.error( this.constructor.name + '::initComponent ReCaptcha requires a sitekey' );
            return;
        }

        // Require host element
        this.#require_host( options );

        // Set global recaptcha callback
        this.#register_globals( options );

        // Bind submit button
        this.#bind_submit();

        // Require the recaptcha script
        this.#require_script( options );
    }

    /**
     * Reset event
     * @return {void}
     */
    #event_reset() {
        if ( window.grecaptcha ) window.grecaptcha.reset();
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
     * Get marked or first submit
     * @private
     * @return {null|HTMLButtonElement} - Submit button
     */
    #get_submit() {
        const submit = this.context.getDomRefs( 'recaptchaSubmit', false );
        if ( submit ) return submit;
        const fake = this.context.getDomRefs( 'fake', false );
        const refs = this.context.getDomRefs( 'submit' );
        for ( let i = 0; i < refs.length; i++ ) {
            if ( refs[ i ] !== fake ) {
                return refs[ i ];
            }
        }
        return null;
    }

    /**
     * Callback for recaptcha script load
     * @private
     * @param {Object} options - Plugin options
     * @return {void}
     */
    #callback_loader( options ) {
        if ( window.grecaptcha ) {
            const submit = this.#get_submit();
            if ( !submit ) {
                throw new UiFormPluginReCaptchaException( 'Requires a ReCaptcha marked submit button' );
            }

            // Fire interceptable load event
            if ( !this.context.dispatchEvent( 'recaptcha.load', { plugin : this }, true, true ) ) {
                if ( this.debug ) this.debug.log( this.constructor.name + '::callback_loader Cancelled by recaptcha.load event' );
                return;
            }

            // Should not cause submit if in async mode, but allow setToken callback to submit when ready
            if ( this.context.config.get( 'async' ) ) {
                submit.type = 'button';
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
        if ( this.context.dispatchEvent( 'recaptcha.token', { token : token, plugin : this }, true, true ) ) {
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
     * Event submit click
     * @private
     * @return {void}
     */
    #event_submitClick() {
        if ( window.grecaptcha ) {
            if ( this.context.isValid( true ) ) {
                window.grecaptcha.execute();
            } else if ( this.debug ) {
                this.debug.warn( this.constructor.name + '::event_submitClick Form data is invalid' );
            }
        } else {
            throw new UiFormPluginReCaptchaException( 'Submit missing window.grecaptcha Object' );
        }
    }

    /**
     * Bind submit click
     * @private
     * @return {void}
     */
    #bind_submit() {
        const submit = this.#get_submit();
        if ( !submit ) {
            throw new UiFormPluginReCaptchaException( 'Requires a ReCaptcha marked submit button' );
        }
        submit.addEventListener( 'click', () => { this.#event_submitClick(); } );
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

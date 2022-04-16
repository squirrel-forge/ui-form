/**
 * Requires
 */
import { UiPlugin } from '@squirrel-forge/ui-core';
import { Exception, AsyncRequest, cloneObject, mergeObject, isPojo } from '@squirrel-forge/ui-util';

/**
 * Ui form plugin prefetch exception
 * @class
 */
class UiFormPluginPrefetchException extends Exception {}

/**
 * Ui form plugin prefetch
 * @class
 */
export class UiFormPluginPrefetch extends UiPlugin {

    /**
     * Plugin name getter
     * @static
     * @return {string} - Plugin name
     */
    static get pluginName() {
        return 'prefetch';
    }

    /**
     * Async request
     * @private
     * @property
     * @type {null|AsyncRequest}
     */
    #request = null;

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

            // Changes default state to ready
            // @type {string}
            defaultState : 'ready',

            // Changes default event to ready
            // @type {string}
            defaultEvent : 'ready',

            // Extends sendable states
            // @type {Array<string>}
            sendableStates : [ 'ready' ],

            // Prefetch options
            // @type {Object}
            prefetch : {

                // AsyncRequest default options see @squirrel-forge/ui-util for details
                // @type {Object}
                asyncOptions : {},

                // Request method for prefetch request
                // @type {string}
                method : 'post',

                // Prefetch url, must be set to use prefetch
                // @type {null|string}
                url : null,

                // Response fields data property
                // @type {string}
                fields : 'fields',

                // Use flat fields data type
                // @type {boolean}
                flatFields : false,

                // Custom prefetch callback, replaces default request
                // @type {null|Function}
                prefetchCallback : null,

                // Custom response callback, runs in addition to fields set
                // @type {null|Function}
                responseCallback : null,

                // Refetch request on reset
                // @type {boolean}
                refetchOnReset : true,

                // Refetch request on soft reset
                // @type {boolean}
                refetchOnResetSoft : false,

                // Reload page on error
                // @type {boolean}
                reloadOnError : true,

                // Reload after delay
                // @type {number}
                reloadOnErrorDelay : 3000,
            },
        };

        // Extend component states
        this.extendStates = {
            loading : { classOn : 'ui-form--loading' },
            ready : {
                classOn : 'ui-form--ready',
                unsets : [ 'loading', 'sending', 'success', 'error', 'complete' ],
            },
            sending : { unsets : [ 'ready' ] },
            error : { unsets : [ 'loading' ] },
        };

        // Register events
        this.registerEvents = [
            [ 'initialized', () => { this.#event_initialized(); } ],
            [ 'reset', ( event ) => { this.#event_reset( event ); } ],
        ];
    }

    /**
     * Initialized event
     * @private
     * @return {void}
     */
    #event_initialized() {
        this.context.states.set( 'loading' );
        if ( !this.#prefetch() ) {
            this.#ready();
        }
    }

    /**
     * Reset event
     * @private
     * @param {Event} event - Reset event
     * @return {void}
     */
    #event_reset( event ) {
        const options = this.context.config.get( 'prefetch' );
        if ( event.detail && (
            !event.detail.soft && options.refetchOnReset
            || event.detail.soft && options.refetchOnResetSoft
        ) ) {
            this.#event_initialized();
        }
    }

    /**
     * Run prefetch
     * @private
     * @return {boolean} - True if running
     */
    #prefetch() {
        const options = this.context.config.get( 'prefetch' );
        if ( options !== null ) {

            // Must be object
            if ( !isPojo( options ) ) {
                throw new UiFormPluginPrefetchException( 'Invalid prefetch options, must be a string or a plain Object' );
            }

            /**
             * Success callback
             * @return {void}
             */
            const success_callback = () => { this.#ready(); };

            /**
             * Error callback
             * @param {*} e - Error
             * @return {void}
             */
            const error_callback = ( e ) => { this.#prefetch_error( e ); };

            // Custom sync callback
            if ( options.prefetchCallback ) {
                try {
                    options.prefetchCallback( success_callback, error_callback, this );
                } catch ( e ) {
                    throw new UiFormPluginPrefetchException( 'Error while running prefetchCallback', e );
                }
                return true;
            } else if ( options.url ) {
                this.#prefetch_request( options );
                return true;
            }
        }
        return false;
    }

    /**
     * Run async request
     * @private
     * @param {Object} settings - Plugin options
     * @return {void}
     */
    #prefetch_request( settings ) {
        const options = cloneObject( this.context.config.exposed.prefetch.asyncOptions );
        mergeObject( options, settings, true );

        // Create request, set events and send
        this.#request = new AsyncRequest( options, null, this.debug );
        this.#request.addEventList( [
            [ 'success', ( event ) => { this.#prefetch_success( event ); } ],
            [ 'error', ( event ) => { this.#prefetch_error( event ); } ],
            [ 'complete', ( event ) => { this.#prefetch_complete( event ); } ],
        ] );
        this.#request.send();
    }

    /**
     * Request complete
     * @private
     * @return {void}
     */
    #prefetch_complete() {
        this.#request = null;
    }

    /**
     * Request success
     * @private
     * @return {void}
     */
    #prefetch_success() {
        const options = this.context.config.get( 'prefetch' );

        /**
         * Success callback
         * @return {void}
         */
        const success_callback = () => {
            this.context.dispatchEvent( 'prefetch.success', { request : this.#request, plugin : this } );
            this.#ready();
        };

        /**
         * Error callback
         * @param {*} e - Error
         * @return {void}
         */
        const error_callback = ( e ) => { this.#prefetch_error( e ); };

        // JSON response
        if ( this.#request.responseType === 'application/json' && isPojo( this.#request.responseParsed ) ) {

            // Set any input fields available
            if ( options.fields ) {
                this.#set_values_from_fields( this.#request.responseParsed, options );
            }
        } else if ( this.debug ) {

            // Notify unknown response
            this.debug.log( this.constructor.name + '::prefetch_success Not a JSON response', this.#request );
        }

        // Run the response callback if available
        if ( options.responseCallback ) {
            options.responseCallback( success_callback, error_callback, this.#request, this );
            return;
        }

        // No callback or plugins
        success_callback();
    }

    /**
     * Set values from fields
     * @private
     * @param {Object} data - Request data
     * @param {Object} options - Plugin options
     * @return {void}
     */
    #set_values_from_fields( data, options ) {
        if ( data[ options.fields ] && isPojo( data[ options.fields ] ) ) {
            this.context.plugins.run( 'setValues', [ data[ options.fields ], options.flatFields ] );
        } else if ( this.debug ) {
            this.debug.warn( this.constructor.name + '::set_values_from_fields Found no fields to set' );
        }
    }

    /**
     * Prefetch error
     * @private
     * @param {Object|Event} event - Error details
     * @return {void}
     */
    #prefetch_error( event ) {
        this.context.dispatchEvent( 'prefetch.error', { error : event, request : this.#request, plugin : this } );
        this.context.states.set( 'error' );
        this.context.dispatchEvent( 'error', { event } );

        // Reload page on error
        if ( this.context.config.get( 'prefetch.reloadOnError' ) ) {
            window.console.error( this.constructor.name + '::prefetch_error Reloading' );
            window.setTimeout( () => { window.location.reload(); }, this.context.config.get( 'prefetch.reloadOnErrorDelay' ) );
        }
    }

    /**
     * Set ready state
     * @private
     * @return {void}
     */
    #ready() {
        this.context.plugins.run( 'readyComponent' );
        this.context.states.set( 'ready' );
        this.context.dispatchEvent( 'ready' );
    }
}

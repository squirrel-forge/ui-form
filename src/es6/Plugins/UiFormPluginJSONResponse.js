/**
 * Requires
 */
import {
    UiPlugin
} from '@squirrel-forge/ui-core';

// Import for local dev
// } from '../../../../ui-core';
import {
    Exception,
    isPojo
} from '@squirrel-forge/ui-util';

// Import for local dev
// } from '../../../../ui-util';

/**
 * Ui form plugin JSON response exception
 * @class
 */
class UiFormPluginJSONResponseException extends Exception {}

/**
 * @typedef {Function} successCallback
 * @param {null|Object|AsyncRequest} request - Request object
 * @param {Object|UiFormPluginJSONResponse} - Plugin object
 * @return {boolean} - Return true to prevent any further default actions
 */

/**
 * @typedef {Function} errorCallback
 * @param {null|Object|AsyncRequest} request - Request object
 * @param {Object|UiFormPluginJSONResponse} - Plugin object
 * @return {boolean} - Return true to prevent any further default actions
 */

/**
 * Ui form plugin JSON response
 * @class
 */
export class UiFormPluginJSONResponse extends UiPlugin {

    /**
     * Plugin name getter
     * @static
     * @return {string} - Plugin name
     */
    static get pluginName() {
        return 'response';
    }

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
            response : {

                // Response data property to read redirect url from
                // @type {null|string}
                redirect : 'redirect',

                // Response data property to read errors object from
                // @type {null|string}
                errors : 'errors',

                // Response data property to read response message from
                // @type {null|string}
                message : 'message',

                // Field to use for global errors, defaults to fields.errors.global if not set
                // @type {null|string}
                output : null,

                // Custom success callback
                // @type {null|Function|successCallback}
                successCallback : null,

                // Custom error callback
                // @type {null|Function|errorCallback}
                errorCallback : null,

                // Error used when none is available from the response
                // @type {string|Array|Function}
                unknown : 'An unknown error occured, please try again later.',
            },
        };

        // Register events
        this.registerEvents = [
            [ 'complete', ( event ) => { this.#event_complete( event ); } ],
        ];
    }

    /**
     * Complete event
     * @private
     * @param {Event} event - Complete event
     * @return {void}
     */
    #event_complete( event ) {
        const request = event.detail.target;
        try {
            this.#validateResponse( request );
            if ( request.error ) {
                this.#responseError( request );
            } else {
                this.#responseSuccess( request );
            }
        } catch ( e ) {
            if ( this.debug ) this.debug.error( this.constructor.name + '::event_complete', e );
            this.#responseError();
        }
    }

    /**
     * Validate response
     * @private
     * @param {Object|AsyncRequest} request - AsyncRequest
     * @return {void}
     */
    #validateResponse( request ) {

        // Ignore response type, allows parsing of any text as json
        if ( this.context.config.get( 'response.ignoreResponseType' ) ) {
            return;
        }

        // Check response format
        if ( request.responseType !== 'application/json'
            || request.responseParsed === null
            || !isPojo( request.responseParsed ) ) {
            const message = 'Expected application/json but got an empty response or wrong type: ';
            throw new UiFormPluginJSONResponseException( message + request.responseType );
        }
    }

    /**
     * Redirect from data
     * @private
     * @param {null|Object} data - Response data
     * @return {void}
     */
    #redirect( data ) {
        const prop = this.context.config.get( 'response.redirect' );
        if ( prop && data[ prop ] ) {
            if ( typeof data[ prop ] !== 'string' || !data[ prop ].length ) {
                throw new UiFormPluginJSONResponseException( 'Response redirect must and url string' );
            }
            window.location.href = data[ prop ];
        }
    }

    /**
     * Field errors
     * @private
     * @param {null|Object} data - Response data
     * @return {void}
     */
    #errors( data ) {
        const options = this.context.config.get( 'response' );

        // Skip since errors are disabled
        if ( !options.errors ) return;

        // Invalid response object
        if ( !isPojo( data ) ) data = {};

        // Info
        const has_prop = isPojo( data[ options.errors ] );
        let is_empty = !has_prop || !Object.keys( data[ options.errors ].length );
        if ( !has_prop ) data[ options.errors ] = {};

        // No error infos available
        if ( is_empty ) {

            // Requires a fields plugin
            if ( !this.context.plugins.has( 'fields' ) ) {
                throw new UiFormPluginJSONResponseException( 'A fields plugin is required for message or errors display' );
            } else {
                let err;

                // Can show message
                if ( options.message && data[ options.message ] ) {
                    err = data[ options.message ];
                    is_empty = false;
                }

                // Can show unknown error, unless message was available
                if ( is_empty && options.unknown ) {
                    err = options.unknown;
                    is_empty = false;
                }

                // Process if not empty anymore
                if ( !is_empty ) {
                    this.context.plugins.exec( 'fields', 'setObjectFieldError', [
                        data[ options.errors ],
                        err,
                        options.output,
                        [ data, this ],
                    ] );
                }
            }
        }

        // Still empty?
        if ( is_empty ) {
            throw new UiFormPluginJSONResponseException( 'Invalid response errors, message property and unknown error option.' );
        }

        // Send the errors to the display plugin/s
        this.context.plugins.run( 'showFieldsErrors', [ data[ options.errors ], null, this ] );
    }

    /**
     * Success response
     * @private
     * @param {Object|AsyncRequest} request - AsyncRequest
     * @return {void}
     */
    #responseSuccess( request ) {
        const callback = this.context.config.get( 'response.successCallback' );
        let resume = true;
        if ( callback ) resume = !callback( request, this );
        if ( !resume ) return;
        this.#redirect( request.responseParsed );
    }

    /**
     * Error response
     * @private
     * @param {Object|AsyncRequest} request - AsyncRequest
     * @return {void}
     */
    #responseError( request = null ) {
        const callback = this.context.config.get( 'response.errorCallback' );
        let resume = true;
        if ( callback ) resume = !callback( request, this );
        if ( !resume ) return;
        if ( request ) this.#redirect( request.responseParsed );
        this.#errors( request ? request.responseParsed : null );
    }
}

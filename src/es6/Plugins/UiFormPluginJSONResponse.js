/**
 * Requires
 */
import { UiPlugin } from '@squirrel-forge/ui-core';
import { Exception, isPojo } from '@squirrel-forge/ui-util';

/**
 * Ui form plugin JSON response exception
 * @class
 */
class UiFormPluginJSONResponseException extends Exception {}

/**
 * @typedef {Function} successCallback
 * @param {Object|AsyncRequest} request - Request object
 * @param {Object|UiFormPluginJSONResponse} - Plugin object
 * @return {boolean} - Return true to continue with default actions
 */

/**
 * @typedef {Function} errorCallback
 * @param {Object|AsyncRequest} request - Request object
 * @param {Object|UiFormPluginJSONResponse} - Plugin object
 * @return {boolean} - Return true to continue with default actions
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

                // Custom success callback
                // @type {null|Function|successCallback}
                successCallback : null,

                // Custom error callback
                // @type {null|Function|errorCallback}
                errorCallback : null,

                // Error object used when none is available from the response
                // @type {Object}
                unknown : { general : 'An unknown error occured, please try again later.' },
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
            throw new UiFormPluginJSONResponseException( 'Expected application/json but got an empty response or wrong type: ' + request.responseType );
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
        const prop = this.context.config.get( 'response.errors' );
        if ( !prop ) return;
        const unknown = this.context.config.get( 'response.unknown' );
        if ( unknown && !isPojo( data ) || !this.debug && !isPojo( data[ prop ] ) ) {
            data = {};
            data[ prop ] = unknown;
        }
        if ( data && data[ prop ] ) {
            if ( !isPojo( data[ prop ] ) || !Object.keys( data[ prop ] ).length ) {
                throw new UiFormPluginJSONResponseException( 'Response errors must be a non empty plain Object' );
            }
            this.context.plugins.run( 'showFieldsErrors', [ data[ prop ], null, this ] );
        }
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
        if ( callback ) resume = callback( request, this );
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
        if ( callback ) resume = callback( request, this );
        if ( !resume ) return;
        if ( request ) this.#redirect( request.responseParsed );
        this.#errors( request ? request.responseParsed : null );
    }
}

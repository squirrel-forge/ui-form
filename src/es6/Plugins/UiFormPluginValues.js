/**
 * Requires
 */
import { UiPlugin } from '@squirrel-forge/ui-core';
import { FormValues } from '../Form/FormValues.js';

/**
 * Ui form plugin values
 * @class
 */
export class UiFormPluginValues extends UiPlugin {

    /**
     * Plugin name getter
     * @static
     * @return {string} - Plugin name
     */
    static get pluginName() {
        return 'values';
    }

    /**
     * Form values instance
     * @private
     * @property
     * @type {null|Object|FormValues}
     */
    #values = null;

    /**
     * Last data state
     * @private
     * @property
     * @type {null|string}
     */
    #last_state = null;

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
            values : {

                // Enable input data change state
                // @type {boolean}
                changeState : false
            },

            // Dom references
            // @type {Object}
            dom : {

                // Values input selector
                // @type {string}
                values : 'input, select, textarea'
            },
        };
    }

    /**
     * Values getter
     * @public
     * @return {null|Object|FormValues} - Form values object
     */
    get values() {
        return this.#values;
    }

    /**
     * Init component
     * @public
     * @param {Object|UiFormComponent} context - Plugin context
     * @return {void}
     */
    initComponent( context ) {

        // Register events
        //  Must be defined here since the defaultEvent might be modified during init by other plugins
        this.registerEvents = [
            [ this.context.config.exposed.defaultEvent, () => { this.#event_default(); } ],
        ];

        // Bind form element events
        super.initComponent( context );

        // Create form values instance
        this.#values = new FormValues( context.dom, false, this.debug );
    }

    /**
     * Default event
     * @private
     * @return {void}
     */
    #event_default() {
        this.updateValuesState();
    }

    /**
     * Update value comparison state
     * @public
     * @return {void}
     */
    updateValuesState() {
        if ( this.context.config.exposed.values.changeState ) {
            this.#last_state = this.getValues( true );
            if ( this.debug ) this.debug.log( this.constructor.name + '::updateValuesState  Updated values state', this.#last_state );
        }
    }

    /**
     * Values have changes
     * @public
     * @return {null|boolean} - Null if change state disabled
     */
    hasChanges() {
        if ( !this.context.config.exposed.values.changeState ) return null;
        return JSON.stringify( this.#last_state ) !== JSON.stringify( this.getValues( true ) );
    }

    /**
     * Get inputs related to a fieldname
     * @public
     * @param {string} field - Field name
     * @return {Array|NodeList} - Fields
     */
    getInputs( field ) {
        return this.#values.inputs( field );
    }

    /**
     * Get values
     * @public
     * @param {boolean} flat - Flat values
     * @param {string} selector - Input selector
     * @return {Object} - Values map
     */
    getValues( flat = false, selector = null ) {
        if ( typeof selector !== 'string' ) {
            selector = this.context.config.exposed.dom.values;
        }
        return this.#values.get( flat, selector );
    }

    /**
     * Set values
     * @param {Object} values - Values map
     * @param {boolean} flat - Is flat map
     * @return {void}
     */
    setValues( values, flat = false ) {
        return this.#values.set( values, flat, false );
    }
}

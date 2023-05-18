/**
 * Requires
 */
import { UiComponent } from '@squirrel-forge/ui-core';
import { Exception, round } from '@squirrel-forge/ui-util';

/**
 * Ui rotate component exception
 * @class
 * @extends Exception
 */
class UiRotateComponentException extends Exception {}

/**
 * Ui rotate component
 * @class
 * @extends UiComponent
 */
export class UiRotateComponent extends UiComponent {

    /**
     * Element selector getter
     * @public
     * @return {string} - Element selector
     */
    static get selector() {
        return '[is="ui-rotate"]:not([data-state])';
    }

    #disabled = false;

    #readonly = false;

    #value = 0;

    #dragging = false;

    /**
     * Constructor
     * @constructor
     * @param {HTMLFormElement} element - Component element
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

        /**
         * Default config
         * @type {Object}
         */
        defaults = defaults || {

            // Display angle offset
            // @type {number}
            offset : -90,

            // Set value with unit
            // @type {boolean}
            withUnit : true,

            // Rounding decimals
            // @type {number}
            decimals : 0,

            // Input events
            // @type {boolean}
            events : true,

            // Dom references
            // @type {Object}
            dom : {

                // Value target
                // @type {string}
                input : 'input',

                // Value display target
                // @type {string}
                display : '.ui-rotate__angle',

                // Indicator element
                // @type {string}
                indicator : '.ui-rotate__indicator',

                // Rotate control button
                // @type {string}
                rotator : '.ui-rotate__control',
            }
        };

        /**
         * Default states
         * @type {Object}
         */
        states = states || {
            initialized : { classOn : 'ui-rotate--initialized' },
            disabled : { global : false, classOn : 'ui-rotate--disabled' },
            readonly : { global : false, classOn : 'ui-rotate--readonly' },
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
        const rotator = this.getDomRefs( 'rotator', false );
        const listener = ( event ) => {
            if ( document.elementFromPoint( event.clientX, event.clientY ) === rotator ) {
                this.#event_rotatorMouseEvent( event, 'input' );
            }
        };
        rotator.addEventListener( 'click', ( event ) => {
            this.#event_rotatorMouseEvent( event, 'change' );
        } );
        rotator.addEventListener( 'mousedown', ( event ) => {
            this.#dragging = true;
            this.#event_rotatorMouseEvent( event, 'change' );
            rotator.addEventListener( 'mousemove', listener, { passive : true } );
        } );
        rotator.addEventListener( 'mouseup', ( event ) => {
            if ( this.#dragging ) {
                this.#dragging = false;
                this.#event_rotatorMouseEvent( event, 'change' );
                rotator.removeEventListener( 'mousemove', listener );
            }
        } );
        document.addEventListener( 'mouseup', ( event ) => {
            if ( this.#dragging ) {
                this.#dragging = false;
                let angle = document.elementFromPoint( event.clientX, event.clientY ) !== rotator ? this.#value : null;
                this.#event_rotatorMouseEvent( event, 'change', angle );
                rotator.removeEventListener( 'mousemove', listener );
            }
        } );
    }

    get value() {
        return this.#value;
    }

    set value( value ) {
        if ( typeof value === 'string' ) value = parseFloat( value );
        if ( typeof value !== 'number' || Number.isNaN( value ) ) throw new UiRotateComponentException( 'Value must be a valid angle' );
        this.#event_rotatorMouseEvent( null, 'change', value, true );
    }

    get disabled() {
        return this.#disabled;
    }

    set disabled( state ) {
        this.#disabled = !!state;
        const input = this.getDomRefs( 'input', false );
        const rotator = this.getDomRefs( 'rotator', false );
        if ( !!state ) {
            this.states.set( 'disabled' );
            input.disabled = true;
            rotator.disabled = true;
        } else {
            this.states.unset( 'disabled' );
            input.disabled = false;
            rotator.disabled = false;
        }
    }

    get readonly() {
        return this.#readonly;
    }

    set readonly( state ) {
        this.#readonly = !!state;
        const input = this.getDomRefs( 'input', false );
        const rotator = this.getDomRefs( 'rotator', false );
        if ( !!state ) {
            this.states.set( 'readonly' );
            input.readonly = true;
            rotator.disabled = true;
        } else {
            this.states.unset( 'readonly' );
            input.readonly = false;
            rotator.disabled = false;
        }
    }

    /**
     * Event rotator mouse event
     * @private
     * @param {null|MouseEvent} event - Click/down/move/up event
     * @param {string} name - Event trigger name
     * @param {null|number} angle - Override angle
     * @param {boolean} silent - Fire no events
     * @return {void}
     */
    #event_rotatorMouseEvent( event, name, angle = null, silent = false ) {
        if ( event ) angle = this.#get_angle( event );
        if ( typeof angle !== 'number' ) throw new UiRotateComponentException( 'Invalid angle value "' + typeof angle + '"' );
        const unit = 'deg';
        const input = this.getDomRefs( 'input', false );
        input.value = angle + ( this.config.get( 'withUnit' ) ? unit : '' );
        this.#value = angle;
        this.getDomRefs( 'indicator', false ).style.rotate = angle + unit;
        if ( !silent ) {
            const events = this.config.get( 'events' );
            const detail = { angle, unit, event };
            detail.component = this;
            if ( events ) input.dispatchEvent( new CustomEvent( name, { bubbles : true, cancelable : false, detail } ) );
            this.dispatchEvent( name, detail );
        }
    }

    #get_angle( event ) {
        const offset = this.config.get( 'offset' );
        const decimals = this.config.get( 'decimals' );
        const target = event.target.getBoundingClientRect();
        const x1 = ( event.clientX - target.left );
        const y1 = ( event.clientY - target.top );
        const x2 = ( target.width / 2 );
        const y2 = ( target.height / 2 );
        let angle = Math.atan2( y2 - y1, x2 - x1 ) * ( 180 / Math.PI );
        if ( y1 > y2 || x1 < x2 ) angle += 360;
        return round( angle + offset, decimals );
    }
}

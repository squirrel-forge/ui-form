/**
 * Requires
 */
import { Exception, strCreate, strAccess, isPojo } from '@squirrel-forge/ui-util';

/**
 * Form values exception
 * @class
 * @extends Exception
 */
class FormValuesException extends Exception {}

/**
 * Form values
 * @class
 */
export class FormValues {

    /**
     * Debug object
     * @private
     * @property
     * @type {null|console|Object}
     */
    #debug = null;

    /**
     * Form element
     * @private
     * @property
     * @type {null|HTMLFormElement}
     */
    #form = null;

    /**
     * Include disabled input values
     * @private
     * @property
     * @type {boolean}
     */
    #includeDisabled = false;

    /**
     * Constructor
     * @constructor
     * @param {HTMLFormElement} form - Form element
     * @param {boolean} includeDisabled - Include disabled input values
     * @param {null|console|Object} debug - Debug object
     */
    constructor( form, includeDisabled = false, debug = null ) {

        // Debugger instance
        this.#debug = debug;

        // Dom reference
        if ( !( form instanceof HTMLFormElement ) ) {
            throw new FormValuesException( 'Argument form must be an instance of HTMLFormElement' );
        }
        this.#form = form;

        // Set include option
        this.includeDisabled = includeDisabled;
    }

    /**
     * Debug getter
     * @public
     * @return {null|console|Object} - Debug reference
     */
    get debug() {
        return this.#debug;
    }

    /**
     * Form getter
     * @public
     * @return {HTMLFormElement} - Form element
     */
    get form() {
        return this.#form;
    }

    /**
     * Include disabled getter
     * @public
     * @return {boolean} - True if enabled
     */
    get includeDisabled() {
        return this.#includeDisabled;
    }

    /**
     * Include disabled setter
     * @param {boolean} state - State
     * @return {void}
     */
    set includeDisabled( state ) {
        this.#includeDisabled = !!state;
    }

    /**
     * Get input dot syntax info
     * @param {string} name - Input name
     * @param {*} value - Input value
     * @return {{name: string, value: Array}} - Input info
     */
    static input_info( name, value ) {

        // Convert name to dot syntax
        name = name.replace( /\[/g, '.' ).replace( /]/g, '' );

        // Check trailing dot
        if ( name[ name.length - 1 ] === '.' ) {
            name = name.substr( 0, name.length - 1 );

            // Value should be an array
            if ( !( value instanceof Array ) ) {
                value = [ value ];
            }
        }
        return { name, value };
    }

    /**
     * Convert flat values to dimensional
     * @param {Object} values - Flat values map
     * @return {Object} - Dimensional values map
     */
    static convert_from_flat( values ) {
        const new_values = {};
        const names = Object.keys( values );
        for ( let i = 0; i < names.length; i++ ) {
            strCreate( names[ i ], values[ names[ i ] ], new_values );
        }
        return new_values;
    }

    /**
     * Get values
     * @param {boolean} flat - True to get a flat map
     * @param {string} selector - Input selector
     * @return {Object} - Values data
     */
    get( flat = false, selector = 'input, select, textarea' ) {
        const values = {};
        const inputs = this.#form.querySelectorAll( selector );

        // Parse input elements
        for ( let i = 0; i < inputs.length; i++ ) {

            // Input shorthand
            const input = inputs[ i ];

            // Value getter
            const method = 'get_' + input.tagName.toLowerCase() + '_value';

            // Disabled check
            if ( this.#includeDisabled || !this.#includeDisabled && !input.disabled ) {

                if ( this[ method ] ) {

                    // Input value
                    const value = this[ method ]( input );

                    // Only set if there is an actual value
                    // Selected disabled options or unchecked radio/checkbox fields will be null
                    if ( value !== null ) {

                        // Get name and value
                        const info = this.constructor.input_info( input.name, value );

                        // Flat mode
                        if ( flat ) {

                            // Value exists
                            if ( values[ info.name ] ) {

                                // Append only if both are arrays
                                if ( values[ info.name ] instanceof Array && info.value instanceof Array ) {
                                    values[ info.name ] = values[ info.name ].concat( info.value );
                                }
                            } else {

                                // Create value
                                values[ info.name ] = info.value;
                            }
                        } else {

                            // Default auto dimensional mode
                            const exists = strAccess( info.name, values, true );

                            // Value exists
                            if ( exists !== null ) {

                                // Append only if both are arrays
                                if ( exists instanceof Array && info.value instanceof Array ) {
                                    strCreate( info.name, exists.concat( info.value ), values, true );
                                }
                            } else {

                                // Create value
                                strCreate( info.name, info.value, values );
                            }
                        }
                    }
                }
            }
        }

        return values;
    }

    /**
     * Set values
     * @public
     * @param {Object} values - Values map
     * @param {boolean} flat - Is flat values
     * @param {boolean} errors - Throw input errors
     * @return {void}
     */
    set( values, flat = false, errors = true ) {

        // Convert to dimensional data
        if ( flat ) {
            values = this.constructor.convert_from_flat( values );
        }

        // Set values recursive
        this.#set_recursive( values, [], null, false, errors );
    }

    /**
     * Get inputs related to given dot path
     * @public
     * @param {string} field - Field
     * @param {boolean} errors - Throw input errors
     * @return {Array|NodeList} - Input elements
     */
    inputs( field, errors = true ) {

        // Create values dimensional object from field name
        const values = {};
        strCreate( field, true, values );

        // Use the set value recursive but return selected results
        return this.#set_recursive( values, [], null, true, errors ) || [];
    }

    /**
     * Get fieldname related to given input
     * @param {HTMLElement} input - Input element
     * @return {string} - Input name
     */
    fieldname( input ) {
        if ( !input || typeof input.name !== 'string' || !input.name.length ) {
            throw new FormValuesException( 'Argument input must be a HTMLElement with a name property' );
        }
        let name = input.name;

        // Convert name to dot syntax
        name = name.replace( /\[/g, '.' ).replace( /]/g, '' );

        // Require explicit name for all that have two unknowns
        if ( name.includes( '..' ) ) {
            if ( input.hasAttribute( 'data-fieldname' ) ) {
                name = input.getAttribute( 'data-fieldname' );
                if ( name && name.length ) return name;
            }
            throw new FormValuesException( 'Complex fields require a data-fieldname attribute' );
        }

        // Get array position
        if ( name[ name.length - 1 ] === '.' ) {
            name = name.substr( 0, name.length - 1 );
            const selector = '[name^="' + input.name.substr( 0, input.name.length - 2 ) + '"]';
            const inputs = this.#form.querySelectorAll( selector );
            for ( let i = 0; i < inputs.length; i++ ) {
                if ( inputs[ i ] === input ) {
                    name += '.' + i;
                    break;
                }
            }
        }
        return name;
    }

    /**
     * Set values recursive
     * @private
     * @param {*|Array|Object} values - Values object
     * @param {Array} path - Current path
     * @param {null|string} name - Name
     * @param {boolean} supply - Return data
     * @param {boolean} errors - Throw input errors
     * @return {null|Array|NodeList} - Data
     */
    #set_recursive( values, path = [], name = null, supply = false, errors = true ) {

        // Skip any undefined values, they come from empty array elements
        if ( typeof values === 'undefined' ) {
            return null;
        }

        // Array values
        if ( values instanceof Array ) {

            // List of array inputs
            let inputs = this.#form.querySelectorAll( '[name="' + name + '[]"]' );
            if ( inputs && inputs.length ) {
                if ( supply ) {
                    const collect = [];
                    for ( let i = 0; i < inputs.length; i++ ) {
                        if ( values[ i ] === true ) {
                            collect.push( inputs[ i ] );
                        }
                    }
                    return collect;
                }
                this.#set_inputs_values( inputs, values );
            } else {

                // Multi select
                inputs = this.#form.querySelectorAll( '[name="' + name + '"]' );
                if ( inputs && inputs.length === 1 ) {
                    if ( supply ) {
                        return inputs;
                    }
                    this.#set_inputs_values( inputs, values );
                } else {

                    // Not a multiselect
                    let collect = [];
                    for ( let i = 0; i < values.length; i++ ) {
                        const new_name = name + '[' + i + ']';
                        const res = this.#set_recursive( values[ i ], [ ...path, i ], new_name, supply, errors );
                        if ( res && res.length ) {
                            collect = collect.concat( Array.prototype.slice.call( res ) );
                        }
                    }
                    if ( supply ) {
                        return collect;
                    }
                }
            }
        } else if ( isPojo( values ) ) {

            // Named child object
            let collect = [];
            const names = Object.keys( values );
            for ( let i = 0; i < names.length; i++ ) {
                let new_name;
                if ( name === null ) {
                    new_name = names[ i ];
                } else {
                    new_name = name + '[' + names[ i ] + ']';
                }
                const res = this.#set_recursive( values[ names[ i ] ], [ ...path, names[ i ] ], new_name, supply, errors );
                if ( res && res.length ) {
                    collect = collect.concat( Array.prototype.slice.call( res ) );
                }
            }
            if ( supply ) {
                return collect;
            }
        } else {

            // Primitive values
            const inputs = this.#form.querySelectorAll( '[name="' + name + '"]' );
            if ( inputs.length ) {
                if ( supply ) {
                    return inputs;
                }
                this.#set_inputs_values( inputs, values );
            } else if ( errors ) {

                // Throw exception if field does not exist
                throw new FormValuesException( 'Undefined field: ' + name );
            } else if ( this.#debug ) {
                this.#debug.error( this.constructor.name + '::set_recursive Undefined field: ' + name );
            }
        }
        return null;
    }

    /**
     * Set inputs values
     * @private
     * @param {NodeList} inputs - Input elements
     * @param {*|Array|Object} value - Value
     * @return {void}
     */
    #set_inputs_values( inputs, value ) {

        // Handle select inputs with multiple array values
        if ( value instanceof Array && inputs.length === 1 && inputs[ 0 ].tagName.toLowerCase() === 'select' ) {
            for ( let i = 0; i < inputs[ 0 ].options.length; i++ ) {
                inputs[ 0 ].options[ i ].selected = value.includes( inputs[ 0 ].options[ i ].value );
            }
            if ( this.#debug ) this.#debug.log( this.constructor.name + '::set_inputs_values > select.array.value', inputs[ 0 ], value );
            return;
        }

        // Cycle all inputs
        for ( let i = 0; i < inputs.length; i++ ) {

            if ( value instanceof Array ) {

                // Skip undefined values
                if ( typeof value[ i ] !== 'undefined' ) {

                    if ( inputs[ i ].type === 'radio' || inputs[ i ].type === 'checkbox' ) {

                        this.#set_radio_checkbox_value( inputs, value, i );

                    } else {

                        // Set value property
                        inputs[ i ].value = value;
                        if ( this.#debug ) {
                            this.#debug.log( this.constructor.name + '::set_inputs_values > array.value', inputs[ i ], value );
                        }
                    }
                }
            } else if ( inputs[ i ].type === 'radio' || inputs[ i ].type === 'checkbox' ) {

                // Primitive value
                this.#set_radio_checkbox_value( inputs, value, i, true );
            } else {

                // Set value property
                inputs[ i ].value = value;
                if ( this.#debug ) this.#debug.log( this.constructor.name + '::set_inputs_values > value', inputs[ i ], value );
            }
        }
    }

    /**
     * Set radio or checkbox value
     * @private
     * @param {NodeList<HTMLInputElement>} inputs - Input elements
     * @param {*|Array} value - Value
     * @param {number} i - Position in array
     * @param {boolean} no_array - Convert value to array
     * @return {void}
     */
    #set_radio_checkbox_value( inputs, value, i, no_array = false ) {

        // Convert value to array for valid access
        if ( no_array ) {
            const fake = [];
            fake[ i ] = value;
            value = fake;
        }

        // Radio checkbox has value attribute
        if ( inputs[ i ].hasAttribute( 'value' ) ) {
            let set = false;
            if ( inputs[ i ].value === value[ i ]
                || value[ i ] === true
                ||  value[ i ] && value[ i ].toLowerCase && value[ i ].toLowerCase() === 'on'  ) {
                inputs[ i ].checked = true;
                set = true;
            } else if ( value[ i ] === null || value[ i ] === false ) {
                inputs[ i ].checked = false;
                set = true;
            }
            if ( set && this.#debug ) {
                this.#debug.log( this.constructor.name + '::set_radio_checkbox_value > value', inputs[ i ], inputs[ i ].checked );
            }
        } else {

            // Radio checkbox without custom value
            let set = false;
            if ( value[ i ] === true
                ||  value[ i ] && value[ i ].toLowerCase && value[ i ].toLowerCase() === 'on'  ) {
                inputs[ i ].checked = true;
                set = true;
            } else if ( value[ i ] === null || value[ i ] === false ) {
                inputs[ i ].checked = false;
                set = true;
            }
            if ( set && this.#debug ) {
                this.#debug.log( this.constructor.name + '::set_radio_checkbox_value', inputs[ i ], inputs[ i ].checked );
            }
        }
    }

    /**
     * Get input value
     * @public
     * @param {HTMLInputElement} input - Input element
     * @return {null|string|boolean|FileList|File} - Input value
     */
    get_input_value( input ) {
        if ( this.#includeDisabled || !input.disabled ) {
            let v = input.value;
            switch ( input.type ) {
            case 'checkbox' :
            case 'radio' :
                if ( !v || !v.length ) v = true;
                return input.checked ? v : null;
            case 'file' :
                if ( input.files && input.files.length ) {
                    if ( input.multiple ) return input.files;
                    return input.files[ 0 ];
                }
                return null;
            case 'text' :
            default :
                return v;
            }
        }
        return null;
    }

    /**
     * Get select value
     * @public
     * @param {HTMLSelectElement} select - Select element
     * @return {null|string|Array} - Select value/s
     */
    get_select_value( select ) {
        if ( this.#includeDisabled || !select.disabled ) {
            const value = [];
            for ( let i = 0; i < select.options.length; i++ ) {
                const option = select.options[ i ];
                if ( this.#includeDisabled || !option.disabled ) {
                    if ( option.selected ) value.push( option.value || option.innerText );
                }
            }
            if ( !select.multiple ) return value.shift();
            return value;
        }
        return null;
    }

    /**
     * Get textarea value
     * @public
     * @param {HTMLTextAreaElement} textarea - Textarea element
     * @return {null|string} - Value or null if empty or disabled
     */
    get_textarea_value( textarea ) {
        if ( this.#includeDisabled || !textarea.disabled ) {
            return textarea.value;
        }
        return null;
    }
}

/**
 * Requires
 */
import { UiTemplate } from '@squirrel-forge/ui-core';
import { Exception, isPojo, ucfirst } from '@squirrel-forge/ui-util';


/**
 * Ui input template exception
 * @class
 * @extends Exception
 */
class UiInputTemplateException extends Exception {}

/**
 * Ui input template data
 * @typedef {Object} UiInputTemplateData
 * @property {null|string} id - Input id
 * @property {string} name - Input name
 * @property {string} type - Input type
 * @property {null|string|number} value - Default value
 * @property {null|boolean} checked - Checkbox/radio checked state
 * @property {null|boolean} required - Required value
 * @property {null|number} maxlen - Max length value
 * @property {null|number} min - Min value
 * @property {null|number} max - Max value
 * @property {null|number} step - Stepped value
 * @property {null|(25,30,33,40,50,60,66,70,75,100,'wide')} width - Input width
 * @property {null|Array<string>} classes - List of wrapper classes
 * @property {null|Array<string>} attr - List of wrapper attributes
 * @property {null|Array<string>} attributes - List of input attributes
 * @property {null|Array<string>} autocomplete - List of autocomplete values
 * @property {null|UiInputLabelTemplateData} label - Input label
 * @property {null|string|Array<string|UiInputOptionTemplateData>} options - Select options
 * @property {null|string} pseudo - Pseudo element content
 * @property {null|string} icon - Pseudo element content as icon
 * @property {null|string} before - Before input content
 * @property {null|string} after - After input content
 * @property {null|string} prefix - Before input prefix text
 * @property {null|string} suffix - After input suffix text
 * @property {null|UiInputErrorTemplateData} error - Error options
 */

/**
 * Ui input label template data
 * @typedef {Object} UiInputLabelTemplateData
 * @property {null|string} tag - Label tag
 * @property {null|boolean} before - Label position
 * @property {null|string} text - Label text
 */

/**
 * @typedef {Object} UiInputOptionTemplateData
 * @param {string} label - Display label
 * @param {string} value - Option value
 * @param {null|string} attributes - Optional attributes
 */

/**
 * @typedef {Object} UiInputErrorTemplateData
 * @property {string} tag - Error tag
 */

/**
 * Ui input template
 * @class
 * @extends UiTemplate
 */
export class UiInputTemplate extends UiTemplate {

    /**
     * Default template data
     * @protected
     * @property
     * @type {UiInputTemplateData}
     */
    _defaults = {
        id : null,
        name : null,
        type : 'text',
        value : null,
        checked : false,
        required : false,
        maxlen : null,
        min : null,
        max : null,
        step : null,
        width: null,
        classes : [],
        attr : [],
        attributes : [],
        autocomplete : null,
        label : {
            tag : 'strong',
            before : true,
            text : null,
        },
        before : null,
        after : null,
        prefix : null,
        suffix : null,
        error : { tag : 'em' },
        options : null,
        pseudo : '',
        icon : null,
    };

    /**
     * Template validate method
     * @protected
     * @param {UiInputTemplateData} data - Template data
     * @return {boolean} - True if data can be rendered
     */
    _validate( data ) {
        if ( typeof data.name !== 'string' || !data.name.length ) throw new UiInputTemplateException( 'Requires a valid name' );
        if ( typeof data.type !== 'string' || !data.type.length ) throw new UiInputTemplateException( 'Requires a valid type' );
    }

    /**
     * Render template
     * @protected
     * @param {UiInputTemplateData} data - Ui input template data
     * @return {string} - Rendered template string
     */
    _render( data ) {

        // Set any default classes and attributes for the component
        const classes = [ 'ui-input' ];
        const default_types = [ 'date', 'datetime', 'email', 'number', 'select', 'text' ];
        if ( default_types.includes( data.type ) ) classes.push( 'ui-input--default' );
        classes.push( `ui-input--${data.type}` );
        if ( data.type === 'checkbox' && data.icon === null ) data.icon = 'check';
        if ( data.required ) classes.push( 'ui-input--required' );
        if ( data.width ) classes.push( `ui-input--${data.width}`);
        if ( data.classes instanceof Array ) classes.push( ...data.classes );
        const attr = [];
        if ( data.attr instanceof Array ) attr.push( ...data.attr );
        const attributes = [];
        if ( data.id ) attributes.push( `id="${data.id}"` );
        if ( [ 'checkbox', 'radio' ].includes( data.type ) && data.checked ) attributes.push( 'checked' );
        if ( data.required ) attributes.push( `required` );
        if ( typeof data.maxlen === 'number' ) attributes.push( `maxlength="${data.maxlen}"` );
        if ( typeof data.min === 'number' ) attributes.push( `min="${data.min}"` );
        if ( typeof data.max === 'number' ) attributes.push( `max="${data.max}"` );
        if ( data.step ) attributes.push( `step="${data.step}"` );
        if ( data.value !== null && typeof data.value !== 'boolean' && ![ 'textarea', 'select' ].includes( data.type ) ) attributes.push( `value="${data.value}"` );
        if ( data.attributes instanceof Array ) attributes.push( ...data.attributes );

        if ( data.icon && ( !data.pseudo || !data.pseudo.length ) ) {
            data.pseudo = `<span class="ui-icon" data-icon="${data.icon}"><span></span><span></span></span>`;
        }

        let autocomplete = '';
        if ( data.autocomplete instanceof Array && data.autocomplete.length ) {
            attributes.push( `list="${data.id}_autocomplete"` );
            attributes.push( `autocomplete="off"` );
            autocomplete += `<datalist id="${data.id}_autocomplete">`;
            for ( let i = 0; i < data.autocomplete.length; i++ ) {
                autocomplete += '<option>' + data.autocomplete[ i ] + '</option>';
            }
            autocomplete += '</datalist>';
        }

        const markup_label = data.label.text && data.label.text.length ? `<${data.label.tag} class="ui-input__label">${data.label.text}</${data.label.tag}>` : '';
        const markup_error = data.error.tag && data.error.tag.length ? `<${data.error.tag} class="ui-input__error"></${data.error.tag}>` : '';

        if ( !data.before && data.prefix ) data.before = `<span class="ui-input__prefix">${data.prefix}</span>`;
        if ( !data.after && data.suffix ) data.after = `<span class="ui-input__suffix">${data.suffix}</span>`;

        let markup_input = `<input type="${data.type}" name="${data.name}" ${attributes.join( ' ' )} />`;

        switch ( data.type ) {
        case 'textarea':
            markup_input = `<textarea name="${data.name}" ${attributes.join( ' ' )}>${data.value === null ? '' : data.value}</textarea>`;
            break;
        case 'select':
            markup_input = `<select name="${data.name}" ${attributes.join( ' ' )}>`;
            if ( typeof data.options === 'string' ) {
                markup_input += data.options;
            } else {
                for ( let i = 0; i < data.options.length; i++ ) {
                    let option = data.options[ i ];
                    if ( !isPojo( option ) ) option = { value : option, label : ucfirst( option ) };
                    if ( data.value === option.value ) {
                        if ( !option.attributes ) option.attributes = '';
                        option.attributes += ' selected';
                    }
                    markup_input += `<option value="${option.value === null ? '' : option.value}" ${option.attributes || ''}>${option.label}</option>`
                }
            }
            markup_input += `</select>`;
            markup_input += `<span class="ui-input__pseudo">${data.pseudo}</span>`;
            break;
        case 'checkbox':
        case 'radio':
            markup_input += `<span class="ui-input__pseudo">${data.pseudo}</span>`;
            break;
        }

        // Component markup
        return `<label class="${classes.join( ' ' )}" ${attr.join( ' ' )}>` +
            ( data.label.before ? markup_label : '' ) +
            '<span class="ui-input__input">' +
                ( data.before || '' ) + markup_input + ( data.after || '' ) +
            '</span>' +
            ( !data.label.before ? markup_label : '' ) +
            markup_error +
            autocomplete +
        `</label>`;
    }
}

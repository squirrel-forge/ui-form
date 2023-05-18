/**
 * Requires
 */
import { UiTemplate } from '@squirrel-forge/ui-core';
import { Exception } from '@squirrel-forge/ui-util';


/**
 * Ui form template exception
 * @class
 * @extends Exception
 */
class UiFormTemplateException extends Exception {}

/**
 * Ui form template data
 * @typedef {Object} UiFormTemplateData
 * @property {null|string} id - Form id
 * @property {string} url - Form action url
 * @property {string} method - Transmission method
 * @property {boolean} files - Sets enctype multipart
 * @property {null|string} content - Form content
 * @property {null|Array<string>} classes - List of form classes
 * @property {null|Array<string>} attributes - List of form attributes
 * @property {null|Array<string>} wrapper - List of wrapper classes
 */

/**
 * Ui form template
 * @class
 * @extends UiTemplate
 */
export class UiFormTemplate extends UiTemplate {

    /**
     * Default template data
     * @protected
     * @property
     * @type {UiFormTemplateData}
     */
    _defaults = {
        id : null,
        url : '',
        method : 'post',
        files : false,
        content : null,
        classes : [],
        attributes : [],
        wrapper : [],
    };

    /**
     * Template validate method
     * @protected
     * @param {UiFormTemplateData} data - Template data
     * @return {boolean} - True if data can be rendered
     */
    _validate( data ) {
        if ( typeof data.content !== 'string' || !data.content.length ) throw new UiFormTemplateException( 'Requires content' );
    }

    /**
     * Render template
     * @protected
     * @param {UiFormTemplateData} data - Ui form template data
     * @return {string} - Rendered template string
     */
    _render( data ) {

        // Set any default classes and attributes for the component
        const classes = [ 'ui-form' ];
        if ( data.classes instanceof Array ) classes.push( ...data.classes );
        const wrapper = [ 'ui-wrap', 'ui-wrap--form' ];
        if ( data.wrapper instanceof Array ) wrapper.push( ...data.wrapper );
        const attributes = [ `action="${data.url}"`, `method="${data.method}"` ];
        if ( data.id ) attributes.push( `id="${data.id}"` );
        if ( data.files ) attributes.push( 'enctype="multipart/form-data"' );
        if ( data.attributes instanceof Array ) attributes.push( ...data.attributes );

        // Component markup
        return `<form is="ui-form" class="${classes.join( ' ' )}" ${attributes.join( ' ' )}>` +
            `<div class="${wrapper.join( ' ' )}">${data.content}</div>` +
        `</form>`;
    }
}

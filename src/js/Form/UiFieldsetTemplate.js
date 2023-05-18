/**
 * Requires
 */
import { UiTemplate } from '@squirrel-forge/ui-core';
import { Exception } from '@squirrel-forge/ui-util';


/**
 * Ui fieldset template exception
 * @class
 * @extends Exception
 */
class UiFieldsetTemplateException extends Exception {}

/**
 * Ui fieldset template data
 * @typedef {Object} UiFieldsetTemplateData
 * @property {null|string} legend - Fieldset legend
 * @property {null|string} contentBefore - Fieldset content before rows
 * @property {null|string} contentAfter - Fieldset content after rows
 * @property {null|string} required - Fieldset required notice
 * @property {null|Array<string>} classes - List of fieldset classes
 * @property {null|Array<string>} attributes - List of fieldset attributes
 * @property {null|Array<string>} wrapper - List of wrapper classes
 * @property {null|Array<string>} rows - List of rows
 * @property {null|Array<string>} row_classes - List of row classes
 */

/**
 * Ui fieldset template
 * @class
 * @extends UiTemplate
 */
export class UiFieldsetTemplate extends UiTemplate {

    /**
     * Default template data
     * @protected
     * @property
     * @type {UiFieldsetTemplateData}
     */
    _defaults = {
        legend : null,
        contentBefore : null,
        contentAfter : null,
        required : null,
        classes : [],
        attributes : [],
        wrapper : [ 'ui-wrap', 'ui-wrap--fieldset' ],
        rows : [],
        row_classes : [ 'ui-wrap', 'ui-wrap--fieldset-row' ],
    };

    /**
     * Template validate method
     * @protected
     * @param {UiFieldsetTemplateData} data - Template data
     * @return {boolean} - True if data can be rendered
     */
    _validate( data ) {
        const contentBefore = typeof data.contentBefore === 'string' && data.contentBefore.length;
        const contentAfter = typeof data.contentAfter === 'string' && data.contentAfter.length;
        const rows = !!data.rows.length;
        if ( !contentBefore && !contentAfter && !rows ) {
            throw new UiFieldsetTemplateException( 'Requires content before/after or rows' );
        }
    }

    /**
     * Render template
     * @protected
     * @param {UiFieldsetTemplateData} data - Ui fieldset template data
     * @return {string} - Rendered template string
     */
    _render( data ) {

        // Set any default classes and attributes for the component
        const classes = [ 'ui-fieldset' ];
        if ( data.legend ) classes.push( 'ui-fieldset--legend' );
        if ( data.classes instanceof Array ) classes.push( ...data.classes );
        const wrapper = [];
        if ( data.wrapper instanceof Array ) wrapper.push( ...data.wrapper );
        const attributes = [];
        if ( data.attributes instanceof Array ) attributes.push( ...data.attributes );

        // Required notice
        let required = data.required;
        if ( required ) {
            required = `<div class="ui-fieldset__required"><p><em>${required}</em></p></div>`;
        }

        // Setup row wrapping
        let wrapper_tag = 'div';
        const content = [];
        if ( data.rows.length ) {
            wrapper_tag = 'ul'
            const row_classes = [ 'ui-fieldset__row' ];
            if ( data.row_classes instanceof Array ) row_classes.push( ...data.row_classes );
            for ( let i = 0; i < data.rows.length; i++ ) {
                content.push( `<li class="${row_classes.join( ' ' )}">${data.rows[ i ]}</li>` );
            }
        }

        // Component markup
        return `<fieldset class="${classes.join( ' ' )}" ${attributes.join( ' ' )}>` +
            ( data.legend ? `<legend class="ui-fieldset__legend"><strong>${data.legend}</strong></legend>` : '' ) +
            '<div class="ui-fieldset__content">' +
                `<${wrapper_tag} class="${wrapper.join( ' ' )}">` +
                    ( data.contentBefore ?? '' ) +
                    ( content.length ? content.join( '' ) : '' ) +
                    ( data.contentAfter ?? '' ) +
                    ( required ? required : '' ) +
                `</${wrapper_tag}>` +
            '</div>' +
        `</fieldset>`;
    }
}

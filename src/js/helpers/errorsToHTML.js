/**
 * Convert errors to html
 * @param {Object.<string, string|string[]>} errors - Errors object
 * @param {string} prefixSingle - Single error prefix
 * @param {string} suffixSingle - Single error suffix
 * @param {string} prefixItem - Error item prefix
 * @param {string} suffixItem - Error item suffix
 * @param {string} prefixList - List prefix
 * @param {string} suffixList - List suffix
 * @return {string} - Html errors
 */
export function errorsToHTML(
    errors,
    {
        prefixSingle = '<p>',
        suffixSingle = '</p>',
        prefixItem = '<li>',
        suffixItem = '</li>',
        prefixList = '<ol>',
        suffixList = '</ol>',
    } = {}
) {
    const display = [];
    const values = Object.values( errors );
    for ( let i = 0; i < values.length; i++ ) {

        // Get errors from each field
        const err = values[ i ];

        // Join multiple field errors into separate paragraphs
        if ( err instanceof Array ) {
            display.push( `${prefixSingle}${err.join( `${suffixSingle}${prefixSingle}` )}${suffixSingle}` );
        } else {
            display.push( `${prefixSingle}${err}${suffixSingle}` );
        }
    }
    return `${prefixList}${prefixItem}${display.join( `${suffixItem}${prefixItem}` )}${suffixItem}${suffixList}`;
}

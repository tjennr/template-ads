// Script to fix all Textbox objects to be selectable and editable
const fs = require('fs');

let content = fs.readFileSync('static/js/canvas-editor.js', 'utf8');

// Add width and selectable properties to all Textbox objects that don't have them
content = content.replace(
    /new fabric\.Textbox\([^{]*{([^}]*)}(?!\s*,\s*{\s*width)/g,
    (match, properties) => {
        if (!properties.includes('width:') && !properties.includes('selectable:')) {
            const lines = properties.split('\n');
            const lastLine = lines[lines.length - 1];
            const indent = lastLine.match(/^\s*/)[0];
            
            // Add width and selectable properties before the id line
            const idLineIndex = lines.findIndex(line => line.includes('id:'));
            if (idLineIndex > -1) {
                lines.splice(idLineIndex, 0, 
                    indent + 'width: 200,',
                    indent + 'selectable: true,',
                    indent + 'editable: true,'
                );
            } else {
                // If no id line, add at the end
                lines.push(
                    indent + 'width: 200,',
                    indent + 'selectable: true,',
                    indent + 'editable: true'
                );
            }
            
            return match.replace(properties, lines.join('\n'));
        }
        return match;
    }
);

fs.writeFileSync('static/js/canvas-editor.js', content);
console.log('Fixed Textbox objects');
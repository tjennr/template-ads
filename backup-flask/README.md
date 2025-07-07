# Template Ads - Original Flask Version (Backup)

This directory contains the original Flask/Python implementation of the Template Ads application. This serves as a backup in case the TypeScript React version encounters issues and we need to revert.

## Original Features

- Flask backend with Python
- Fabric.js canvas editor
- Multiple template layouts
- Image upload and processing
- Text editing with real-time updates
- Aspect ratio selection
- AI text generation with Google Gemini
- Stock image integration with Shutterstock
- Export to PNG, JPG, and PDF
- Comprehensive keyboard accessibility
- Responsive canvas scaling
- Undo/Redo functionality

## Files Included

- `app.py` - Flask application setup
- `main.py` - Application entry point
- `routes.py` - API endpoints and route handlers
- `templates/index.html` - Main HTML template
- `static/js/canvas-editor.js` - Canvas manipulation logic
- `static/css/custom.css` - Application styles
- `shutterstock_api.py` - Shutterstock integration
- `pyproject.toml` - Python dependencies

## To Run the Original Flask Version

1. Ensure Python dependencies are installed
2. Start the Flask application:
   ```bash
   gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
   ```
3. Access at http://localhost:5000

This backup ensures we can always return to the working Flask implementation if needed during the TypeScript conversion process.
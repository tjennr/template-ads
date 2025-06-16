# Template Ads - Advertisement Designer

## Overview

Template Ads is a Flask-based web application that provides a visual canvas editor for creating professional advertisements. The application leverages Fabric.js for canvas manipulation and offers features like image uploads, text editing, template selection, and PDF export functionality. It's designed as a user-friendly tool for creating marketing materials with drag-and-drop functionality and real-time editing capabilities.

## System Architecture

### Frontend Architecture
- **Canvas Editor**: Built with Fabric.js for interactive canvas manipulation
- **UI Framework**: Bootstrap with dark theme for responsive design
- **Font System**: Google Fonts integration (Source Sans Pro)
- **Icons**: Font Awesome for consistent iconography
- **JavaScript Architecture**: Object-oriented approach with TemplateAdsEditor class

### Backend Architecture
- **Web Framework**: Flask with Werkzeug WSGI middleware
- **Image Processing**: PIL (Pillow) for image manipulation and processing
- **PDF Generation**: ReportLab for exporting designs to PDF format
- **File Handling**: Secure file upload with UUID-based naming
- **Session Management**: Flask sessions with configurable secret key

### Key Components

1. **Canvas Editor (`canvas-editor.js`)**
   - Handles all canvas interactions and object manipulations
   - Manages undo/redo functionality with history tracking
   - Provides zoom controls and text editing capabilities
   - Implements template switching and orientation changes

2. **Flask Routes (`routes.py`)**
   - Image upload endpoint with file validation
   - Base64 encoding for frontend image integration
   - Support for PNG, JPG, JPEG, GIF, BMP, and WebP formats

3. **Application Core (`app.py`)**
   - Flask application factory pattern
   - Upload directory management
   - File size limits (16MB maximum)
   - ProxyFix middleware for deployment compatibility

4. **Frontend Interface (`index.html`)**
   - Responsive Bootstrap-based UI
   - Dark theme integration
   - Canvas container with sidebar controls
   - Template selection and orientation controls

## Data Flow

1. **Image Upload Flow**:
   - User selects image file → Frontend validation → Flask upload endpoint → PIL processing → Base64 encoding → Frontend canvas integration

2. **Canvas Editing Flow**:
   - User interactions → Fabric.js canvas manipulation → State management → History tracking → Real-time preview updates

3. **Export Flow**:
   - Canvas state → Image data extraction → ReportLab PDF generation → File download

## External Dependencies

### Python Dependencies
- **Flask 3.1.1**: Web framework
- **Pillow 11.2.1**: Image processing library
- **ReportLab 4.4.1**: PDF generation
- **Gunicorn 23.0.0**: WSGI HTTP server for production
- **psycopg2-binary 2.9.10**: PostgreSQL adapter (ready for database integration)
- **OpenAI 1.85.0**: AI integration capabilities
- **email-validator 2.2.0**: Email validation utilities

### Frontend Dependencies
- **Fabric.js 5.3.0**: Canvas manipulation library
- **Bootstrap (Replit theme)**: UI framework with dark theme
- **Font Awesome 6.4.0**: Icon library
- **Google Fonts**: Typography (Source Sans Pro)

## Deployment Strategy

### Production Configuration
- **WSGI Server**: Gunicorn with auto-scaling deployment target
- **Port Configuration**: Internal port 5000, external port 80
- **Process Management**: Reuse-port and reload options for development
- **Static Assets**: Served through Flask's static file handling

### Environment Setup
- **Python Version**: 3.11
- **Nix Packages**: Comprehensive image processing libraries (freetype, libjpeg, libwebp, etc.)
- **Database Ready**: PostgreSQL packages included for future database integration
- **SSL Support**: OpenSSL package included

### File Structure
```
/
├── app.py              # Flask application factory
├── main.py             # Application entry point
├── routes.py           # Route handlers and API endpoints
├── uploads/            # Temporary file storage
├── templates/          # Jinja2 templates
├── static/
│   ├── css/           # Custom stylesheets
│   └── js/            # Frontend JavaScript
└── pyproject.toml     # Python dependencies
```

## Recent Changes
- June 16, 2025: Fixed Split Top template image positioning for vertical orientation by positioning image at top edge instead of center
- June 16, 2025: Added "Call to Action" subheader to content sidebar for better organization
- June 16, 2025: Implemented floating CTA toolbar with font family, size, text color, and button color controls
- June 16, 2025: Created SVG graphics for all orientation buttons (5:4, 1:1, 4:5) replacing basic icons
- June 16, 2025: Added CTA toolbar event handling and positioning system similar to text toolbar
- June 16, 2025: Fixed JavaScript null value errors in all template methods by adding safe null checks
- June 16, 2025: Improved canvas initialization and template switching to prevent formatting issues when changing orientations
- June 16, 2025: Simplified orientation change functionality by reloading templates completely instead of repositioning elements

## Changelog
- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
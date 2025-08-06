# Template Ads - Advertisement Designer

## Overview
Template Ads is a Flask-based web application providing a visual canvas editor for creating professional advertisements. It offers features like image uploads, text editing, template selection, and PDF export. The application aims to be a user-friendly tool for marketing material creation with drag-and-drop functionality and real-time editing.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Canvas Editor**: Fabric.js for interactive canvas manipulation, including undo/redo, zoom, and text editing.
- **UI Framework**: Bootstrap with a dark theme for responsive design.
- **Font System**: Google Fonts integration (SF Pro Text, Roboto, Open Sans, Lato, Montserrat).
- **Icons**: Font Awesome.
- **JavaScript Architecture**: Object-oriented approach with `TemplateAdsEditor` class.

### Backend Architecture
- **Web Framework**: Flask with Werkzeug WSGI middleware.
- **Image Processing**: PIL (Pillow) for manipulation and secure file uploads with UUID-based naming.
- **PDF Generation**: ReportLab for exporting designs.
- **AI Integration**: Google Gemini for text and image generation.

### Key Components
- **Canvas Editor (`canvas-editor.js`)**: Manages all canvas interactions, object manipulations, history tracking, and template/orientation changes.
- **Flask Routes (`routes.py`)**: Handles image uploads (PNG, JPG, JPEG, GIF, BMP, WebP), Base64 encoding, and AI API endpoints.
- **Application Core (`app.py`)**: Flask application factory, manages upload directories, file size limits (16MB), and deployment compatibility (ProxyFix).
- **Frontend Interface (`index.html`)**: Responsive Bootstrap UI with canvas container, sidebar controls, and integrated image search (Shutterstock) and AI image generation.

### Design Decisions
- **UI/UX**: Single-section sidebar with three main headings (Template, Content, Export), fixed header, left sidebar panel (520px), and right canvas area. Dark theme with updated gray colors for consistency.
- **Canvas Behavior**: Canva-style responsive scaling with minimum size constraints (40% for all aspect ratios). Text objects use Textbox with `lockScalingFlip` for text wrapping without font scaling during resize.
- **Accessibility**: Comprehensive keyboard accessibility for canvas elements, floating toolbars, and input fields.
- **Input Fields**: Title/subtitle fields with character counters and integrated AI generation buttons. Subtitle input is a textarea for multi-line support.
- **Floating Toolbars**: Compact design with glassmorphism effect, dynamic resizing for CTA buttons, and combined effects dropdown for shadow and outline controls.
- **Image Sources**: Tabbed interface for image uploads, Shutterstock stock image search, and Google Gemini AI image generation.
- **Template Management**: Styling preservation during template switching, dynamic CTA button resizing, and maintenance of text colors in split templates. "Minimal" template has been removed.

## External Dependencies

### Python Dependencies
- **Flask**: Web framework.
- **Pillow**: Image processing.
- **ReportLab**: PDF generation.
- **Gunicorn**: WSGI HTTP server.
- **psycopg2-binary**: PostgreSQL adapter (for future integration).
- **email-validator**: Email validation.

### Frontend Dependencies
- **Fabric.js**: Canvas manipulation.
- **Bootstrap (Replit theme)**: UI framework.
- **Font Awesome**: Icon library.
- **Google Fonts**: Typography (Source Sans Pro, Roboto, Open Sans, Lato, Montserrat).
- **Shutterstock API**: Stock image search integration.
- **Google Gemini API**: AI text and image generation.
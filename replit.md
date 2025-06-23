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
- June 16, 2025: Implemented always-visible floating controls for undo, reset, and zoom buttons positioned in top-right corner
- June 16, 2025: Removed canvas border container for cleaner interface with direct canvas access
- June 16, 2025: Added responsive floating controls that move to bottom on mobile devices with icon-only display
- June 16, 2025: Enhanced floating controls with glassmorphism effect using backdrop-filter and hover animations
- June 16, 2025: Implemented immediate toolbar changes using 'input' events for real-time color and font feedback
- June 16, 2025: Fixed Split Top template image positioning with proper clipping logic for vertical orientation
- June 16, 2025: Added "Call to Action" subheader to content sidebar for better organization
- June 16, 2025: Created floating CTA toolbar with font family, size, text color, and button color controls
- June 16, 2025: Created SVG graphics for all orientation buttons (5:4, 1:1, 4:5) replacing basic icons
- June 16, 2025: Fixed all split template clipping logic for 4:5 vertical orientation - Split Left shows image in top half, Split Right in bottom half, Split Top in center area
- June 16, 2025: Standardized Split Left text sizing and positioning to match Split Right in horizontal orientation for consistency
- June 16, 2025: Updated split template image scaling to fill entire designated half areas using Math.max scaling with proper clipping
- June 16, 2025: Replaced default office image with new gray placeholder image featuring clean background and image placeholder icon
- June 17, 2025: Updated placeholder image to new design with refined image placeholder icon
- June 17, 2025: Fixed template switching issue where images uploaded to split templates retained incorrect positioning when switching to full templates (Classic, Grid, Minimal)
- June 17, 2025: Fixed CTA floating toolbar display issue - toolbar now properly appears when CTA button is clicked
- June 17, 2025: Added comprehensive keyboard accessibility - canvas elements are now tab-navigable with visual focus indicators and screen reader announcements
- June 17, 2025: Enhanced keyboard navigation - users can now tab out of canvas, CTA buttons show proper visual focus, and floating toolbars are fully keyboard accessible
- June 17, 2025: Completed accessibility implementation - image upload buttons are tab-accessible, CTA checkbox supports keyboard interaction, replaced custom focus styling with standard selection highlighting, arrow keys move selected elements with toolbar position updates
- June 17, 2025: Added background color accessibility - users can tab to background for color changes, fixed floating toolbar color scheme to match website theme
- June 17, 2025: Refined background keyboard interaction - toolbar now appears only when background is actively selected with Enter key, not just tabbed to
- June 17, 2025: Enhanced floating toolbar styling - font size inputs and checkboxes now use bright white backgrounds with proper contrast matching website theme
- June 18, 2025: Fixed reset button functionality - now properly resets all form values, template selection, orientation, font settings, CTA state, clears history, hides toolbars, and reloads default template with placeholder images
- June 18, 2025: Enhanced click-to-select functionality - users can now click on any ad element (text, images, CTA buttons) to select them and move with arrow keys
- June 18, 2025: Improved arrow key movement - selected elements can be moved with arrow keys (5px normal, 10px with Shift), includes boundary checking to keep elements within canvas
- June 18, 2025: Fixed floating toolbar persistence - toolbars now remain visible after clicking elements until user clicks elsewhere, ensuring proper selection feedback
- June 18, 2025: Redesigned outline controls in floating toolbar - replaced outline toggle button with intuitive dropdown (None/Thin/Medium/Thick), outline color picker only appears when outline is enabled for cleaner minimalist interface
- June 18, 2025: Enhanced shadow and outline controls with button-triggered dropdowns - clicking buttons reveals dropdown menus with effect options and color controls, providing better visual hierarchy and progressive disclosure
- June 18, 2025: Fixed dropdown visibility and styling - dropdowns now properly hidden by default and only appear when buttons clicked, updated colors to white background with proper contrast matching website theme
- June 18, 2025: Redesigned orientation and templates sections as horizontal dropdowns - both controls now appear side-by-side in a single row, displaying currently selected option when closed and revealing all options when clicked for cleaner, more compact interface
- June 18, 2025: Enhanced dropdown behavior - orientation and template dropdowns now remain open after selection until user clicks outside, providing better user experience and allowing multiple selections without reopening
- June 18, 2025: Implemented Canva-style smart guides and snap-to-grid functionality - elements now show visual alignment guides (red for canvas center, teal for object alignment) and automatically snap into position when within 8 pixels of alignment points, enhancing precision in design layout
- June 18, 2025: Fixed smart guides glitching by disabling automatic snapping - guides now provide visual-only alignment feedback without forcing element positioning, giving users full control while maintaining helpful alignment hints
- June 20, 2025: Fixed reset button functionality to preserve current template and orientation instead of always reverting to Classic template
- June 20, 2025: Added redo functionality alongside existing undo - users now have both undo and redo buttons with proper state management and history tracking
- June 20, 2025: Fixed dropdown accessibility - orientation and template dropdowns now automatically close when users tab away to prevent screen clutter during keyboard navigation
- June 20, 2025: Created compact undo/redo button group with attached styling - removed text labels and kept only arrow icons for cleaner interface
- June 20, 2025: Fixed font loading issue - added missing Google Fonts (Roboto, Open Sans, Lato, Montserrat) so all font options in the selector now display their actual typefaces instead of falling back to system fonts
- June 20, 2025: Implemented styling preservation during template switching - text effects (font, size, color, shadow, outline), CTA button styling (text and button color), and background color are now maintained when changing between templates
- June 20, 2025: Added dynamic CTA button resizing - buttons now automatically adjust their width and height to fit text content when changing templates, orientations, or modifying CTA text/font properties
- June 20, 2025: Fixed text color preservation logic - split templates (Split Left, Split Right, Split Top) now maintain black text against white backgrounds while preserving truly customized colors during template switching
- June 20, 2025: Fixed undo system to prevent undoing template initialization - undo no longer removes default images or template elements that weren't user-created, protecting against accidental removal of baseline content
- June 20, 2025: Removed redundant state saving from template and orientation switching - eliminated duplicate saveState calls that created problematic undo points during template/orientation changes
- June 20, 2025: Fixed canvas event handlers to respect template loading flag - prevented automatic state saving during template operations by checking isLoadingTemplate flag in object:added, object:removed, object:modified, and path:created events
- June 20, 2025: Removed final saveState call from loadTemplate function - eliminated the last source of problematic undo states during template switching
- June 20, 2025: Added comprehensive text formatting controls to floating toolbar - implemented bold, italic, underline toggle buttons and text alignment dropdown selector
- June 20, 2025: Enhanced text formatting functionality - formatting buttons show active/inactive states based on current text selection, alignment dropdown reflects current text alignment
- June 20, 2025: Finalized text alignment dropdown with clean text labels - reverted to simple text options (Left, Center, Right, Justify) for clarity and user preference
- June 23, 2025: Restructured sidebar interface into unified single-section design with three main headings - Template (orientation, templates, logo), Content (main image, title, subtitle, CTA), and Export (export button) for cleaner organization and improved user experience
- June 23, 2025: Implemented three-section layout with fixed header, left sidebar panel (480px), and right canvas area (#F5F5F5 background)
- June 23, 2025: Updated color scheme - white backgrounds for header and sidebar with improved text contrast (#495057, #212529) for better readability
- June 23, 2025: Reorganized sidebar layout - orientation and template dropdowns now in same row, CTA checkbox moved to left of text input, removed tagline from header
- June 23, 2025: Enhanced input field widths with full-width styling for title and subtitle inputs for better usability
- June 23, 2025: Added drop shadow to ad canvas borders for enhanced visual depth and professional appearance
- June 23, 2025: Changed horizontal orientation from 5:4 to 1.91:1 aspect ratio with descriptive labels: "Horizontal (1.91:1)", "Square (1:1)", "Vertical (4:5)"
- June 23, 2025: Set vertical template as default selection on page load instead of horizontal
- June 23, 2025: Increased left sidebar panel width from 400px to 480px (20% bigger) for better control spacing and usability
- June 23, 2025: Changed subtitle input from single-line text input to textarea for paragraph text support with text wrapping and multi-line capability
- June 23, 2025: Moved sidebar scrollbar from right side to left side using CSS direction properties for better visual alignment
- June 23, 2025: Restored floating toolbar styling to original glassmorphism design with proper spacing, colors, and backdrop-filter effects
- June 23, 2025: Implemented auto-hiding scrollbar that appears only when user hovers over sidebar panel
- June 23, 2025: Added rounded corners (12px border-radius) to ad canvas for modern, polished appearance
- June 23, 2025: Added brand consistency controls in Template section with font and color dropdowns for title and subtitle, ensuring synchronization between sidebar controls and floating toolbars for unified brand management

## Changelog
- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
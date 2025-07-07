# Template Ads - TypeScript React Version

This is the TypeScript React version of the Template Ads application, providing a modern, type-safe implementation of the advertisement design tool.

## Features

- **Aspect Ratio Selection**: Vertical (4:5), Square (1:1), and Horizontal (1.91:1)
- **Template Selection**: Classic, Split Left, Split Right, Split Top, and Grid layouts
- **Image Upload**: Upload and replace images with proper scaling and positioning
- **Text Editing**: Real-time title and subtitle editing
- **TypeScript**: Full type safety and better development experience
- **Fabric.js Integration**: Advanced canvas manipulation capabilities

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
  components/
    TemplateAds.tsx     # Main component
    TemplateAds.css     # Styles
  types/
    index.ts            # TypeScript interfaces
  index.tsx             # Entry point
  index.css             # Global styles
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Template Layouts

1. **Classic**: Full-width image with centered text below
2. **Split Left**: Image on left, text on right
3. **Split Right**: Text on left, image on right
4. **Split Top**: Image on top, text below
5. **Grid**: 2x2 grid layout with image and text positioned strategically

## Future Enhancements

- CTA buttons
- Advanced styling controls
- Export functionality (PNG, JPG, PDF)
- AI-powered text generation
- Stock image integration
- Undo/Redo functionality
- Zoom controls
- Keyboard shortcuts
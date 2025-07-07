import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { CanvasSize, Template, Orientation } from '../types';
import './TemplateAds.css';

const TemplateAds: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [currentOrientation, setCurrentOrientation] = useState<string>('vertical');
  const [currentTemplate, setCurrentTemplate] = useState<string>('classic');
  const [titleText, setTitleText] = useState<string>('Your Amazing Product');
  const [subtitleText, setSubtitleText] = useState<string>('Get started today with our incredible solution');
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 400, height: 500 });

  const orientations: Orientation[] = [
    { id: 'vertical', name: 'Vertical', displayName: 'Vertical (4:5)', aspectRatio: 0.8 },
    { id: 'square', name: 'Square', displayName: 'Square (1:1)', aspectRatio: 1.0 },
    { id: 'horizontal', name: 'Horizontal', displayName: 'Horizontal (1.91:1)', aspectRatio: 1.91 }
  ];

  const templates: Template[] = [
    { id: 'classic', name: 'Classic', displayName: 'Classic' },
    { id: 'splitLeft', name: 'Split Left', displayName: 'Split Left' },
    { id: 'splitRight', name: 'Split Right', displayName: 'Split Right' },
    { id: 'splitTop', name: 'Split Top', displayName: 'Split Top' },
    { id: 'grid', name: 'Grid', displayName: 'Grid' }
  ];

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true
      });
      
      setCanvas(fabricCanvas);
      
      // Initialize with default content
      loadDefaultContent(fabricCanvas);
      
      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []);

  // Load default content
  const loadDefaultContent = useCallback((fabricCanvas: fabric.Canvas) => {
    fabricCanvas.clear();
    fabricCanvas.setBackgroundColor('#ffffff', fabricCanvas.renderAll.bind(fabricCanvas));
    
    // Load default template
    loadTemplate(fabricCanvas, currentTemplate);
  }, [currentTemplate]);

  // Load template
  const loadTemplate = useCallback((fabricCanvas: fabric.Canvas, templateId: string) => {
    const width = fabricCanvas.width || 400;
    const height = fabricCanvas.height || 500;

    // Clear existing objects except background
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if ((obj as any).selectable !== false) {
        fabricCanvas.remove(obj);
      }
    });

    // Add background
    const background = new fabric.Rect({
      left: 0,
      top: 0,
      width: width,
      height: height,
      fill: '#ffffff',
      selectable: false,
      evented: false
    });
    fabricCanvas.add(background);

    switch (templateId) {
      case 'classic':
        loadClassicTemplate(fabricCanvas, width, height);
        break;
      case 'splitLeft':
        loadSplitLeftTemplate(fabricCanvas, width, height);
        break;
      case 'splitRight':
        loadSplitRightTemplate(fabricCanvas, width, height);
        break;
      case 'splitTop':
        loadSplitTopTemplate(fabricCanvas, width, height);
        break;
      case 'grid':
        loadGridTemplate(fabricCanvas, width, height);
        break;
      default:
        loadClassicTemplate(fabricCanvas, width, height);
    }

    fabricCanvas.renderAll();
  }, [titleText, subtitleText]);

  const loadClassicTemplate = (fabricCanvas: fabric.Canvas, width: number, height: number) => {
    // Add placeholder image
    const imageRect = new fabric.Rect({
      left: width / 2,
      top: height * 0.3,
      width: width * 0.8,
      height: height * 0.4,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 2,
      rx: 8,
      ry: 8,
      originX: 'center',
      originY: 'center'
    });
    (imageRect as any).imageType = 'main';
    fabricCanvas.add(imageRect);

    // Add image placeholder text
    const imagePlaceholder = new fabric.Text('Click to upload image', {
      left: width / 2,
      top: height * 0.3,
      fontSize: 14,
      fontFamily: 'SF Pro Text',
      fill: '#999',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      selectable: false
    });
    fabricCanvas.add(imagePlaceholder);

    // Add title text
    const titleTextObj = new fabric.Textbox(titleText, {
      left: width / 2,
      top: height * 0.7,
      width: width * 0.8,
      fontSize: 24,
      fontFamily: 'SF Pro Text',
      fill: '#212529',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (titleTextObj as any).textType = 'title';
    fabricCanvas.add(titleTextObj);

    // Add subtitle text
    const subtitleTextObj = new fabric.Textbox(subtitleText, {
      left: width / 2,
      top: height * 0.85,
      width: width * 0.8,
      fontSize: 16,
      fontFamily: 'SF Pro Text',
      fill: '#495057',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (subtitleTextObj as any).textType = 'subtitle';
    fabricCanvas.add(subtitleTextObj);
  };

  const loadSplitLeftTemplate = (fabricCanvas: fabric.Canvas, width: number, height: number) => {
    // Left side image
    const imageRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: width * 0.5,
      height: height,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top'
    });
    (imageRect as any).imageType = 'main';
    fabricCanvas.add(imageRect);

    // Right side content
    const titleTextObj = new fabric.Textbox(titleText, {
      left: width * 0.75,
      top: height * 0.4,
      width: width * 0.4,
      fontSize: 20,
      fontFamily: 'SF Pro Text',
      fill: '#212529',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (titleTextObj as any).textType = 'title';
    fabricCanvas.add(titleTextObj);

    const subtitleTextObj = new fabric.Textbox(subtitleText, {
      left: width * 0.75,
      top: height * 0.6,
      width: width * 0.4,
      fontSize: 14,
      fontFamily: 'SF Pro Text',
      fill: '#495057',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (subtitleTextObj as any).textType = 'subtitle';
    fabricCanvas.add(subtitleTextObj);
  };

  const loadSplitRightTemplate = (fabricCanvas: fabric.Canvas, width: number, height: number) => {
    // Left side content
    const titleTextObj = new fabric.Textbox(titleText, {
      left: width * 0.25,
      top: height * 0.4,
      width: width * 0.4,
      fontSize: 20,
      fontFamily: 'SF Pro Text',
      fill: '#212529',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (titleTextObj as any).textType = 'title';
    fabricCanvas.add(titleTextObj);

    const subtitleTextObj = new fabric.Textbox(subtitleText, {
      left: width * 0.25,
      top: height * 0.6,
      width: width * 0.4,
      fontSize: 14,
      fontFamily: 'SF Pro Text',
      fill: '#495057',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (subtitleTextObj as any).textType = 'subtitle';
    fabricCanvas.add(subtitleTextObj);

    // Right side image
    const imageRect = new fabric.Rect({
      left: width * 0.5,
      top: 0,
      width: width * 0.5,
      height: height,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top'
    });
    (imageRect as any).imageType = 'main';
    fabricCanvas.add(imageRect);
  };

  const loadSplitTopTemplate = (fabricCanvas: fabric.Canvas, width: number, height: number) => {
    // Top image
    const imageRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: width,
      height: height * 0.6,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top'
    });
    (imageRect as any).imageType = 'main';
    fabricCanvas.add(imageRect);

    // Bottom content
    const titleTextObj = new fabric.Textbox(titleText, {
      left: width / 2,
      top: height * 0.75,
      width: width * 0.8,
      fontSize: 20,
      fontFamily: 'SF Pro Text',
      fill: '#212529',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (titleTextObj as any).textType = 'title';
    fabricCanvas.add(titleTextObj);

    const subtitleTextObj = new fabric.Textbox(subtitleText, {
      left: width / 2,
      top: height * 0.9,
      width: width * 0.8,
      fontSize: 14,
      fontFamily: 'SF Pro Text',
      fill: '#495057',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (subtitleTextObj as any).textType = 'subtitle';
    fabricCanvas.add(subtitleTextObj);
  };

  const loadGridTemplate = (fabricCanvas: fabric.Canvas, width: number, height: number) => {
    // 2x2 grid layout
    const imageRect = new fabric.Rect({
      left: width * 0.05,
      top: height * 0.05,
      width: width * 0.4,
      height: height * 0.4,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top'
    });
    (imageRect as any).imageType = 'main';
    fabricCanvas.add(imageRect);

    const titleTextObj = new fabric.Textbox(titleText, {
      left: width * 0.75,
      top: height * 0.25,
      width: width * 0.4,
      fontSize: 18,
      fontFamily: 'SF Pro Text',
      fill: '#212529',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (titleTextObj as any).textType = 'title';
    fabricCanvas.add(titleTextObj);

    const subtitleTextObj = new fabric.Textbox(subtitleText, {
      left: width / 2,
      top: height * 0.7,
      width: width * 0.9,
      fontSize: 14,
      fontFamily: 'SF Pro Text',
      fill: '#495057',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (subtitleTextObj as any).textType = 'subtitle';
    fabricCanvas.add(subtitleTextObj);
  };

  // Update canvas size based on orientation
  const updateCanvasSize = useCallback((orientation: string) => {
    if (!canvas) return;

    let newSize: CanvasSize;
    switch (orientation) {
      case 'horizontal':
        newSize = { width: 600, height: 314 };
        break;
      case 'square':
        newSize = { width: 400, height: 400 };
        break;
      case 'vertical':
      default:
        newSize = { width: 400, height: 500 };
        break;
    }

    setCanvasSize(newSize);
    canvas.setDimensions(newSize);
    loadTemplate(canvas, currentTemplate);
  }, [canvas, currentTemplate, loadTemplate]);

  // Handle orientation change
  const handleOrientationChange = useCallback((orientation: string) => {
    setCurrentOrientation(orientation);
    updateCanvasSize(orientation);
  }, [updateCanvasSize]);

  // Handle template change
  const handleTemplateChange = useCallback((template: string) => {
    setCurrentTemplate(template);
    if (canvas) {
      loadTemplate(canvas, template);
    }
  }, [canvas, loadTemplate]);

  // Handle text updates
  const handleTextUpdate = useCallback((type: string, value: string) => {
    if (!canvas) return;
    
    const textObject = canvas.getObjects().find(obj => 
      obj.type === 'textbox' && (obj as any).textType === type
    ) as fabric.Textbox;
    
    if (textObject) {
      textObject.set({ text: value });
      canvas.renderAll();
    }

    // Update local state
    if (type === 'title') {
      setTitleText(value);
    } else if (type === 'subtitle') {
      setSubtitleText(value);
    }
  }, [canvas]);

  // Handle image upload
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      fabric.Image.fromURL(imageUrl, (img) => {
        if (!img) return;

        // Find existing image placeholder
        const existingImage = canvas.getObjects().find(obj => 
          (obj as any).imageType === 'main'
        );
        
        if (existingImage) {
          // Get the bounds of the existing placeholder
          const bounds = existingImage.getBoundingRect();
          
          // Scale image to fit placeholder bounds
          const scaleX = bounds.width / (img.width || 1);
          const scaleY = bounds.height / (img.height || 1);
          const scale = Math.max(scaleX, scaleY); // Use max to fill the area

          img.set({
            left: existingImage.left,
            top: existingImage.top,
            scaleX: scale,
            scaleY: scale,
            originX: existingImage.originX,
            originY: existingImage.originY
          });

          // Set clipping path if needed
          if (currentTemplate !== 'classic') {
            const clipPath = new fabric.Rect({
              left: -bounds.width / 2,
              top: -bounds.height / 2,
              width: bounds.width,
              height: bounds.height,
              originX: 'center',
              originY: 'center'
            });
            img.clipPath = clipPath;
          }

          (img as any).imageType = 'main';
          
          // Remove placeholder and add new image
          canvas.remove(existingImage);
          canvas.add(img);
          canvas.renderAll();
        }
      });
    };
    
    reader.readAsDataURL(file);
  }, [canvas, currentTemplate]);

  return (
    <div className="template-ads">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>Template Ads</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-layout">
          {/* Left Sidebar */}
          <div className="sidebar-panel">
            <div className="sidebar-content">
              
              {/* Template Section */}
              <div className="sidebar-section">
                <h5 className="section-heading">Template</h5>
                
                {/* Orientation */}
                <div className="control-item">
                  <label className="control-label">Aspect Ratio</label>
                  <select 
                    className="form-select"
                    value={currentOrientation}
                    onChange={(e) => handleOrientationChange(e.target.value)}
                  >
                    {orientations.map(orientation => (
                      <option key={orientation.id} value={orientation.id}>
                        {orientation.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Template */}
                <div className="control-item">
                  <label className="control-label">Template</label>
                  <select 
                    className="form-select"
                    value={currentTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                  >
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content Section */}
              <div className="sidebar-section">
                <h5 className="section-heading">Content</h5>
                
                {/* Main Image */}
                <div className="control-item">
                  <label className="control-label">Main Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="form-control"
                  />
                </div>

                {/* Title */}
                <div className="control-item">
                  <label className="control-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={titleText}
                    onChange={(e) => handleTextUpdate('title', e.target.value)}
                    placeholder="Enter title"
                  />
                </div>

                {/* Subtitle */}
                <div className="control-item">
                  <label className="control-label">Subtitle</label>
                  <textarea
                    className="form-control"
                    value={subtitleText}
                    onChange={(e) => handleTextUpdate('subtitle', e.target.value)}
                    placeholder="Enter subtitle"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="canvas-area">
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateAds;
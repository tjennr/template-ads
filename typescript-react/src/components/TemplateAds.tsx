import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Rect, Textbox, Image } from 'fabric';
import { CanvasSize, Template, Orientation } from '../types';

const TemplateAds: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
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
      const fabricCanvas = new Canvas(canvasRef.current, {
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
  const loadDefaultContent = useCallback((fabricCanvas: Canvas) => {
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    
    // Load default template
    loadTemplate(fabricCanvas, currentTemplate);
  }, [currentTemplate]);

  // Load template
  const loadTemplate = useCallback((fabricCanvas: Canvas, templateId: string) => {
    const width = fabricCanvas.width || 400;
    const height = fabricCanvas.height || 500;

    // Clear existing objects except background
    const objects = fabricCanvas.getObjects();
    objects.forEach((obj: any) => {
      if (obj.selectable !== false) {
        fabricCanvas.remove(obj);
      }
    });

    // Set background color
    fabricCanvas.backgroundColor = '#ffffff';

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

  const loadClassicTemplate = (fabricCanvas: Canvas, width: number, height: number) => {
    // Add placeholder image
    const imageRect = new Rect({
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
    const imagePlaceholder = new Textbox('Click to upload image', {
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
    const titleTextObj = new Textbox(titleText, {
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
    const subtitleTextObj = new Textbox(subtitleText, {
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

  const loadSplitLeftTemplate = (fabricCanvas: Canvas, width: number, height: number) => {
    // Left side image
    const imageRect = new Rect({
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
    const titleTextObj = new Textbox(titleText, {
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

    const subtitleTextObj = new Textbox(subtitleText, {
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

  const loadSplitRightTemplate = (fabricCanvas: Canvas, width: number, height: number) => {
    // Left side content
    const titleTextObj = new Textbox(titleText, {
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

    const subtitleTextObj = new Textbox(subtitleText, {
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
    const imageRect = new Rect({
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

  const loadSplitTopTemplate = (fabricCanvas: Canvas, width: number, height: number) => {
    // Top image
    const imageRect = new Rect({
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
    const titleTextObj = new Textbox(titleText, {
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

    const subtitleTextObj = new Textbox(subtitleText, {
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

  const loadGridTemplate = (fabricCanvas: Canvas, width: number, height: number) => {
    // 2x2 grid layout
    const imageRect = new Rect({
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

    const titleTextObj = new Textbox(titleText, {
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

    const subtitleTextObj = new Textbox(subtitleText, {
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
    
    const textObject = canvas.getObjects().find((obj: any) => 
      obj.type === 'textbox' && obj.textType === type
    ) as any;
    
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
      
      Image.fromURL(imageUrl, (img: any) => {
        if (!img) return;

        // Find existing image placeholder
        const existingImage = canvas.getObjects().find((obj: any) => 
          obj.imageType === 'main'
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
            const clipPath = new Rect({
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
    <div className="bg-yellow-50 font-sf-pro h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-border-color h-[70px] fixed left-0 right-0 top-0 z-[1000] px-5 py-3.5">
        <div className="flex items-center h-full">
          <h1 className="text-text-primary text-2xl font-semibold m-0">Template Ads</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="h-[calc(100vh-70px)] mt-[70px]">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="bg-white border-r border-border-color flex-shrink-0 overflow-y-auto w-[520px]">
            <div className="p-5">
              
              {/* Template Section */}
              <div className="mb-5">
                <h5 className="text-text-primary text-sm font-semibold mb-4">Template</h5>
                
                {/* Orientation */}
                <div className="mb-4">
                  <label className="block text-text-secondary text-sm font-medium mb-2">Aspect Ratio</label>
                  <select 
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 font-sf-pro text-sm font-normal transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/10"
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
                <div className="mb-4">
                  <label className="block text-text-secondary text-sm font-medium mb-2">Template</label>
                  <select 
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 font-sf-pro text-sm font-normal transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/10"
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
              <div className="mb-5">
                <h5 className="text-text-primary text-sm font-semibold mb-4">Content</h5>
                
                {/* Main Image */}
                <div className="mb-4">
                  <label className="block text-text-secondary text-sm font-medium mb-2">Main Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 font-sf-pro text-sm font-normal transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/10 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-blue file:text-white hover:file:bg-brand-blue/90"
                  />
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-text-secondary text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 font-sf-pro text-sm font-normal transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/10"
                    value={titleText}
                    onChange={(e) => handleTextUpdate('title', e.target.value)}
                    placeholder="Enter title"
                  />
                </div>

                {/* Subtitle */}
                <div className="mb-4">
                  <label className="block text-text-secondary text-sm font-medium mb-2">Subtitle</label>
                  <textarea
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 font-sf-pro text-sm font-normal transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/10 min-h-[80px] resize-y"
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
          <div className="flex-1 flex items-center justify-center bg-canvas-bg overflow-hidden">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden p-0">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="rounded-lg block"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateAds;
import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Image, Rect } from 'fabric';
import { TemplateLayouts } from '../components/templates/TemplateLayouts';
import { CanvasSize } from '../types';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [currentOrientation, setCurrentOrientation] = useState<string>('vertical');
  const [currentTemplate, setCurrentTemplate] = useState<string>('classic');
  const [titleText, setTitleText] = useState<string>('Your Amazing Product');
  const [subtitleText, setSubtitleText] = useState<string>('Get started today with our incredible solution');
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 400, height: 500 });

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true
      });
      
      setCanvas(fabricCanvas);
      
      // Load initial template
      TemplateLayouts.loadTemplate(fabricCanvas, currentTemplate, canvasSize.width, canvasSize.height, {
        titleText,
        subtitleText
      });
      
      return () => {
        fabricCanvas.dispose();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    TemplateLayouts.loadTemplate(canvas, currentTemplate, newSize.width, newSize.height, {
      titleText,
      subtitleText
    });
  }, [canvas, currentTemplate, titleText, subtitleText]);

  // Handle orientation change
  const handleOrientationChange = useCallback((orientation: string) => {
    setCurrentOrientation(orientation);
    updateCanvasSize(orientation);
  }, [updateCanvasSize]);

  // Handle template change
  const handleTemplateChange = useCallback((template: string) => {
    setCurrentTemplate(template);
    if (canvas) {
      TemplateLayouts.loadTemplate(canvas, template, canvasSize.width, canvasSize.height, {
        titleText,
        subtitleText
      });
    }
  }, [canvas, canvasSize, titleText, subtitleText]);

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

  return {
    canvasRef,
    canvas,
    currentOrientation,
    currentTemplate,
    titleText,
    subtitleText,
    canvasSize,
    handleOrientationChange,
    handleTemplateChange,
    handleTextUpdate,
    handleImageUpload
  };
};
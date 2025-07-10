import { useEffect, useRef, useState, useCallback } from 'react';
import { TemplateLayouts, CanvasElement } from '../components/templates/TemplateLayouts';
import { CanvasSize } from '../types';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentOrientation, setCurrentOrientation] = useState<string>('vertical');
  const [currentTemplate, setCurrentTemplate] = useState<string>('classic');
  const [titleText, setTitleText] = useState<string>('Your Amazing Product');
  const [subtitleText, setSubtitleText] = useState<string>('Get started today with our incredible solution');
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 400, height: 500 });
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);

  // Draw canvas elements
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach(element => {
      switch (element.type) {
        case 'rect':
          // Draw rectangle (image placeholder)
          ctx.fillStyle = element.backgroundColor || '#f0f0f0';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          
          // Draw border
          ctx.strokeStyle = '#ddd';
          ctx.lineWidth = 1;
          ctx.strokeRect(element.x, element.y, element.width, element.height);

          // If we have an uploaded image and this is the main image, draw it
          if (element.id === 'main-image' && uploadedImage) {
            // Calculate scaling to fit and cover the rectangle
            const scaleX = element.width / uploadedImage.width;
            const scaleY = element.height / uploadedImage.height;
            const scale = Math.max(scaleX, scaleY);
            
            const scaledWidth = uploadedImage.width * scale;
            const scaledHeight = uploadedImage.height * scale;
            
            const offsetX = (element.width - scaledWidth) / 2;
            const offsetY = (element.height - scaledHeight) / 2;

            ctx.save();
            ctx.beginPath();
            ctx.rect(element.x, element.y, element.width, element.height);
            ctx.clip();
            
            ctx.drawImage(
              uploadedImage,
              element.x + offsetX,
              element.y + offsetY,
              scaledWidth,
              scaledHeight
            );
            ctx.restore();
          } else if (element.id === 'main-image') {
            // Draw placeholder text
            ctx.fillStyle = '#999';
            ctx.font = '14px SF Pro Text, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(
              'Click to upload image',
              element.x + element.width / 2,
              element.y + element.height / 2
            );
          }
          break;

        case 'text':
          ctx.fillStyle = element.color || '#000';
          ctx.font = `${element.fontSize || 16}px ${element.fontFamily || 'SF Pro Text, sans-serif'}`;
          ctx.textAlign = element.textAlign || 'center';
          
          // Handle text wrapping for long text
          const words = (element.text || '').split(' ');
          const lineHeight = (element.fontSize || 16) * 1.2;
          let line = '';
          let y = element.y;

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > element.width && n > 0) {
              ctx.fillText(line, element.x, y);
              line = words[n] + ' ';
              y += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, element.x, y);
          break;
      }
    });
  }, [elements, uploadedImage]);

  // Initialize canvas and load template
  useEffect(() => {
    const newElements = TemplateLayouts.createTemplate(currentTemplate, canvasSize.width, canvasSize.height, {
      titleText,
      subtitleText
    });
    setElements(newElements);
  }, [currentTemplate, canvasSize, titleText, subtitleText]);

  // Redraw canvas when elements change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Update canvas size based on orientation
  const updateCanvasSize = useCallback((orientation: string) => {
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
  }, []);

  // Handle orientation change
  const handleOrientationChange = useCallback((orientation: string) => {
    setCurrentOrientation(orientation);
    updateCanvasSize(orientation);
  }, [updateCanvasSize]);

  // Handle template change
  const handleTemplateChange = useCallback((template: string) => {
    setCurrentTemplate(template);
  }, []);

  // Handle text updates
  const handleTextUpdate = useCallback((type: string, value: string) => {
    if (type === 'title') {
      setTitleText(value);
    } else if (type === 'subtitle') {
      setSubtitleText(value);
    }
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
      };
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  }, []);

  return {
    canvasRef,
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
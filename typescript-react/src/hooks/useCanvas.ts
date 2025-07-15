import { useState, useCallback } from 'react';
import { CanvasSize } from '../types';

export const useCanvas = () => {
  const [currentOrientation, setCurrentOrientation] = useState<string>('vertical');
  const [currentTemplate, setCurrentTemplate] = useState<string>('classic');
  const [titleText, setTitleText] = useState<string>('Your Amazing Product');
  const [subtitleText, setSubtitleText] = useState<string>('Get started today with our incredible solution');
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 400, height: 500 });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);



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
      setUploadedImage(e.target?.result as string);
    };
    
    reader.readAsDataURL(file);
  }, []);

  return {
    currentOrientation,
    currentTemplate,
    titleText,
    subtitleText,
    canvasSize,
    uploadedImage,
    handleOrientationChange,
    handleTemplateChange,
    handleTextUpdate,
    handleImageUpload
  };
};
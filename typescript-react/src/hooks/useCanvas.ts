import { useEffect, useRef, useState, useCallback } from 'react';
import Konva from 'konva';
import { TemplateLayouts } from '../components/templates/TemplateLayouts';
import { CanvasSize } from '../types';

export const useCanvas = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const [currentOrientation, setCurrentOrientation] = useState<string>('vertical');
  const [currentTemplate, setCurrentTemplate] = useState<string>('classic');
  const [titleText, setTitleText] = useState<string>('Your Amazing Product');
  const [subtitleText, setSubtitleText] = useState<string>('Get started today with our incredible solution');
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 400, height: 500 });
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);

  // Initialize Konva stage and layer
  useEffect(() => {
    if (!containerRef.current) return;

    // Create stage
    const stage = new Konva.Stage({
      container: containerRef.current,
      width: canvasSize.width,
      height: canvasSize.height,
    });

    // Create layer
    const layer = new Konva.Layer();
    stage.add(layer);

    stageRef.current = stage;
    layerRef.current = layer;

    // Load initial template
    loadTemplate();

    return () => {
      stage.destroy();
    };
  }, []);

  // Load template with current settings
  const loadTemplate = useCallback(() => {
    if (!layerRef.current) return;

    TemplateLayouts.createTemplate(currentTemplate, layerRef.current, canvasSize.width, canvasSize.height, {
      titleText,
      subtitleText
    });

    // Handle image upload if available
    if (uploadedImage) {
      updateMainImage();
    }

    layerRef.current.draw();
  }, [currentTemplate, canvasSize, titleText, subtitleText, uploadedImage]);

  // Update main image when uploaded
  const updateMainImage = useCallback(() => {
    if (!layerRef.current || !uploadedImage) return;

    const imageRect = layerRef.current.findOne('#main-image') as Konva.Rect;
    if (!imageRect) return;

    // Create Konva image
    const konvaImage = new Konva.Image({
      id: 'uploaded-image',
      x: imageRect.x(),
      y: imageRect.y(),
      width: imageRect.width(),
      height: imageRect.height(),
      image: uploadedImage,
    });

    // Remove the placeholder rect and add the image
    imageRect.destroy();
    layerRef.current.add(konvaImage);
    layerRef.current.draw();
  }, [uploadedImage]);

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
    
    // Update stage size
    if (stageRef.current) {
      stageRef.current.width(newSize.width);
      stageRef.current.height(newSize.height);
    }
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

  // Reload template when dependencies change
  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  return {
    containerRef,
    stageRef,
    layerRef,
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
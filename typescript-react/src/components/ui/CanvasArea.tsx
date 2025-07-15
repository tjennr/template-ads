import React, { useMemo } from 'react';
import { Stage, Layer, Rect, Text, Image } from 'react-konva';
import { useCanvas } from '../../hooks/useCanvas';
import { TemplateLayouts } from '../templates/TemplateLayouts';

interface ImageElementProps {
  src: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageElement: React.FC<ImageElementProps> = ({ src, x, y, width, height }) => {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (!src) return;
    
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = src;
  }, [src]);
  
  if (!image) {
    return <Rect x={x} y={y} width={width} height={height} fill="#f0f0f0" stroke="#ddd" strokeWidth={1} />;
  }
  
  return <Image x={x} y={y} width={width} height={height} image={image} />;
};

const CanvasArea: React.FC = () => {
  const { 
    currentTemplate, 
    titleText, 
    subtitleText, 
    canvasSize, 
    uploadedImage 
  } = useCanvas();

  const templateElements = useMemo(() => {
    return TemplateLayouts.createTemplate(currentTemplate, canvasSize.width, canvasSize.height, {
      titleText,
      subtitleText
    });
  }, [currentTemplate, canvasSize, titleText, subtitleText]);

  const renderElement = (element: any, index: number) => {
    const key = `${element.id}-${index}`;
    
    switch (element.type) {
      case 'rect':
        // If this is the main image placeholder and we have an uploaded image, render the image
        if (element.id === 'main-image' && uploadedImage) {
          return (
            <ImageElement
              key={key}
              src={uploadedImage}
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
            />
          );
        }
        return (
          <Rect
            key={key}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke="#ddd"
            strokeWidth={1}
          />
        );
      case 'text':
        return (
          <Text
            key={key}
            x={element.x}
            y={element.y}
            width={element.width}
            text={element.text}
            fontSize={element.fontSize}
            fontFamily={element.fontFamily}
            fill={element.fill}
            align={element.align}
            verticalAlign="middle"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="canvas-area">
      <div 
        className="canvas-container"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          <Stage width={canvasSize.width} height={canvasSize.height}>
            <Layer>
              {templateElements.map((element, index) => renderElement(element, index))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;
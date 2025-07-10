import React from 'react';
import { Template, Orientation } from '../types';
import { useCanvas } from '../hooks/useCanvas';
import Header from './ui/Header';
import Sidebar from './ui/Sidebar';
import CanvasArea from './ui/CanvasArea';

const TemplateAds: React.FC = () => {
  const {
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
  } = useCanvas();

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

  return (
    <div className="bg-yellow-50 font-sf-pro h-screen overflow-hidden">
      <Header />
      
      {/* Main Content */}
      <div className="h-[calc(100vh-70px)] mt-[70px]">
        <div className="flex h-full">
          <Sidebar
            orientations={orientations}
            templates={templates}
            currentOrientation={currentOrientation}
            currentTemplate={currentTemplate}
            titleText={titleText}
            subtitleText={subtitleText}
            onOrientationChange={handleOrientationChange}
            onTemplateChange={handleTemplateChange}
            onTextUpdate={handleTextUpdate}
            onImageUpload={handleImageUpload}
          />
          
          <CanvasArea 
            canvasRef={canvasRef}
            canvasSize={canvasSize}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateAds;
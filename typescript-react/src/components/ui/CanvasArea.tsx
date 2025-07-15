import React from 'react';
import { useCanvas } from '../../hooks/useCanvas';

const CanvasArea: React.FC = () => {
  const { containerRef, canvasSize } = useCanvas();

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
          ref={containerRef}
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        />
      </div>
    </div>
  );
};

export default CanvasArea;
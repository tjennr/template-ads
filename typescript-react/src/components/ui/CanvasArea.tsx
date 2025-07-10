import React from 'react';

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasSize: { width: number; height: number };
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ canvasRef, canvasSize }) => {
  return (
    <div className="flex-1 bg-gray-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border border-gray-200"
        />
      </div>
    </div>
  );
};

export default CanvasArea;
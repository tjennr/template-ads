import React from 'react';
import { Orientation, Template } from '../../types';

interface SidebarProps {
  orientations: Orientation[];
  templates: Template[];
  currentOrientation: string;
  currentTemplate: string;
  titleText: string;
  subtitleText: string;
  onOrientationChange: (orientation: string) => void;
  onTemplateChange: (template: string) => void;
  onTextUpdate: (type: string, value: string) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  orientations,
  templates,
  currentOrientation,
  currentTemplate,
  titleText,
  subtitleText,
  onOrientationChange,
  onTemplateChange,
  onTextUpdate,
  onImageUpload
}) => {
  return (
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
              onChange={(e) => onOrientationChange(e.target.value)}
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
              onChange={(e) => onTemplateChange(e.target.value)}
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
          
          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-medium mb-2">Main Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 font-sf-pro text-sm font-normal transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/10"
            />
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={titleText}
              onChange={(e) => onTextUpdate('title', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 font-sf-pro text-sm font-normal transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/10"
              placeholder="Enter title text"
            />
          </div>

          {/* Subtitle */}
          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-medium mb-2">Subtitle</label>
            <textarea
              value={subtitleText}
              onChange={(e) => onTextUpdate('subtitle', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 font-sf-pro text-sm font-normal transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/10 resize-none"
              placeholder="Enter subtitle text"
              rows={3}
            />
          </div>
        </div>

        {/* Export Section */}
        <div className="mb-5">
          <h5 className="text-text-primary text-sm font-semibold mb-4">Export</h5>
          <button
            className="w-full bg-brand-blue text-white rounded-md px-4 py-2 font-sf-pro text-sm font-medium transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            onClick={() => {
              // Export functionality to be implemented
              console.log('Export functionality to be implemented');
            }}
          >
            Export as PNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
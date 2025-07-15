import Konva from 'konva';

export interface TemplateConfig {
  titleText: string;
  subtitleText: string;
}

export interface KonvaElement {
  type: 'text' | 'image' | 'rect';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  backgroundColor?: string;
  imageUrl?: string;
  align?: 'left' | 'center' | 'right';
}

export class TemplateLayouts {
  
  static createClassicTemplate(layer: Konva.Layer, width: number, height: number, config: TemplateConfig): Konva.Node[] {
    // Background image placeholder
    const imageRect = new Konva.Rect({
      id: 'main-image',
      x: width * 0.1,
      y: height * 0.1,
      width: width * 0.8,
      height: height * 0.4,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1
    });

    // Title text
    const titleText = new Konva.Text({
      id: 'title',
      x: width * 0.1,
      y: height * 0.7,
      width: width * 0.8,
      text: config.titleText,
      fontSize: 24,
      fontFamily: 'SF Pro Text, sans-serif',
      fill: '#212529',
      align: 'center'
    });

    // Subtitle text
    const subtitleText = new Konva.Text({
      id: 'subtitle',
      x: width * 0.1,
      y: height * 0.85,
      width: width * 0.8,
      text: config.subtitleText,
      fontSize: 16,
      fontFamily: 'SF Pro Text, sans-serif',
      fill: '#495057',
      align: 'center'
    });

    const elements = [imageRect, titleText, subtitleText];
    elements.forEach(el => layer.add(el));
    
    return elements;
  }

  static createSplitLeftTemplate(layer: Konva.Layer, width: number, height: number, config: TemplateConfig): Konva.Node[] {
    // Left side image
    const imageRect = new Konva.Rect({
      id: 'main-image',
      x: 0,
      y: 0,
      width: width * 0.5,
      height: height,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1
    });

    // Right side title
    const titleText = new Konva.Text({
      id: 'title',
      x: width * 0.55,
      y: height * 0.4,
      width: width * 0.4,
      text: config.titleText,
      fontSize: 20,
      fontFamily: 'SF Pro Text, sans-serif',
      fill: '#212529',
      align: 'center'
    });

    // Right side subtitle
    const subtitleText = new Konva.Text({
      id: 'subtitle',
      x: width * 0.55,
      y: height * 0.6,
      width: width * 0.4,
      text: config.subtitleText,
      fontSize: 14,
      fontFamily: 'SF Pro Text, sans-serif',
      fill: '#495057',
      align: 'center'
    });

    const elements = [imageRect, titleText, subtitleText];
    elements.forEach(el => layer.add(el));
    
    return elements;
  }

  static createSplitRightTemplate(layer: Konva.Layer, width: number, height: number, config: TemplateConfig): Konva.Node[] {
    // Left side title
    const titleText = new Konva.Text({
      id: 'title',
      x: width * 0.05,
      y: height * 0.4,
      width: width * 0.4,
      text: config.titleText,
      fontSize: 20,
      fontFamily: 'SF Pro Text, sans-serif',
      fill: '#212529',
      align: 'center'
    });

    // Left side subtitle
    const subtitleText = new Konva.Text({
      id: 'subtitle',
      x: width * 0.05,
      y: height * 0.6,
      width: width * 0.4,
      text: config.subtitleText,
      fontSize: 14,
      fontFamily: 'SF Pro Text, sans-serif',
      fill: '#495057',
      align: 'center'
    });

    // Right side image
    const imageRect = new Konva.Rect({
      id: 'main-image',
      x: width * 0.5,
      y: 0,
      width: width * 0.5,
      height: height,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1
    });

    const elements = [titleText, subtitleText, imageRect];
    elements.forEach(el => layer.add(el));
    
    return elements;
  }

  static createSplitTopTemplate(layer: Konva.Layer, width: number, height: number, config: TemplateConfig): Konva.Node[] {
    // Top image
    const imageRect = new Konva.Rect({
      id: 'main-image',
      x: 0,
      y: 0,
      width: width,
      height: height * 0.6,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1
    });

    // Bottom title
    const titleText = new Konva.Text({
      id: 'title',
      x: width * 0.1,
      y: height * 0.75,
      width: width * 0.8,
      text: config.titleText,
      fontSize: 20,
      fontFamily: 'SF Pro Text, sans-serif',
      fill: '#212529',
      align: 'center'
    });

    // Bottom subtitle
    const subtitleText = new Konva.Text({
      id: 'subtitle',
      x: width * 0.1,
      y: height * 0.9,
      width: width * 0.8,
      text: config.subtitleText,
      fontSize: 14,
      fontFamily: 'SF Pro Text, sans-serif',
      fill: '#495057',
      align: 'center'
    });

    const elements = [imageRect, titleText, subtitleText];
    elements.forEach(el => layer.add(el));
    
    return elements;
  }

  static createGridTemplate(layer: Konva.Layer, width: number, height: number, config: TemplateConfig): Konva.Node[] {
    // Top-left image
    const imageRect = new Konva.Rect({
      id: 'main-image',
      x: width * 0.05,
      y: height * 0.05,
      width: width * 0.4,
      height: height * 0.4,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1
    });

    // Top-right title
    const titleText = new Konva.Text({
      id: 'title',
      x: width * 0.55,
      y: height * 0.25,
      width: width * 0.4,
      text: config.titleText,
      fontSize: 18,
      fontFamily: 'SF Pro Text, sans-serif',
      fill: '#212529',
      align: 'center'
    });

    // Bottom subtitle
    const subtitleText = new Konva.Text({
      id: 'subtitle',
      x: width * 0.05,
      y: height * 0.7,
      width: width * 0.9,
      text: config.subtitleText,
      fontSize: 14,
      fontFamily: 'SF Pro Text, sans-serif',
      fill: '#495057',
      align: 'center'
    });

    const elements = [imageRect, titleText, subtitleText];
    elements.forEach(el => layer.add(el));
    
    return elements;
  }

  static createTemplate(templateId: string, layer: Konva.Layer, width: number, height: number, config: TemplateConfig): Konva.Node[] {
    // Clear existing elements
    layer.destroyChildren();
    
    switch (templateId) {
      case 'classic':
        return this.createClassicTemplate(layer, width, height, config);
      case 'splitLeft':
        return this.createSplitLeftTemplate(layer, width, height, config);
      case 'splitRight':
        return this.createSplitRightTemplate(layer, width, height, config);
      case 'splitTop':
        return this.createSplitTopTemplate(layer, width, height, config);
      case 'grid':
        return this.createGridTemplate(layer, width, height, config);
      default:
        return this.createClassicTemplate(layer, width, height, config);
    }
  }
}
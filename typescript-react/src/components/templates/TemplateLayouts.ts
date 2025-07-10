export interface TemplateConfig {
  titleText: string;
  subtitleText: string;
}

export interface CanvasElement {
  type: 'text' | 'image' | 'rect';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  imageUrl?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export class TemplateLayouts {
  
  static createClassicTemplate(width: number, height: number, config: TemplateConfig): CanvasElement[] {
    return [
      // Background image placeholder
      {
        type: 'rect',
        id: 'main-image',
        x: width * 0.1,
        y: height * 0.1,
        width: width * 0.8,
        height: height * 0.4,
        backgroundColor: '#f0f0f0'
      },
      // Title text
      {
        type: 'text',
        id: 'title',
        x: width / 2,
        y: height * 0.7,
        width: width * 0.8,
        height: 40,
        text: config.titleText,
        fontSize: 24,
        fontFamily: 'SF Pro Text, sans-serif',
        color: '#212529',
        textAlign: 'center'
      },
      // Subtitle text
      {
        type: 'text',
        id: 'subtitle',
        x: width / 2,
        y: height * 0.85,
        width: width * 0.8,
        height: 30,
        text: config.subtitleText,
        fontSize: 16,
        fontFamily: 'SF Pro Text, sans-serif',
        color: '#495057',
        textAlign: 'center'
      }
    ];
  }

  static createSplitLeftTemplate(width: number, height: number, config: TemplateConfig): CanvasElement[] {
    return [
      // Left side image
      {
        type: 'rect',
        id: 'main-image',
        x: 0,
        y: 0,
        width: width * 0.5,
        height: height,
        backgroundColor: '#f0f0f0'
      },
      // Right side title
      {
        type: 'text',
        id: 'title',
        x: width * 0.75,
        y: height * 0.4,
        width: width * 0.4,
        height: 40,
        text: config.titleText,
        fontSize: 20,
        fontFamily: 'SF Pro Text, sans-serif',
        color: '#212529',
        textAlign: 'center'
      },
      // Right side subtitle
      {
        type: 'text',
        id: 'subtitle',
        x: width * 0.75,
        y: height * 0.6,
        width: width * 0.4,
        height: 30,
        text: config.subtitleText,
        fontSize: 14,
        fontFamily: 'SF Pro Text, sans-serif',
        color: '#495057',
        textAlign: 'center'
      }
    ];
  }

  static createSplitRightTemplate(width: number, height: number, config: TemplateConfig): CanvasElement[] {
    return [
      // Left side title
      {
        type: 'text',
        id: 'title',
        x: width * 0.25,
        y: height * 0.4,
        width: width * 0.4,
        height: 40,
        text: config.titleText,
        fontSize: 20,
        fontFamily: 'SF Pro Text, sans-serif',
        color: '#212529',
        textAlign: 'center'
      },
      // Left side subtitle
      {
        type: 'text',
        id: 'subtitle',
        x: width * 0.25,
        y: height * 0.6,
        width: width * 0.4,
        height: 30,
        text: config.subtitleText,
        fontSize: 14,
        fontFamily: 'SF Pro Text, sans-serif',
        color: '#495057',
        textAlign: 'center'
      },
      // Right side image
      {
        type: 'rect',
        id: 'main-image',
        x: width * 0.5,
        y: 0,
        width: width * 0.5,
        height: height,
        backgroundColor: '#f0f0f0'
      }
    ];
  }

  static createSplitTopTemplate(width: number, height: number, config: TemplateConfig): CanvasElement[] {
    return [
      // Top image
      {
        type: 'rect',
        id: 'main-image',
        x: 0,
        y: 0,
        width: width,
        height: height * 0.6,
        backgroundColor: '#f0f0f0'
      },
      // Bottom title
      {
        type: 'text',
        id: 'title',
        x: width / 2,
        y: height * 0.75,
        width: width * 0.8,
        height: 40,
        text: config.titleText,
        fontSize: 20,
        fontFamily: 'SF Pro Text, sans-serif',
        color: '#212529',
        textAlign: 'center'
      },
      // Bottom subtitle
      {
        type: 'text',
        id: 'subtitle',
        x: width / 2,
        y: height * 0.9,
        width: width * 0.8,
        height: 30,
        text: config.subtitleText,
        fontSize: 14,
        fontFamily: 'SF Pro Text, sans-serif',
        color: '#495057',
        textAlign: 'center'
      }
    ];
  }

  static createGridTemplate(width: number, height: number, config: TemplateConfig): CanvasElement[] {
    return [
      // Top-left image
      {
        type: 'rect',
        id: 'main-image',
        x: width * 0.05,
        y: height * 0.05,
        width: width * 0.4,
        height: height * 0.4,
        backgroundColor: '#f0f0f0'
      },
      // Top-right title
      {
        type: 'text',
        id: 'title',
        x: width * 0.75,
        y: height * 0.25,
        width: width * 0.4,
        height: 40,
        text: config.titleText,
        fontSize: 18,
        fontFamily: 'SF Pro Text, sans-serif',
        color: '#212529',
        textAlign: 'center'
      },
      // Bottom subtitle
      {
        type: 'text',
        id: 'subtitle',
        x: width / 2,
        y: height * 0.7,
        width: width * 0.9,
        height: 30,
        text: config.subtitleText,
        fontSize: 14,
        fontFamily: 'SF Pro Text, sans-serif',
        color: '#495057',
        textAlign: 'center'
      }
    ];
  }

  static createTemplate(templateId: string, width: number, height: number, config: TemplateConfig): CanvasElement[] {
    switch (templateId) {
      case 'classic':
        return this.createClassicTemplate(width, height, config);
      case 'splitLeft':
        return this.createSplitLeftTemplate(width, height, config);
      case 'splitRight':
        return this.createSplitRightTemplate(width, height, config);
      case 'splitTop':
        return this.createSplitTopTemplate(width, height, config);
      case 'grid':
        return this.createGridTemplate(width, height, config);
      default:
        return this.createClassicTemplate(width, height, config);
    }
  }
}
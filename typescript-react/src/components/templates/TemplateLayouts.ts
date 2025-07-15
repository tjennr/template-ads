export interface TemplateConfig {
  titleText: string;
  subtitleText: string;
}

export interface TemplateElement {
  type: 'text' | 'image' | 'rect';
  id: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  align?: 'left' | 'center' | 'right';
}

export class TemplateLayouts {
  
  static createClassicTemplate(width: number, height: number, config: TemplateConfig): TemplateElement[] {
    return [
      // Background image placeholder
      {
        type: 'rect',
        id: 'main-image',
        x: width * 0.1,
        y: height * 0.1,
        width: width * 0.8,
        height: height * 0.4,
        fill: '#f0f0f0'
      },
      // Title text
      {
        type: 'text',
        id: 'title',
        x: width * 0.1,
        y: height * 0.7,
        width: width * 0.8,
        text: config.titleText,
        fontSize: 24,
        fontFamily: 'SF Pro Text, sans-serif',
        fill: '#212529',
        align: 'center'
      },
      // Subtitle text
      {
        type: 'text',
        id: 'subtitle',
        x: width * 0.1,
        y: height * 0.85,
        width: width * 0.8,
        text: config.subtitleText,
        fontSize: 16,
        fontFamily: 'SF Pro Text, sans-serif',
        fill: '#495057',
        align: 'center'
      }
    ];
  }

  static createSplitLeftTemplate(width: number, height: number, config: TemplateConfig): TemplateElement[] {
    return [
      // Left side image
      {
        type: 'rect',
        id: 'main-image',
        x: 0,
        y: 0,
        width: width * 0.5,
        height: height,
        fill: '#f0f0f0'
      },
      // Right side title
      {
        type: 'text',
        id: 'title',
        x: width * 0.55,
        y: height * 0.4,
        width: width * 0.4,
        text: config.titleText,
        fontSize: 20,
        fontFamily: 'SF Pro Text, sans-serif',
        fill: '#212529',
        align: 'center'
      },
      // Right side subtitle
      {
        type: 'text',
        id: 'subtitle',
        x: width * 0.55,
        y: height * 0.6,
        width: width * 0.4,
        text: config.subtitleText,
        fontSize: 14,
        fontFamily: 'SF Pro Text, sans-serif',
        fill: '#495057',
        align: 'center'
      }
    ];
  }

  static createSplitRightTemplate(width: number, height: number, config: TemplateConfig): TemplateElement[] {
    return [
      // Left side title
      {
        type: 'text',
        id: 'title',
        x: width * 0.05,
        y: height * 0.4,
        width: width * 0.4,
        text: config.titleText,
        fontSize: 20,
        fontFamily: 'SF Pro Text, sans-serif',
        fill: '#212529',
        align: 'center'
      },
      // Left side subtitle
      {
        type: 'text',
        id: 'subtitle',
        x: width * 0.05,
        y: height * 0.6,
        width: width * 0.4,
        text: config.subtitleText,
        fontSize: 14,
        fontFamily: 'SF Pro Text, sans-serif',
        fill: '#495057',
        align: 'center'
      },
      // Right side image
      {
        type: 'rect',
        id: 'main-image',
        x: width * 0.5,
        y: 0,
        width: width * 0.5,
        height: height,
        fill: '#f0f0f0'
      }
    ];
  }

  static createSplitTopTemplate(width: number, height: number, config: TemplateConfig): TemplateElement[] {
    return [
      // Top image
      {
        type: 'rect',
        id: 'main-image',
        x: 0,
        y: 0,
        width: width,
        height: height * 0.6,
        fill: '#f0f0f0'
      },
      // Bottom title
      {
        type: 'text',
        id: 'title',
        x: width * 0.1,
        y: height * 0.75,
        width: width * 0.8,
        text: config.titleText,
        fontSize: 20,
        fontFamily: 'SF Pro Text, sans-serif',
        fill: '#212529',
        align: 'center'
      },
      // Bottom subtitle
      {
        type: 'text',
        id: 'subtitle',
        x: width * 0.1,
        y: height * 0.9,
        width: width * 0.8,
        text: config.subtitleText,
        fontSize: 14,
        fontFamily: 'SF Pro Text, sans-serif',
        fill: '#495057',
        align: 'center'
      }
    ];
  }

  static createGridTemplate(width: number, height: number, config: TemplateConfig): TemplateElement[] {
    return [
      // Top-left image
      {
        type: 'rect',
        id: 'main-image',
        x: width * 0.05,
        y: height * 0.05,
        width: width * 0.4,
        height: height * 0.4,
        fill: '#f0f0f0'
      },
      // Top-right title
      {
        type: 'text',
        id: 'title',
        x: width * 0.55,
        y: height * 0.25,
        width: width * 0.4,
        text: config.titleText,
        fontSize: 18,
        fontFamily: 'SF Pro Text, sans-serif',
        fill: '#212529',
        align: 'center'
      },
      // Bottom subtitle
      {
        type: 'text',
        id: 'subtitle',
        x: width * 0.05,
        y: height * 0.7,
        width: width * 0.9,
        text: config.subtitleText,
        fontSize: 14,
        fontFamily: 'SF Pro Text, sans-serif',
        fill: '#495057',
        align: 'center'
      }
    ];
  }

  static createTemplate(templateId: string, width: number, height: number, config: TemplateConfig): TemplateElement[] {
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
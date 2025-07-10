import { Canvas, Rect, Textbox } from 'fabric';

export interface TemplateConfig {
  titleText: string;
  subtitleText: string;
}

export class TemplateLayouts {
  
  static loadClassicTemplate(canvas: Canvas, width: number, height: number, config: TemplateConfig) {
    // Add placeholder image
    const imageRect = new Rect({
      left: width / 2,
      top: height * 0.3,
      width: width * 0.8,
      height: height * 0.4,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 2,
      rx: 8,
      ry: 8,
      originX: 'center',
      originY: 'center'
    });
    (imageRect as any).imageType = 'main';
    canvas.add(imageRect);

    // Add image placeholder text
    const imagePlaceholder = new Textbox('Click to upload image', {
      left: width / 2,
      top: height * 0.3,
      fontSize: 14,
      fontFamily: 'SF Pro Text',
      fill: '#999',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      selectable: false
    });
    canvas.add(imagePlaceholder);

    // Add title text
    const titleTextObj = new Textbox(config.titleText, {
      left: width / 2,
      top: height * 0.7,
      width: width * 0.8,
      fontSize: 24,
      fontFamily: 'SF Pro Text',
      fill: '#212529',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (titleTextObj as any).textType = 'title';
    canvas.add(titleTextObj);

    // Add subtitle text
    const subtitleTextObj = new Textbox(config.subtitleText, {
      left: width / 2,
      top: height * 0.85,
      width: width * 0.8,
      fontSize: 16,
      fontFamily: 'SF Pro Text',
      fill: '#495057',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (subtitleTextObj as any).textType = 'subtitle';
    canvas.add(subtitleTextObj);
  }

  static loadSplitLeftTemplate(canvas: Canvas, width: number, height: number, config: TemplateConfig) {
    // Left side image
    const imageRect = new Rect({
      left: 0,
      top: 0,
      width: width * 0.5,
      height: height,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top'
    });
    (imageRect as any).imageType = 'main';
    canvas.add(imageRect);

    // Right side content
    const titleTextObj = new Textbox(config.titleText, {
      left: width * 0.75,
      top: height * 0.4,
      width: width * 0.4,
      fontSize: 20,
      fontFamily: 'SF Pro Text',
      fill: '#212529',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (titleTextObj as any).textType = 'title';
    canvas.add(titleTextObj);

    const subtitleTextObj = new Textbox(config.subtitleText, {
      left: width * 0.75,
      top: height * 0.6,
      width: width * 0.4,
      fontSize: 14,
      fontFamily: 'SF Pro Text',
      fill: '#495057',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (subtitleTextObj as any).textType = 'subtitle';
    canvas.add(subtitleTextObj);
  }

  static loadSplitRightTemplate(canvas: Canvas, width: number, height: number, config: TemplateConfig) {
    // Left side content
    const titleTextObj = new Textbox(config.titleText, {
      left: width * 0.25,
      top: height * 0.4,
      width: width * 0.4,
      fontSize: 20,
      fontFamily: 'SF Pro Text',
      fill: '#212529',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (titleTextObj as any).textType = 'title';
    canvas.add(titleTextObj);

    const subtitleTextObj = new Textbox(config.subtitleText, {
      left: width * 0.25,
      top: height * 0.6,
      width: width * 0.4,
      fontSize: 14,
      fontFamily: 'SF Pro Text',
      fill: '#495057',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (subtitleTextObj as any).textType = 'subtitle';
    canvas.add(subtitleTextObj);

    // Right side image
    const imageRect = new Rect({
      left: width * 0.5,
      top: 0,
      width: width * 0.5,
      height: height,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top'
    });
    (imageRect as any).imageType = 'main';
    canvas.add(imageRect);
  }

  static loadSplitTopTemplate(canvas: Canvas, width: number, height: number, config: TemplateConfig) {
    // Top image
    const imageRect = new Rect({
      left: 0,
      top: 0,
      width: width,
      height: height * 0.6,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top'
    });
    (imageRect as any).imageType = 'main';
    canvas.add(imageRect);

    // Bottom content
    const titleTextObj = new Textbox(config.titleText, {
      left: width / 2,
      top: height * 0.75,
      width: width * 0.8,
      fontSize: 20,
      fontFamily: 'SF Pro Text',
      fill: '#212529',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (titleTextObj as any).textType = 'title';
    canvas.add(titleTextObj);

    const subtitleTextObj = new Textbox(config.subtitleText, {
      left: width / 2,
      top: height * 0.9,
      width: width * 0.8,
      fontSize: 14,
      fontFamily: 'SF Pro Text',
      fill: '#495057',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (subtitleTextObj as any).textType = 'subtitle';
    canvas.add(subtitleTextObj);
  }

  static loadGridTemplate(canvas: Canvas, width: number, height: number, config: TemplateConfig) {
    // 2x2 grid layout
    const imageRect = new Rect({
      left: width * 0.05,
      top: height * 0.05,
      width: width * 0.4,
      height: height * 0.4,
      fill: '#f0f0f0',
      stroke: '#ddd',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top'
    });
    (imageRect as any).imageType = 'main';
    canvas.add(imageRect);

    const titleTextObj = new Textbox(config.titleText, {
      left: width * 0.75,
      top: height * 0.25,
      width: width * 0.4,
      fontSize: 18,
      fontFamily: 'SF Pro Text',
      fill: '#212529',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (titleTextObj as any).textType = 'title';
    canvas.add(titleTextObj);

    const subtitleTextObj = new Textbox(config.subtitleText, {
      left: width / 2,
      top: height * 0.7,
      width: width * 0.9,
      fontSize: 14,
      fontFamily: 'SF Pro Text',
      fill: '#495057',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });
    (subtitleTextObj as any).textType = 'subtitle';
    canvas.add(subtitleTextObj);
  }

  static loadTemplate(canvas: Canvas, templateId: string, width: number, height: number, config: TemplateConfig) {
    // Clear existing objects except background
    const objects = canvas.getObjects();
    objects.forEach((obj: any) => {
      if (obj.selectable !== false) {
        canvas.remove(obj);
      }
    });

    // Set background color
    canvas.backgroundColor = '#ffffff';

    switch (templateId) {
      case 'classic':
        this.loadClassicTemplate(canvas, width, height, config);
        break;
      case 'splitLeft':
        this.loadSplitLeftTemplate(canvas, width, height, config);
        break;
      case 'splitRight':
        this.loadSplitRightTemplate(canvas, width, height, config);
        break;
      case 'splitTop':
        this.loadSplitTopTemplate(canvas, width, height, config);
        break;
      case 'grid':
        this.loadGridTemplate(canvas, width, height, config);
        break;
      default:
        this.loadClassicTemplate(canvas, width, height, config);
    }

    canvas.renderAll();
  }
}
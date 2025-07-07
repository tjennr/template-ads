export interface CanvasSize {
  width: number;
  height: number;
}

export interface Template {
  id: string;
  name: string;
  displayName: string;
}

export interface Orientation {
  id: string;
  name: string;
  displayName: string;
  aspectRatio: number;
}

export interface TextObject {
  id: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: string;
  textAlign: string;
}

export interface ImageUploadResult {
  url: string;
  type: 'main' | 'logo';
}
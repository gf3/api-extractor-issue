/**
 * @module Camera
 */

export enum ActionType {
  OPEN = 'APP::CAMERA::OPEN',
  CAPTURE = 'APP::CAMERA::CAPTURE',
}

export enum Action {
  OPEN = 'OPEN',
  CAPTURE = 'CAPTURE',
}

export interface Data {
  imageData?: string;
  scanData?: string;
}

export interface Payload {
  readonly data: Data;
}

export interface Options {
  readonly id?: string;
}

export enum OpenType {
  Image = 'Image',
  Scan = 'Scan',
}

export interface OpenData {
  type: OpenType;
}

export interface OpenPayload {
  readonly data: OpenData;
}

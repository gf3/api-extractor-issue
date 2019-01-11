/**
 * @module Button
 */

export enum Action {
  CLICK = 'CLICK',
  UPDATE = 'UPDATE',
}

export enum ActionType {
  CLICK = 'APP::BUTTON::CLICK',
  UPDATE = 'APP::BUTTON::UPDATE',
}

export enum Icon {
  Print = 'print',
}

export enum Style {
  Danger = 'danger',
}

export interface Presentation {
  icon?: Icon;
  style?: Style;
}

export interface Options extends Presentation {
  label: string;
  disabled?: boolean;
}

export interface Payload extends Options {
  readonly id: string;
}

export interface ClickPayload {
  readonly id: string;
  payload?: any;
}

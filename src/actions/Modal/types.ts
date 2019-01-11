/**
 * @module Modal
 */

import {Button, Payload as ButtonPayload} from '../Button';

export enum Action {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
  UPDATE = 'UPDATE',
}

export enum ActionType {
  OPEN = 'APP::MODAL::OPEN',
  CLOSE = 'APP::MODAL::CLOSE',
  UPDATE = 'APP::MODAL::UPDATE',
  FOOTER_BUTTON_CLICK = 'APP::MODAL::FOOTER::BUTTON::CLICK',
  FOOTER_BUTTON_UPDATE = 'APP::MODAL::FOOTER::BUTTON::UPDATE',
}

export enum Size {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Full = 'full',
}

export interface BasePayload {
  readonly id?: string;
  size?: Size;
  title?: string;
  footer?: Footer;
}

export interface MessagePayload extends BasePayload {
  message: string;
}

export interface IframePayload extends BasePayload {
  url?: string;
  path?: string;
}

export interface ClosePayload {
  readonly id?: string;
}

export interface FooterOptions {
  buttons: {
    primary?: Button;
    secondary?: Button[];
  };
}

export interface Footer {
  buttons: {
    primary?: ButtonPayload;
    secondary?: ButtonPayload[];
  };
}

export interface MessageOptions extends MessagePayload {
  footer?: FooterOptions;
}

export interface IframeOptions extends IframePayload {
  footer?: FooterOptions;
}

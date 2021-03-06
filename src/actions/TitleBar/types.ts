/**
 * @module TitleBar
 */
import {Button, Payload as ButtonPayload} from '../Button';
import {ButtonGroup, Payload as ButtonGroupPayload} from '../ButtonGroup';

export enum Action {
  UPDATE = 'UPDATE',
}

export enum ActionType {
  UPDATE = 'APP::TITLEBAR::UPDATE',
  BUTTON_CLICK = 'APP::TITLEBAR::BUTTONS::BUTTON::CLICK',
  BUTTON_UPDATE = 'APP::TITLEBAR::BUTTONS::BUTTON::UPDATE',
  BUTTON_GROUP_UPDATE = 'APP::TITLEBAR::BUTTONS::BUTTONGROUP::UPDATE',
  BREADCRUMBS_CLICK = 'APP::TITLEBAR::BREADCRUMBS::BUTTON::CLICK',
  BREADCRUMBS_UPDATE = 'APP::TITLEBAR::BREADCRUMBS::BUTTON::UPDATE',
}

export interface Breadcrumb {
  content: string;
  url: string;
}

export interface ButtonsOptions {
  primary?: Button;
  secondary?: (ButtonGroup | Button)[];
}

export interface Options {
  title?: string;
  buttons?: ButtonsOptions;
  breadcrumbs?: Button;
}

export interface ButtonsPayload {
  primary?: ButtonPayload;
  secondary?: (ButtonPayload | ButtonGroupPayload)[];
}

export interface Payload {
  readonly id?: string;
  title?: string;
  buttons?: ButtonsPayload;
  breadcrumbs?: ButtonPayload;
}

/**
 * @module ButtonGroup
 */

import {Button, Payload as ButtonPayload} from '../Button';

export enum Action {
  UPDATE = 'UPDATE',
}

export enum ActionType {
  UPDATE = 'APP::BUTTONGROUP::UPDATE',
}

export interface Options {
  label: string;
  disabled?: boolean;
  buttons: Button[];
}

export interface Payload {
  readonly id: string;
  label: string;
  disabled?: boolean;
  buttons: ButtonPayload[];
}

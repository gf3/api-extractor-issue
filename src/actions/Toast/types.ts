/**
 * @module Toast
 */

export enum ActionType {
  SHOW = 'APP::TOAST::SHOW',
  CLEAR = 'APP::TOAST::CLEAR',
}

export enum Action {
  SHOW = 'SHOW',
  CLEAR = 'CLEAR',
}

export interface Options {
  duration: number;
  isDismissible?: boolean;
  isError?: boolean;
  message: string;
}

export interface ClearPayload {
  readonly id?: string;
}

export interface Payload extends Options {
  readonly id?: string;
}

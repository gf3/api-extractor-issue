/**
 * @module Loading
 */

export enum ActionType {
  START = 'APP::LOADING::START',
  STOP = 'APP::LOADING::STOP',
}

export enum Action {
  START = 'START',
  STOP = 'STOP',
}

export interface Payload {
  readonly id?: string;
}

/**
 * @module History
 */

export enum ActionType {
  PUSH = 'APP::NAVIGATION::HISTORY::PUSH',
  REPLACE = 'APP::NAVIGATION::HISTORY::REPLACE',
}

export enum Action {
  PUSH = 'PUSH',
  REPLACE = 'REPLACE',
}

export interface Payload {
  id?: string;
  path: string;
}

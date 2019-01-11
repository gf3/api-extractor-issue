import {AnyAction, MetaAction} from '../types';

export enum Action {
  INVALID_ACTION = 'INVALID_ACTION',
  INVALID_ACTION_TYPE = 'INVALID_ACTION_TYPE',
  INVALID_OPTIONS = 'INVALID_OPTIONS',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  UNEXPECTED_ACTION = 'UNEXPECTED_ACTION',
  PERSISTENCE = 'PERSISTENCE',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
}

export enum ActionType {
  INVALID_ACTION = 'APP::ERROR::INVALID_ACTION',
  INVALID_ACTION_TYPE = 'APP::ERROR::INVALID_ACTION_TYPE',
  INVALID_PAYLOAD = 'APP::ERROR::INVALID_PAYLOAD',
  INVALID_OPTIONS = 'APP::ERROR::INVALID_OPTIONS',
  UNEXPECTED_ACTION = 'APP::ERROR::UNEXPECTED_ACTION',
  PERSISTENCE = 'APP::ERROR::PERSISTENCE',
  UNSUPPORTED_OPERATION = 'APP::ERROR::UNSUPPORTED_OPERATION',
  NETWORK = 'APP::ERROR::NETWORK',
  PERMISSION = 'APP::ERROR::PERMISSION',
}

export enum AppActionType {
  INVALID_CONFIG = 'APP::ERROR::INVALID_CONFIG',
  MISSING_CONFIG = 'APP::APP_ERROR::MISSING_CONFIG',
  MISSING_APP_BRIDGE_MIDDLEWARE = 'APP::APP_ERROR::MISSING_APP_BRIDGE_MIDDLEWARE',
  WINDOW_UNDEFINED = 'APP::APP_ERROR::WINDOW_UNDEFINED',
  MISSING_LOCAL_ORIGIN = 'APP::APP_ERROR::MISSING_LOCAL_ORIGIN',
}

export type Payload = MetaAction | AnyAction;
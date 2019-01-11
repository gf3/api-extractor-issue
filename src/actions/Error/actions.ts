import {actionWrapper, findMatchInEnum} from '../helper';
import {Group, MetaAction} from '../types';
import {Action, ActionType as Type, Payload} from './types';

function errorActionWrapperWithId<A extends MetaAction>(type: Type, action: A, message?: string) {
  const castPayload = (action as MetaAction).payload;

  return actionWrapper({
    type,
    group: Group.Error,
    payload: {
      action,
      message,
      type,
      id: castPayload && castPayload.id ? castPayload.id : undefined,
    },
  });
}

export enum Message {
  MISSING_PAYLOAD = 'Missing payload',
  INVALID_PAYLOAD_ID = 'Id in payload is missing or invalid',
}

export interface ErrorAction extends MetaAction {
  payload: {
    type: typeof Type;
    action: Payload;
  };
}

export function invalidPayload<A extends MetaAction>(action: A, message?: string): ErrorAction {
  return errorActionWrapperWithId(
    Type.INVALID_PAYLOAD,
    action,
    message || "The action's payload is missing required properties or has invalid properties",
  );
}

export function invalidActionType<A extends MetaAction>(action: A, message?: string): ErrorAction {
  return actionWrapper({
    group: Group.Error,
    payload: {
      action,
      message: message || 'The action type is invalid or unsupported',
      type: Type.INVALID_ACTION_TYPE,
    },
    type: Type.INVALID_ACTION_TYPE,
  });
}

export function invalidAction<A extends MetaAction>(action: A, message?: string): ErrorAction {
  return actionWrapper({
    group: Group.Error,
    payload: {
      action,
      message:
        message || "The action's has missing/invalid values for `group`, `type` or `version`",
      type: Type.INVALID_ACTION,
    },
    type: Type.INVALID_ACTION,
  });
}

export function unexpectedAction<A extends MetaAction>(action: A, message?: string): ErrorAction {
  return actionWrapper({
    group: Group.Error,
    payload: {
      action,
      message: message || 'Action cannot be called at this time',
      type: Type.UNEXPECTED_ACTION,
    },
    type: Type.UNEXPECTED_ACTION,
  });
}

export function unsupportedOperationAction<A extends MetaAction>(
  action: A,
  message?: string,
): ErrorAction {
  return errorActionWrapperWithId(
    Type.UNSUPPORTED_OPERATION,
    action,
    message || 'The action type is unsupported',
  );
}

export function persistenceAction<A extends MetaAction>(action: A, message?: string): ErrorAction {
  return errorActionWrapperWithId(
    Type.PERSISTENCE,
    action,
    message || 'Action cannot be persisted on server',
  );
}

export function networkAction<A extends MetaAction>(action: A, message?: string): ErrorAction {
  return errorActionWrapperWithId(Type.NETWORK, action, message || 'Network error');
}

export function permissionAction<A extends MetaAction>(action: A, message?: string): ErrorAction {
  return errorActionWrapperWithId(Type.PERMISSION, action, message || 'Action is not permitted');
}

export function isErrorEventName(eventName: string) {
  const match = findMatchInEnum(Action, eventName);

  return typeof match === 'string';
}

export class AppBridgeError {
  message: string;
  name: string;
  stack!: any;
  action?: Payload;
  type?: string;

  constructor(message: string) {
    this.name = 'AppBridgeError';
    this.message = message;

    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}

AppBridgeError.prototype = Object.create(Error.prototype);

export function fromAction(message: string, type: string, action?: Payload) {
  const errorMessage = message ? `${type}: ${message}` : type;
  const error = new AppBridgeError(errorMessage);

  error.action = action;
  error.type = type;

  return error;
}

export function throwError(type: Type | string, action: Payload, message?: string): void;
export function throwError(type: Type | string, message: string): void;
export function throwError() {
  const type = arguments[0];
  let message;
  let action;

  if (typeof arguments[1] === 'string') {
    message = arguments[1];
  } else {
    action = arguments[1];
    message = arguments[2] || '';
  }
  throw fromAction(message, type, action);
}

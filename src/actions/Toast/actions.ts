/**
 * @module Toast
 */

import {ClientApplication} from '../../client';
import {actionWrapper, getMergedProps, ActionSet} from '../helper';
import {ActionSetProps, Group, MetaAction} from '../types';
import {Action, ActionType, ClearPayload, Options, Payload} from './types';

export interface ActionBase extends MetaAction {
  readonly group: typeof Group.Toast;
}
export interface ShowAction extends ActionBase {
  readonly type: typeof ActionType.SHOW;
  readonly payload: Payload;
}
export interface ClearAction extends ActionBase {
  readonly type: typeof ActionType.CLEAR;
}

export type ToastAction = ShowAction | ClearAction | MetaAction;

export function show(toastMessage: Payload): ShowAction {
  return actionWrapper({
    group: Group.Toast,
    payload: toastMessage,
    type: ActionType.SHOW,
  });
}

export function clear(payload: ClearPayload): ClearAction {
  return actionWrapper({
    payload,
    group: Group.Toast,
    type: ActionType.CLEAR,
  });
}

export class Toast extends ActionSet implements ActionSetProps<Options, Payload> {
  message = '';
  duration = 3000;
  isError?: boolean;

  constructor(app: ClientApplication<any>, options: Options) {
    super(app, Group.Toast, Group.Toast);
    this.set(options);
  }

  get options(): Options {
    return {
      duration: this.duration,
      isError: this.isError,
      message: this.message,
    };
  }

  get payload(): Payload {
    return {
      id: this.id,
      ...this.options,
    };
  }

  set(options: Partial<Options>) {
    const mergedOptions = getMergedProps(this.options, options);
    const {message, duration, isError} = mergedOptions;

    this.message = message;
    this.duration = duration;
    this.isError = isError;

    return this;
  }

  dispatch(action: Action) {
    switch (action) {
      case Action.SHOW:
        const openAction = show(this.payload);
        this.app.dispatch(openAction);
        break;
      case Action.CLEAR:
        this.app.dispatch(clear({id: this.id}));
        break;
    }

    return this;
  }
}

export function create(app: ClientApplication<any>, options: Options) {
  return new Toast(app, options);
}

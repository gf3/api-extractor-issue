/**
 * @module History
 */
import {ClientApplication} from '../../../client';
import {actionWrapper, ActionSet} from '../../helper';
import {ComplexDispatch, Group, MetaAction} from '../../types';
import {Action, ActionType, Payload} from './types';

export interface HistoryAction extends MetaAction {
  payload: Payload;
}

export function push(payload: Payload): HistoryAction {
  return actionWrapper({
    payload,
    group: Group.Navigation,
    type: ActionType.PUSH,
  });
}

export function replace(payload: Payload): HistoryAction {
  return actionWrapper({
    payload,
    group: Group.Navigation,
    type: ActionType.REPLACE,
  });
}

export class History extends ActionSet implements ComplexDispatch<string> {
  constructor(app: ClientApplication<any>) {
    super(app, 'History', Group.Navigation);
  }

  get payload() {
    return {id: this.id};
  }

  dispatch(type: Action, path: string) {
    const payload = {...this.payload, path};
    switch (type) {
      case Action.PUSH:
        this.app.dispatch(push(payload));
        break;

      case Action.REPLACE:
        this.app.dispatch(replace(payload));
        break;
    }

    return this;
  }
}

export function create(app: ClientApplication<any>) {
  return new History(app);
}

/**
 * @module Loading
 */

import {ClientApplication} from '../../client';
import {actionWrapper, ActionSet} from '../helper';
import {ActionSetPayload, Group, MetaAction} from '../types';
import {Action, ActionType, Payload} from './types';

export type LoadingAction = MetaAction;

export function start(payload?: Payload): LoadingAction {
  return actionWrapper({
    payload,
    group: Group.Loading,
    type: ActionType.START,
  });
}

export function stop(payload?: Payload): LoadingAction {
  return actionWrapper({
    payload,
    group: Group.Loading,
    type: ActionType.STOP,
  });
}

export class Loading extends ActionSet implements ActionSetPayload<Payload> {
  constructor(app: ClientApplication<any>) {
    super(app, Group.Loading, Group.Loading);
  }

  get payload() {
    return {id: this.id};
  }

  dispatch(action: Action) {
    switch (action) {
      case Action.START:
        this.app.dispatch(start(this.payload));
        break;

      case Action.STOP:
        this.app.dispatch(stop(this.payload));
        break;
    }

    return this;
  }
}

export function create(app: ClientApplication<any>) {
  return new Loading(app);
}

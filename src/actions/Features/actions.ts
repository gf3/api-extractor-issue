/**
 * @module Features
 */

import {actionWrapper} from '../helper';
import {Group, MetaAction} from '../types';
import {invalidActionType, ErrorAction} from '../Error';
import {ActionType} from './types';
import {AnyAction} from '../../client';

export type FeaturesAction = MetaAction | AnyAction;

export function update(): FeaturesAction {
  return actionWrapper({
    group: Group.Features,
    type: ActionType.UPDATE,
  });
}

export function validationError(action: MetaAction): undefined | ErrorAction {
  switch (action.type) {
    case ActionType.UPDATE:
      return undefined;
    default:
      return invalidActionType(action);
  }
}

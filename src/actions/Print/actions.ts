/**
 * @module Print
 */

import {actionWrapper} from '../helper';
import {Group, MetaAction} from '../types';
import {ActionType} from './types';

export type PrintAction = MetaAction;

export function app(): PrintAction {
  return actionWrapper({
    group: Group.Print,
    type: ActionType.APP,
  });
}

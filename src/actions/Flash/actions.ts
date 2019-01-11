/**
 * @module Flash
 */

import {ClientApplication} from '../../client';
import {Toast} from '../Toast';
import {Options} from '../Toast/types';

export {
  ActionBase,
  clear,
  ClearAction,
  show,
  ShowAction,
  ToastAction as FlashAction,
} from '../Toast';

export class Flash extends Toast {}

export function create(app: ClientApplication<any>, options: Options) {
  return new Flash(app, options);
}

import {MetaAction} from '../actions/types';
import {PREFIX} from './constants';

/**
 * Predicate to determine if an action is an App Bridge action.
 * @public
 */
export function isAppBridgeAction(action: any): action is MetaAction {
  return (
    action instanceof Object &&
    action.hasOwnProperty('type') &&
    action.type.toString().startsWith(PREFIX)
  );
}

/**
 * Predicate to determine if an action originated from an application.
 * @internal
 */
export function isFromApp(action: any) {
  if (typeof action !== 'object' || typeof action.source !== 'object') {
    return false;
  }

  return typeof action.source.apiKey === 'string';
}

/**
 * Predicate to determine if an event originated from an application.
 * @internal
 */
export function isAppMessage(event: any) {
  if (typeof event !== 'object' || !event.data || typeof event.data !== 'object') {
    return false;
  }

  const {data} = event;

  return data.hasOwnProperty('type') && (data.type === 'getState' || data.type === 'dispatch');
}

import {HooksInterface, Hook, HookMap, LifecycleHandler, LifecycleHook} from './types';
import {addAndRemoveFromCollection} from '../util/collection';

export default class Hooks implements HooksInterface {
  private map: HookMap = {};

  set(hook: LifecycleHook, handler: LifecycleHandler) {
    if (!this.map.hasOwnProperty(hook)) {
      this.map[hook] = [];
    }

    let value: Hook = {handler, remove: () => {}};
    const remove = addAndRemoveFromCollection(this.map[hook], value);
    value = {handler, remove};
    return remove;
  }

  get(hook: LifecycleHook) {
    const value = this.map[hook];
    return value ? value.map(val => val.handler) : undefined;
  }

  run<C>(hook: LifecycleHook, final: Function, context: C, ...initialArgs: any[]) {
    let index = 0;
    const handlers = this.get(hook) || [];

    function handler(...args: any[]) {
      const childHandler = handlers[index++];

      if (childHandler) {
        return childHandler(handler).apply(context, args);
      }

      return final.apply(context, args);
    }

    return handler.apply(context, initialArgs);
  }
}

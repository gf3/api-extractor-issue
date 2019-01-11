import {
  isErrorEventName,
  throwError,
  Action as ErrorActions,
  ActionType as ErrorActionType,
} from '../actions/Error';
import {ClientApplication, LifecycleHook} from '../client';
import {removeFromCollection} from '../util/collection';
import {PREFIX} from './constants';
import mergeProps, {Indexable} from './merge';
import {
  ActionCallback,
  ActionSetInterface,
  ActionSubscription,
  Component,
  ErrorCallback,
  Group,
  Unsubscribe,
} from './types';
import generateUuid from './uuid';

const packageJson = require('../package.json');

const SEPARATOR = '::';

export function actionWrapper(action: any): any {
  return {...action, version: getVersion()};
}

export function getVersion() {
  return packageJson.version;
}

export function getEventNameSpace(group: string, eventName: string, component?: Component): string {
  let eventNameSpace = group.toUpperCase();
  if (component) {
    const {subgroups, type} = component;
    if (subgroups && subgroups.length > 0) {
      eventNameSpace += eventNameSpace.length > 0 ? SEPARATOR : '';
      subgroups.forEach((subgroup, index) => {
        eventNameSpace += `${subgroup.toUpperCase()}${
          index < subgroups.length - 1 ? SEPARATOR : ''
        }`;
      });
    }
    if (type !== group && type) {
      eventNameSpace += `${eventNameSpace.length > 0 ? SEPARATOR : ''}${type.toUpperCase()}`;
    }
  }
  if (eventNameSpace) {
    eventNameSpace += `${eventNameSpace.length > 0 ? SEPARATOR : ''}${eventName.toUpperCase()}`;
  }

  return `${PREFIX}${SEPARATOR}${eventNameSpace}`;
}

export function isValidOptionalNumber(value?: number): boolean {
  return value === null || value === undefined || typeof value === 'number';
}

export function isValidOptionalString(value?: string): boolean {
  return value === null || value === undefined || typeof value === 'string';
}

export abstract class ActionSet implements ActionSetInterface {
  readonly id: string;
  readonly defaultGroup: string;
  subgroups: string[] = [];
  subscriptions: ActionSubscription[] = [];

  constructor(
    public app: ClientApplication<any>,
    public type: string,
    public group: string,
    id?: string,
  ) {
    if (!app) {
      throwError(ErrorActionType.INVALID_OPTIONS, 'Missing required `app`');
    }

    this.id = id || generateUuid();
    this.defaultGroup = group;

    const defaultSet = this.set;
    this.set = (...args: any[]) => {
      if (!this.app.hooks) {
        return defaultSet.apply(this, args);
      }
      return this.app.hooks.run(LifecycleHook.UpdateAction, defaultSet, this, ...args);
    };
  }

  set(..._: any[]) {}

  get component(): Component {
    return {
      id: this.id,
      subgroups: this.subgroups,
      type: this.type,
    };
  }

  updateSubscription(
    subscriptionToRemove: ActionSubscription,
    group: string,
    subgroups: string[],
  ): Unsubscribe {
    const {eventType, callback, component} = subscriptionToRemove;
    let currentIndex;
    currentIndex = this.subscriptions.findIndex(
      subscription => subscription === subscriptionToRemove,
    );
    if (currentIndex >= 0) {
      this.subscriptions[currentIndex].unsubscribe();
    } else {
      currentIndex = undefined;
    }
    this.group = group;
    this.subgroups = subgroups;

    Object.assign(component, {subgroups: this.subgroups});

    return this.subscribe(eventType, callback, component, currentIndex);
  }

  error(callback: ErrorCallback): Unsubscribe {
    const subscriptionIndices: number[] = [];
    forEachInEnum(ErrorActions, eventNameSpace => {
      // Keep track of subscription index so we can call unsubscribe later
      // This ensure it will continue to work even when the subscription has been updated
      subscriptionIndices.push(this.subscriptions.length);
      this.subscribe(eventNameSpace, callback);
    });

    return () => {
      const subscriptionsToRemove = subscriptionIndices.map(index => this.subscriptions[index]);

      subscriptionsToRemove.forEach(toRemove => {
        removeFromCollection(this.subscriptions, toRemove, (removed: ActionSubscription) => {
          removed.unsubscribe();
        });
      });
    };
  }

  subscribe(
    eventName: string,
    callback: ActionCallback,
    component?: Component,
    currentIndex?: number,
  ): Unsubscribe {
    const eventComponent = component || this.component;
    const eventType = eventName.toUpperCase();
    const boundedCallback = typeof currentIndex === 'number' ? callback : callback.bind(this);

    let eventNameSpace;
    if (isErrorEventName(eventName)) {
      eventNameSpace = getEventNameSpace(Group.Error, eventName, {
        ...eventComponent,
        type: '',
      });
    } else {
      eventNameSpace = getEventNameSpace(this.group, eventName, eventComponent);
    }

    const unsubscribe = this.app.subscribe(
      eventNameSpace,
      boundedCallback,
      component ? component.id : this.id,
    );
    const subscription: ActionSubscription = {
      eventType,
      unsubscribe,
      callback: boundedCallback,
      component: eventComponent,
      updateSubscribe: (group, subgroups) =>
        this.updateSubscription.call(this, subscription, group, subgroups),
    };

    if (
      typeof currentIndex === 'number' &&
      currentIndex >= 0 &&
      currentIndex < this.subscriptions.length
    ) {
      this.subscriptions[currentIndex] = subscription;
    } else {
      this.subscriptions.push(subscription);
    }

    return unsubscribe;
  }

  unsubscribe(resetOnly = false) {
    unsubscribeActions(this.subscriptions, this.defaultGroup, resetOnly);

    return this;
  }
}

export abstract class ActionSetWithChildren extends ActionSet {
  children: ActionSetChildAction[] = [];
  unsubscribe(unsubscribeChildren = true, resetParentOnly = false) {
    unsubscribeActions(this.subscriptions, this.defaultGroup, resetParentOnly);
    this.children.forEach(child => {
      if (ActionSetWithChildren.prototype.isPrototypeOf(child)) {
        (child as ActionSetWithChildren).unsubscribe(
          unsubscribeChildren,
          unsubscribeChildren ? false : true,
        );
      } else {
        child.unsubscribe(unsubscribeChildren ? false : true);
      }
    });

    return this;
  }
  getChild(id: string): ActionSetChildAction | undefined {
    const childIndex = this.children.findIndex(child => child.id === id);

    return childIndex >= 0 ? this.children[childIndex] : undefined;
  }

  getChildIndex(id: string): number {
    return this.children.findIndex(child => child.id === id);
  }

  getChildSubscriptions(id: string, eventType?: string): ActionSubscription[] {
    return this.subscriptions.filter(
      sub => sub.component.id === id && (!eventType || eventType === sub.eventType),
    );
  }

  addChild(child: ActionSetChildAction, group: string, subgroups: string[]) {
    const {subscriptions} = child;
    const existingChild = this.getChild(child.id);
    // Add child if it doesn't already exist
    if (!existingChild) {
      this.children.push(child);
    }
    if (!subscriptions || (group === child.group && subgroups === child.subgroups)) {
      return this;
    }

    subscriptions.forEach((subscription: ActionSubscription) => {
      const {updateSubscribe} = subscription;
      updateSubscribe(group, subgroups);
    });

    // Update child's group and subgroups
    Object.assign(child, {group, subgroups});

    // Update child's children subscriptions
    if (ActionSetWithChildren.prototype.isPrototypeOf(child)) {
      (child as ActionSetWithChildren).children.forEach(c => this.addChild(c, group, subgroups));
    }

    return this;
  }

  removeChild(id: string) {
    removeFromCollection(this.children, this.getChild(id), () => {
      const toBeRemoved = this.subscriptions.filter(subs => subs.component.id === id);
      toBeRemoved.forEach(toRemove => {
        removeFromCollection(this.subscriptions, toRemove, (removed: ActionSubscription) => {
          removed.unsubscribe();
        });
      });
    });

    return this;
  }

  subscribeToChild(
    child: ActionSetChildAction,
    eventName: string | string[],
    callback: (childData: any) => void,
  ) {
    const boundedCallback = callback.bind(this);
    if (eventName instanceof Array) {
      eventName.forEach(e => this.subscribeToChild(child, e, callback));

      return this;
    }
    if (typeof eventName !== 'string') {
      return this;
    }
    const eventType = eventName.toUpperCase();
    const currentSubscriptions = this.getChildSubscriptions(child.id, eventType);
    if (currentSubscriptions.length > 0) {
      // Subscription is already there, simply update it
      currentSubscriptions.forEach(subs => subs.updateSubscribe(this.group, child.subgroups));
    } else {
      const childComponent = {
        id: child.id,
        subgroups: child.subgroups,
        type: child.type,
      };
      this.subscribe(eventType, boundedCallback, childComponent);
    }

    return this;
  }

  getUpdatedChildActions<A extends ActionSetChildAction>(
    newActions: A[],
    currentActions: A[],
  ): A[] | undefined {
    if (newActions.length === 0) {
      while (currentActions.length > 0) {
        const action = currentActions.pop();
        if (!action) {
          break;
        }
        this.removeChild(action.id);
      }

      return undefined;
    }
    // Only allow unique actions
    const uniqueActions = newActions.filter(
      (action, index, actionsArr) => index === actionsArr.indexOf(action),
    );
    const newActionIds = uniqueActions.map(action => action.id);
    // Remove unused actions
    const unusedActions = currentActions.filter(action => {
      return newActionIds.indexOf(action.id) < 0;
    });

    while (unusedActions.length > 0) {
      const action = unusedActions.pop();
      if (!action) {
        break;
      }
      this.removeChild(action.id);
    }

    return uniqueActions;
  }
}

export type ActionSetChildAction = ActionSet | ActionSetWithChildren;

function unsubscribeActions(
  subscriptions: ActionSubscription[],
  defaultGroup: string,
  reassign = false,
) {
  subscriptions.forEach(subscription => {
    if (reassign) {
      const {updateSubscribe} = subscription;
      // TODO: Support cases where we don't wipe out group and subgroups to defaults
      updateSubscribe(defaultGroup, []);
    } else {
      const {unsubscribe} = subscription;
      unsubscribe();
    }
  });
  if (!reassign) {
    subscriptions.length = 0;
  }
}

export function updateActionFromPayload<A extends Partial<ActionSetInterface>>(
  action: A,
  newProps: A,
): boolean {
  const {id} = action;
  if (id === newProps.id) {
    // Merge new properties
    Object.assign(action, getMergedProps(action, newProps));

    return true;
  }

  return false;
}

export function getMergedProps<Prop extends Indexable>(props: Prop, newProps: Partial<Prop>): Prop {
  const merged = mergeProps(props, newProps);
  if (!merged) {
    // tslint:disable-next-line:prefer-object-spread
    const cloned = Object.assign(props, newProps);

    return cloned;
  }

  return merged as Prop;
}

export function forEachInEnum<E extends Indexable>(types: E, callback: (prop: string) => void) {
  Object.keys(types).forEach((key: string) => {
    callback(types[key]);
  });
}

export function findMatchInEnum<E extends Indexable>(types: E, lookup: string): string | undefined {
  const match = Object.keys(types).find((key: string) => {
    return lookup === types[key];
  });

  return match ? types[match] : undefined;
}

/**
 * @module Button
 */

import {ClientApplication} from '../../client';
import {actionWrapper, getEventNameSpace, getMergedProps, ActionSet} from '../helper';
import {ActionSetProps, ClickAction, Component, ComponentType, Group, MetaAction} from '../types';
import {Action, ClickPayload, Icon, Options, Payload, Style} from './types';

export interface ButtonUpdateAction extends MetaAction {
  readonly group: string;
  payload: Payload;
}

export type ButtonAction = ButtonUpdateAction | ClickAction | MetaAction;

export function clickButton(
  group: string,
  component: Component,
  payload?: ClickPayload,
): ClickAction {
  const {id} = component;
  const action = getEventNameSpace(group, Action.CLICK, component);
  const buttonPayload: ClickPayload = {
    id,
    payload,
  };

  return actionWrapper({type: action, group, payload: buttonPayload});
}

export function update(group: string, component: Component, props: Payload): ButtonUpdateAction {
  const {id} = component;
  const {label} = props;
  const action = getEventNameSpace(group, Action.UPDATE, component);
  const buttonPayload: Payload = {
    id,
    label,
    ...props,
  };

  return actionWrapper({type: action, group, payload: buttonPayload});
}

export function isValidButtonProps(button: Payload) {
  return typeof button.id === 'string' && typeof button.label === 'string';
}

export class Button extends ActionSet implements ActionSetProps<Options, Payload> {
  label!: string;
  disabled = false;
  icon?: Icon;
  style?: Style;

  constructor(app: ClientApplication<any>, options: Options) {
    super(app, ComponentType.Button, Group.Button);
    this.set(options, false);
  }

  get options(): Options {
    return {
      disabled: this.disabled,
      icon: this.icon,
      label: this.label,
      style: this.style,
    };
  }

  get payload(): Payload {
    return {
      id: this.id,
      ...this.options,
    };
  }

  set(options: Partial<Options>, shouldUpdate = true) {
    const mergedOptions = getMergedProps(this.options, options);
    const {label, disabled, icon, style} = mergedOptions;

    this.label = label;
    this.disabled = !!disabled;
    this.icon = icon;
    this.style = style;

    if (shouldUpdate) {
      this.dispatch(Action.UPDATE);
    }

    return this;
  }

  dispatch(action: Action.UPDATE): ActionSet;

  dispatch(action: Action.CLICK, payload?: any): ActionSet;

  dispatch(action: Action, payload?: any) {
    switch (action) {
      case Action.CLICK:
        this.app.dispatch(clickButton(this.group, this.component, payload));
        break;
      case Action.UPDATE:
        const updateAction = update(this.group, this.component, this.payload);
        this.app.dispatch(updateAction);
        break;
    }

    return this;
  }
}

export function create(app: ClientApplication<any>, options: Options) {
  return new Button(app, options);
}

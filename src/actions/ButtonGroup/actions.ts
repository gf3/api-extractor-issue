/**
 * @module ButtonGroup
 */

import {ClientApplication} from '../../client';
import {getSingleButton} from '../buttonHelper';
import {
  actionWrapper,
  getEventNameSpace,
  getMergedProps,
  updateActionFromPayload,
  ActionSetWithChildren,
} from '../helper';
import {ActionSetProps, Component, ComponentType, Group, MetaAction} from '../types';
import {Button, Payload as ButtonPayload} from '../Button';
import {Action, Options, Payload} from './types';

export interface ButtonGroupUpdateAction extends MetaAction {
  readonly group: string;
  payload: Payload;
}

export type ButtonGroupAction = ButtonGroupUpdateAction | MetaAction;

export function update(
  group: string,
  component: Component,
  props: Payload,
): ButtonGroupUpdateAction {
  return buttonActionWrapper(group, component, Action.UPDATE, props);
}

export function isGroupedButton(options: ButtonGroup | object): options is ButtonGroup {
  const castOptions = options as ButtonGroup;

  return castOptions.buttons && castOptions.buttons.length > 0 && castOptions.label !== undefined;
}

export function isGroupedButtonPayload(payload: Payload | object): payload is Payload {
  const castOptions = payload as Payload;

  return (
    Array.isArray(castOptions.buttons) &&
    typeof castOptions.id === 'string' &&
    typeof castOptions.label === 'string'
  );
}

export class ButtonGroup extends ActionSetWithChildren implements ActionSetProps<Options, Payload> {
  label!: string;
  disabled = false;
  buttonsOptions: Button[] = [];
  buttons: ButtonPayload[] = [];
  constructor(app: ClientApplication<any>, options: Options) {
    super(app, ComponentType.ButtonGroup, Group.ButtonGroup);
    this.set(options, false);
  }

  get options(): Options {
    return {
      buttons: this.buttonsOptions,
      disabled: this.disabled,
      label: this.label,
    };
  }

  get payload(): Payload {
    return {
      ...this.options,
      buttons: this.buttons,
      id: this.id,
    };
  }

  set(options: Partial<Options>, shouldUpdate = true) {
    const mergedOptions = getMergedProps(this.options, options);
    const {label, disabled, buttons} = mergedOptions;

    this.label = label;
    this.disabled = !!disabled;
    this.buttons = this.getButtons(buttons);
    if (shouldUpdate) {
      this.dispatch(Action.UPDATE);
    }

    return this;
  }

  dispatch(action: Action) {
    switch (action) {
      case Action.UPDATE:
        const updateAction = update(this.group, this.component, this.payload);
        this.app.dispatch(updateAction);
        break;
    }

    return this;
  }

  updateButtons(newPayload: ButtonPayload) {
    if (!this.buttons || this.buttons.length === 0) {
      return;
    }
    let updated;
    for (const action of this.buttons) {
      updated = updateActionFromPayload(action, newPayload);
      if (updated) {
        break;
      }
    }
    if (updated) {
      this.dispatch(Action.UPDATE);
    }
  }

  protected getSingleButton(button: Button): ButtonPayload {
    return getSingleButton(this, button, this.subgroups, this.updateButtons);
  }

  protected getButtons(buttonOptions?: Button[]): ButtonPayload[] {
    const buttons: ButtonPayload[] = [];
    if (!buttonOptions) {
      return [];
    }

    buttonOptions.forEach((button: Button) => {
      const singleButton = getSingleButton(this, button, this.subgroups, this.updateButtons);
      buttons.push(singleButton);
    });
    this.buttonsOptions = buttonOptions;

    return buttons;
  }
}

export function create(app: ClientApplication<any>, options: Options) {
  return new ButtonGroup(app, options);
}

function buttonActionWrapper(
  group: string,
  component: Component,
  eventName: string,
  props: Payload,
  payload?: any,
): any {
  const {id} = component;
  const {label} = props;
  const action = getEventNameSpace(group, eventName, component);
  const buttonPayload = {
    id,
    label,
    ...props,
    payload,
  };

  return actionWrapper({type: action, group, payload: buttonPayload});
}

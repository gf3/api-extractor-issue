/**
 * @module TitleBar
 */

import {clickButton, Button, Payload as ButtonPayload} from '../Button';
import {isGroupedButtonPayload, ButtonGroup, Payload as ButtonGroupPayload} from '../ButtonGroup';

import {ClientApplication} from '../../client';
import {getGroupedButton} from '../buttonGroupHelper';
import {getSingleButton} from '../buttonHelper';
import {
  actionWrapper,
  getMergedProps,
  updateActionFromPayload,
  ActionSetWithChildren,
} from '../helper';
import {ActionSetProps, ClickAction, ComponentType, Group, MetaAction} from '../types';
import {
  Action,
  ActionType,
  ButtonsOptions as TitleBarButtonsOptions,
  ButtonsPayload as TitleBarButtonsPayload,
  Options,
  Payload,
} from './types';

const TITLEBAR_BUTTON_PROPS = {
  group: Group.TitleBar,
  subgroups: ['Buttons'],
};

const BREADCRUMB_BUTTON_PROPS = {
  group: Group.TitleBar,
  subgroups: ['Breadcrumbs'],
  type: ComponentType.Button,
};

export interface UpdateAction extends MetaAction {
  readonly group: typeof Group.TitleBar;
  payload: Payload;
}

export type TitleBarAction = UpdateAction | ClickAction | MetaAction;

export function clickActionButton(id: string, payload?: any): ClickAction {
  const type = ComponentType.Button;
  const component = {id, type, ...TITLEBAR_BUTTON_PROPS};

  return clickButton(Group.TitleBar, component, payload);
}

export function clickBreadcrumb(id: string, payload?: any): ClickAction {
  const component = {id, ...BREADCRUMB_BUTTON_PROPS};

  return clickButton(Group.TitleBar, component, payload);
}

export function update(payload: Payload): UpdateAction {
  return actionWrapper({
    payload,
    group: Group.TitleBar,
    type: ActionType.UPDATE,
  });
}

export class TitleBar extends ActionSetWithChildren implements ActionSetProps<Options, Payload> {
  title?: string;
  primary?: ButtonPayload;
  secondary?: (ButtonPayload | ButtonGroupPayload)[];
  primaryOptions?: Button;
  secondaryOptions?: (ButtonGroup | Button)[];
  breadcrumb?: ButtonPayload;
  breadcrumbsOption?: Button;

  constructor(app: ClientApplication<any>, options: Options) {
    super(app, Group.TitleBar, Group.TitleBar);
    // Trigger 'update' on creation
    this.set(options);
  }

  get buttons(): TitleBarButtonsPayload | undefined {
    if (!this.primary && !this.secondary) {
      return undefined;
    }

    return {
      primary: this.primary,
      secondary: this.secondary,
    };
  }

  get buttonsOptions(): TitleBarButtonsOptions | undefined {
    if (!this.primaryOptions && !this.secondaryOptions) {
      return undefined;
    }

    return {
      primary: this.primaryOptions,
      secondary: this.secondaryOptions,
    };
  }

  get options(): Options {
    return {
      breadcrumbs: this.breadcrumbsOption,
      buttons: this.buttonsOptions,
      title: this.title,
    };
  }

  get payload(): Payload {
    return {
      ...this.options,
      breadcrumbs: this.breadcrumb,
      buttons: this.buttons,
      id: this.id,
    };
  }

  set(options: Partial<Options>, shouldUpdate = true) {
    const mergedOptions: Options = getMergedProps(this.options, options);
    const {title, buttons, breadcrumbs} = mergedOptions;

    this.title = title;
    this.setBreadcrumbs(breadcrumbs);
    this.setPrimaryButton(buttons ? buttons.primary : undefined);
    this.setSecondaryButton(buttons ? buttons.secondary : undefined);

    if (shouldUpdate) {
      this.dispatch(Action.UPDATE);
    }

    return this;
  }

  dispatch(action: Action) {
    switch (action) {
      case Action.UPDATE:
        this.app.dispatch(update(this.payload));
        break;
    }

    return this;
  }

  protected getButton(
    button: Button | ButtonGroup,
    subgroups: string[],
    updateCb: (newPayload: ButtonPayload | ButtonGroupPayload) => void,
  ): ButtonPayload | ButtonGroupPayload {
    if (button instanceof ButtonGroup) {
      return getGroupedButton(this, button, subgroups, updateCb);
    }

    return getSingleButton(this, button, subgroups, updateCb);
  }

  protected updatePrimaryButton(newPayload: ButtonPayload) {
    if (!this.primary) {
      return;
    }
    if (updateActionFromPayload(this.primary, newPayload)) {
      this.dispatch(Action.UPDATE);
    }
  }

  protected updateSecondaryButtons(newPayload: ButtonPayload | ButtonGroupPayload) {
    if (!this.secondary) {
      return;
    }
    const buttonToUpdate = this.secondary.find(action => action.id === newPayload.id);
    if (!buttonToUpdate) {
      return;
    }

    let updated = false;
    if (isGroupedButtonPayload(newPayload)) {
      updated = updateActionFromPayload(buttonToUpdate, newPayload);
    } else {
      updated = updateActionFromPayload(buttonToUpdate, newPayload);
    }
    if (updated) {
      this.dispatch(Action.UPDATE);
    }
  }

  protected updateBreadcrumbButton(newPayload: ButtonPayload) {
    if (!this.breadcrumb) {
      return;
    }
    if (updateActionFromPayload(this.breadcrumb, newPayload)) {
      this.dispatch(Action.UPDATE);
    }
  }

  protected setPrimaryButton(newOptions?: Button) {
    this.primaryOptions = this.getChildButton(newOptions, this.primaryOptions);
    this.primary = this.primaryOptions
      ? this.getButton(
          this.primaryOptions,
          TITLEBAR_BUTTON_PROPS.subgroups,
          this.updatePrimaryButton,
        )
      : undefined;
  }

  protected setSecondaryButton(newOptions?: (ButtonGroup | Button)[]) {
    const newButtons = newOptions || [];
    const currentButtons = this.secondaryOptions || [];
    this.secondaryOptions = this.getUpdatedChildActions(newButtons, currentButtons);

    this.secondary = this.secondaryOptions
      ? this.secondaryOptions.map(action =>
          this.getButton(action, TITLEBAR_BUTTON_PROPS.subgroups, this.updateSecondaryButtons),
        )
      : undefined;
  }

  protected setBreadcrumbs(breadcrumb?: Button) {
    this.breadcrumbsOption = this.getChildButton(breadcrumb, this.breadcrumbsOption);
    this.breadcrumb = this.breadcrumbsOption
      ? this.getButton(
          this.breadcrumbsOption,
          BREADCRUMB_BUTTON_PROPS.subgroups,
          this.updateBreadcrumbButton,
        )
      : undefined;
  }

  protected getChildButton(newAction: undefined | Button, currentAction: undefined | Button) {
    const newButtons = newAction ? [newAction] : [];
    const currentButtons = currentAction ? [currentAction] : [];
    const updatedButton = this.getUpdatedChildActions(newButtons, currentButtons);

    return updatedButton ? updatedButton[0] : undefined;
  }
}

export function create(app: ClientApplication<any>, options: Options) {
  return new TitleBar(app, options);
}

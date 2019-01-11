/**
 * @module Modal
 */
import {ClientApplication} from '../../client';
import {getSingleButton} from '../buttonHelper';
import {
  actionWrapper,
  getMergedProps,
  updateActionFromPayload,
  ActionSetWithChildren,
} from '../helper';
import {ActionSetProps, ClickAction, ComponentType, Group, MetaAction} from '../types';
import {clickButton, Button, Payload as ButtonPayload} from '../Button';
import {
  Action,
  ActionType,
  ClosePayload,
  Footer,
  FooterOptions,
  IframeOptions,
  IframePayload,
  MessageOptions,
  MessagePayload,
  Size,
} from './types';

const FOOTER_BUTTON_PROPS = {
  group: Group.Modal,
  subgroups: ['Footer'],
  type: ComponentType.Button,
};

export interface ActionBase extends MetaAction {
  readonly group: typeof Group.Modal;
}

export interface OpenAction extends ActionBase {
  readonly type: typeof ActionType.OPEN;
  readonly payload: MessagePayload | IframePayload;
}

export type UpdateAction = OpenAction;

export interface CloseAction extends ActionBase {
  readonly type: typeof ActionType.CLOSE;
}

export type ModalAction = OpenAction | UpdateAction | CloseAction | MetaAction;

export function openModal(modalPayload: MessagePayload | IframePayload): OpenAction {
  return actionWrapper({
    group: Group.Modal,
    payload: modalPayload,
    type: ActionType.OPEN,
  });
}

export function closeModal(modalClosePayload: ClosePayload): CloseAction {
  return actionWrapper({
    group: Group.Modal,
    payload: modalClosePayload,
    type: ActionType.CLOSE,
  });
}

export function clickFooterButton(id: string, payload?: any): ClickAction {
  const component = {id, ...FOOTER_BUTTON_PROPS};

  return clickButton(Group.Modal, component, payload);
}

export function update(payload: MessagePayload | IframePayload): UpdateAction {
  return actionWrapper({
    payload,
    group: Group.Modal,
    type: ActionType.UPDATE,
  });
}

export function isIframeModal(
  options: MessagePayload | IframePayload | object,
): options is IframePayload {
  return (
    typeof (options as IframePayload).url === 'string' ||
    typeof (options as IframePayload).path === 'string'
  );
}

export function isMessageModal(
  options: MessagePayload | IframePayload | object,
): options is MessagePayload {
  return typeof (options as MessagePayload).message === 'string';
}

export abstract class Modal extends ActionSetWithChildren {
  title?: string;
  size = Size.Small;
  footerPrimary?: ButtonPayload;
  footerPrimaryOptions?: Button;
  footerSecondary?: ButtonPayload[];
  footerSecondaryOptions?: Button[];

  get footer(): Footer | undefined {
    if (!this.footerPrimary && !this.footerSecondary) {
      return undefined;
    }

    return {
      buttons: {
        primary: this.footerPrimary,
        secondary: this.footerSecondary,
      },
    };
  }

  get footerOptions(): FooterOptions | undefined {
    if (!this.footerPrimaryOptions && !this.footerSecondaryOptions) {
      return undefined;
    }

    return {
      buttons: {
        primary: this.footerPrimaryOptions,
        secondary: this.footerSecondaryOptions,
      },
    };
  }

  protected close() {
    this.app.dispatch(closeModal({id: this.id}));
  }

  protected setFooterPrimaryButton(newOptions: Button | undefined, updateCb: () => void) {
    const {subgroups} = FOOTER_BUTTON_PROPS;
    this.footerPrimaryOptions = this.getChildButton(newOptions, this.footerPrimaryOptions);
    this.footerPrimary = this.footerPrimaryOptions
      ? getSingleButton(this, this.footerPrimaryOptions, subgroups, (newPayload: ButtonPayload) => {
          this.updatePrimaryFooterButton(newPayload, updateCb);
        })
      : undefined;
  }

  protected setFooterSecondaryButtons(newOptions: Button[] | undefined, updateCb: () => void) {
    const {subgroups} = FOOTER_BUTTON_PROPS;
    const newButtons = newOptions || [];
    const currentOptions = (this.footerOptions && this.footerOptions.buttons.secondary) || [];
    this.footerSecondaryOptions = this.getUpdatedChildActions(newButtons, currentOptions);

    this.footerSecondary = this.footerSecondaryOptions
      ? this.footerSecondaryOptions.map(action =>
          getSingleButton(this, action, subgroups, (newPayload: ButtonPayload) => {
            this.updateSecondaryFooterButton(newPayload, updateCb);
          }),
        )
      : undefined;
  }

  protected getChildButton(newAction: undefined | Button, currentAction: undefined | Button) {
    const newButtons = newAction ? [newAction] : [];
    const currentButtons = currentAction ? [currentAction] : [];
    const updatedButton = this.getUpdatedChildActions(newButtons, currentButtons);

    return updatedButton ? updatedButton[0] : undefined;
  }

  protected updatePrimaryFooterButton(newPayload: ButtonPayload, updateCb: () => void) {
    if (!this.footer || !this.footer.buttons.primary) {
      return;
    }
    if (updateActionFromPayload(this.footer.buttons.primary, newPayload)) {
      updateCb();
    }
  }

  protected updateSecondaryFooterButton(newPayload: ButtonPayload, updateCb: () => void) {
    if (!this.footer || !this.footer.buttons || !this.footer.buttons.secondary) {
      return;
    }
    let updated;
    for (const action of this.footer.buttons.secondary) {
      updated = updateActionFromPayload(action, newPayload);
      if (updated) {
        break;
      }
    }
    if (updated) {
      updateCb();
    }
  }
}

export class ModalMessage extends Modal implements ActionSetProps<MessageOptions, MessagePayload> {
  message!: string;

  constructor(app: ClientApplication<any>, options: MessageOptions) {
    super(app, Group.Modal, Group.Modal);
    this.set(options, false);
  }

  get payload() {
    return {
      ...this.options,
      footer: this.footer,
      id: this.id,
    };
  }

  get options() {
    return {
      footer: this.footerOptions,
      message: this.message,
      size: this.size,
      title: this.title,
    };
  }

  set(options: Partial<MessageOptions>, shouldUpdate = true) {
    const mergedOptions = getMergedProps(this.options, options);
    const {title, footer, message, size} = mergedOptions;

    this.title = title;
    this.message = message;
    this.size = size;
    this.setFooterPrimaryButton(footer ? footer.buttons.primary : undefined, () => {
      this.dispatch(Action.UPDATE);
    });

    this.setFooterSecondaryButtons(footer ? footer.buttons.secondary : undefined, () => {
      this.dispatch(Action.UPDATE);
    });

    if (shouldUpdate) {
      this.dispatch(Action.UPDATE);
    }

    return this;
  }

  dispatch(action: Action) {
    switch (action) {
      case Action.OPEN:
        this.app.dispatch(openModal(this.payload));
        break;
      case Action.CLOSE:
        this.close();
        break;
      case Action.UPDATE:
        this.app.dispatch(update(this.payload));
        break;
    }

    return this;
  }
}

export class ModalIframe extends Modal implements ActionSetProps<IframeOptions, IframePayload> {
  url?: string;
  path?: string;

  constructor(app: ClientApplication<any>, options: IframeOptions) {
    super(app, Group.Modal, Group.Modal);
    this.set(options, false);
  }

  get payload() {
    return {
      ...this.options,
      footer: this.footer,
      id: this.id,
    };
  }

  get options() {
    return {
      footer: this.footerOptions,
      path: this.path,
      size: this.size,
      title: this.title,
      url: this.url,
    };
  }

  set(options: Partial<IframeOptions>, shouldUpdate = true) {
    const mergedOptions = getMergedProps(this.options, options);
    const {title, footer, path, url, size} = mergedOptions;

    this.title = title;
    this.url = url;
    this.path = path;
    this.size = size;

    this.setFooterPrimaryButton(footer ? footer.buttons.primary : undefined, () => {
      this.dispatch(Action.UPDATE);
    });

    this.setFooterSecondaryButtons(footer ? footer.buttons.secondary : undefined, () => {
      this.dispatch(Action.UPDATE);
    });

    if (shouldUpdate) {
      this.dispatch(Action.UPDATE);
    }

    return this;
  }

  dispatch(action: Action) {
    switch (action) {
      case Action.OPEN:
        this.app.dispatch(openModal(this.payload));
        break;
      case Action.CLOSE:
        this.close();
        break;
      case Action.UPDATE:
        this.app.dispatch(update(this.payload));
        break;
    }

    return this;
  }
}

export const create = (app: ClientApplication<any>, options: MessageOptions | IframeOptions) => {
  if (isIframeModal(options)) {
    return new ModalIframe(app, options);
  }

  return new ModalMessage(app, options);
};

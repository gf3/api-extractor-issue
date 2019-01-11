/**
 * @module ResourcePicker
 */

import {ClientApplication} from '../../client';

import {actionWrapper, getMergedProps, ActionSet} from '../helper';
import {ActionSetProps, Group, MetaAction} from '../types';

import {
  Action,
  ActionType,
  BaseOptions,
  CancelPayload,
  ClosePayload,
  Options,
  Payload,
  ProductOptions,
  ResourceSelection,
  ResourceType,
  SelectPayload,
} from './types';

export interface ActionBase extends MetaAction {
  readonly group: typeof Group.ResourcePicker;
}

export interface SelectAction extends ActionBase {
  readonly type: typeof ActionType.SELECT;
  readonly payload: SelectPayload;
}

export interface UpdateAction extends ActionBase {
  readonly type: typeof ActionType.UPDATE;
  readonly payload: Payload;
}

export interface CancelAction extends ActionBase {
  readonly type: typeof ActionType.CANCEL;
}

export type CloseAction = CancelAction;

export interface OpenAction extends ActionBase {
  readonly type: typeof ActionType.OPEN;
  readonly payload: Payload;
}

export type ResourcePickerAction =
  | SelectAction
  | UpdateAction
  | CancelAction
  | OpenAction
  | MetaAction;

export function select(payload: SelectPayload): SelectAction {
  return actionWrapper({
    payload,
    group: Group.ResourcePicker,
    type: ActionType.SELECT,
  });
}

export function open(payload: Payload): OpenAction {
  return actionWrapper({
    payload,
    group: Group.ResourcePicker,
    type: ActionType.OPEN,
  });
}

export function cancel(payload: CancelPayload): CancelAction {
  return actionWrapper({
    payload,
    group: Group.ResourcePicker,
    type: ActionType.CANCEL,
  });
}

export function close(payload: ClosePayload): CloseAction {
  return actionWrapper({
    payload,
    group: Group.ResourcePicker,
    type: ActionType.CANCEL,
  });
}

export function update(payload: Payload): UpdateAction {
  return actionWrapper({
    payload,
    group: Group.ResourcePicker,
    type: ActionType.UPDATE,
  });
}

export class ResourcePicker extends ActionSet
  implements ActionSetProps<Options | ProductOptions, Payload> {
  readonly resourceType!: ResourceType;
  initialQuery?: string;
  selectMultiple?: boolean;
  selection: ResourceSelection[] = [];
  showHidden?: boolean;
  showVariants?: boolean;

  constructor(
    app: ClientApplication<any>,
    options: Options | ProductOptions,
    resourceType: ResourceType,
  ) {
    super(app, Group.ResourcePicker, Group.ResourcePicker);

    this.resourceType = resourceType;
    this.set(options, false);
  }

  get payload() {
    return {
      ...this.options,
      id: this.id,
      resourceType: this.resourceType,
    };
  }

  get options() {
    const options: Options = {
      initialQuery: this.initialQuery,
      selectMultiple: this.selectMultiple,
      showHidden: this.showHidden,
    };

    if (this.resourceType === ResourceType.Product) {
      const productOptions: ProductOptions = {
        ...options,
        showVariants: this.showVariants,
      };

      return productOptions;
    }

    return options;
  }

  set(options: Partial<Options | ProductOptions>, shouldUpdate = true) {
    const mergedOptions: ProductOptions = getMergedProps(this.options, options);
    const {
      initialQuery,
      showHidden = false,
      showVariants = true,
      selectMultiple = true,
    } = mergedOptions;

    this.initialQuery = initialQuery;
    this.showHidden = Boolean(showHidden);
    this.showVariants = Boolean(showVariants);
    this.selectMultiple = Boolean(selectMultiple);

    if (shouldUpdate) {
      this.update();
    }

    return this;
  }

  dispatch(action: Action, selection?: ResourceSelection[]) {
    if (action === Action.OPEN) {
      this.open();
    } else if (action === Action.UPDATE) {
      this.update();
    } else if (action === Action.CLOSE || action === Action.CANCEL) {
      this.cancel();
    } else if (action === Action.SELECT) {
      this.selection = selection as ResourceSelection[];
      this.app.dispatch(select({id: this.id, selection: this.selection}));
    }

    return this;
  }

  protected update() {
    this.app.dispatch(update(this.payload));
  }

  protected open() {
    this.app.dispatch(open(this.payload));
  }

  protected cancel() {
    this.app.dispatch(cancel({id: this.id}));
  }

  protected close() {
    this.cancel();
  }
}

export const create = (app: ClientApplication<any>, baseOptions: BaseOptions) => {
  const {resourceType, options = {}} = baseOptions;

  return new ResourcePicker(app, options, resourceType);
};

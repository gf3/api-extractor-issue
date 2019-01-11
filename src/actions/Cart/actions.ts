/**
 * @module Cart
 */

import {ClientApplication} from '../../client';
import {actionWrapper, ActionSet} from '../helper';
import {Group} from '../types';
import {
  Action,
  ActionType,
  AddCustomerAddressPayload,
  AddLineItemPayload,
  Options,
  Payload,
  RemoveLineItemDiscountPayload,
  RemoveLineItemPayload,
  RemoveLineItemPropertiesPayload,
  RemovePropertiesPayload,
  SetCustomerPayload,
  SetDiscountPayload,
  SetLineItemDiscountPayload,
  SetLineItemPropertiesPayload,
  SetPropertiesPayload,
  UpdateCustomerAddressPayload,
  UpdateLineItemPayload,
} from './types';

/**
 * Cart
 */

export class Cart extends ActionSet {
  constructor(app: ClientApplication<any>, options?: Options) {
    super(app, Group.Cart, Group.Cart, options ? options.id : undefined);
  }

  dispatch(
    action: Action.FETCH | Action.REMOVE_CUSTOMER | Action.REMOVE_DISCOUNT | Action.CLEAR,
  ): Cart;
  dispatch(action: Action.UPDATE, payload: Payload): Cart;
  dispatch(action: Action.SET_CUSTOMER, payload: SetCustomerPayload): Cart;
  dispatch(action: Action.ADD_CUSTOMER_ADDRESS, payload: AddCustomerAddressPayload): Cart;
  dispatch(action: Action.UPDATE_CUSTOMER_ADDRESS, payload: UpdateCustomerAddressPayload): Cart;
  dispatch(action: Action.SET_DISCOUNT, payload: SetDiscountPayload): Cart;
  dispatch(action: Action.SET_PROPERTIES, payload: SetPropertiesPayload): Cart;
  dispatch(action: Action.REMOVE_PROPERTIES, payload: RemovePropertiesPayload): Cart;
  dispatch(action: Action.ADD_LINE_ITEM, payload: AddLineItemPayload): Cart;
  dispatch(action: Action.UPDATE_LINE_ITEM, payload: UpdateLineItemPayload): Cart;
  dispatch(action: Action.REMOVE_LINE_ITEM, payload: RemoveLineItemPayload): Cart;
  dispatch(action: Action.SET_LINE_ITEM_DISCOUNT, payload: SetLineItemDiscountPayload): Cart;
  dispatch(action: Action.REMOVE_LINE_ITEM_DISCOUNT, payload: RemoveLineItemDiscountPayload): Cart;
  dispatch(action: Action.SET_LINE_ITEM_PROPERTIES, payload: SetLineItemPropertiesPayload): Cart;
  dispatch(
    action: Action.REMOVE_LINE_ITEM_PROPERTIES,
    payload: RemoveLineItemPropertiesPayload,
  ): Cart;
  dispatch(action: Action, payload?: any) {
    switch (action) {
      case Action.FETCH:
        this.dispatchCartAction(ActionType.FETCH);
        break;
      case Action.UPDATE:
        this.dispatchCartAction(ActionType.UPDATE, payload);
        break;
      case Action.SET_CUSTOMER:
        this.dispatchCartAction(ActionType.SET_CUSTOMER, payload);
        break;
      case Action.REMOVE_CUSTOMER:
        this.dispatchCartAction(ActionType.REMOVE_CUSTOMER, payload);
        break;
      case Action.ADD_CUSTOMER_ADDRESS:
        this.dispatchCartAction(ActionType.ADD_CUSTOMER_ADDRESS, payload);
        break;
      case Action.UPDATE_CUSTOMER_ADDRESS:
        this.dispatchCartAction(ActionType.UPDATE_CUSTOMER_ADDRESS, payload);
        break;
      case Action.SET_DISCOUNT:
        this.dispatchCartAction(ActionType.SET_DISCOUNT, payload);
        break;
      case Action.REMOVE_DISCOUNT:
        this.dispatchCartAction(ActionType.REMOVE_DISCOUNT, payload);
        break;
      case Action.SET_PROPERTIES:
        this.dispatchCartAction(ActionType.SET_PROPERTIES, payload);
        break;
      case Action.REMOVE_PROPERTIES:
        this.dispatchCartAction(ActionType.REMOVE_PROPERTIES, payload);
        break;
      case Action.CLEAR:
        this.dispatchCartAction(ActionType.CLEAR, payload);
        break;
      case Action.ADD_LINE_ITEM:
        this.dispatchCartAction(ActionType.ADD_LINE_ITEM, payload);
        break;
      case Action.UPDATE_LINE_ITEM:
        this.dispatchCartAction(ActionType.UPDATE_LINE_ITEM, payload);
        break;
      case Action.REMOVE_LINE_ITEM:
        this.dispatchCartAction(ActionType.REMOVE_LINE_ITEM, payload);
        break;
      case Action.SET_LINE_ITEM_DISCOUNT:
        this.dispatchCartAction(ActionType.SET_LINE_ITEM_DISCOUNT, payload);
        break;
      case Action.REMOVE_LINE_ITEM_DISCOUNT:
        this.dispatchCartAction(ActionType.REMOVE_LINE_ITEM_DISCOUNT, payload);
        break;
      case Action.SET_LINE_ITEM_PROPERTIES:
        this.dispatchCartAction(ActionType.SET_LINE_ITEM_PROPERTIES, payload);
        break;
      case Action.REMOVE_LINE_ITEM_PROPERTIES:
        this.dispatchCartAction(ActionType.REMOVE_LINE_ITEM_PROPERTIES, payload);
        break;
    }

    return this;
  }

  private dispatchCartAction(type: ActionType, payload?: any) {
    this.app.dispatch(
      actionWrapper({
        type,
        group: Group.Cart,
        payload: {
          ...(payload || {}),
          id: this.id,
        },
      }),
    );
  }
}

export function create(app: ClientApplication<any>, options?: Options) {
  return new Cart(app, options);
}

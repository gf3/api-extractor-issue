import {createMockApp} from 'test/helper';
import * as Helper from '../../helper';
import * as Actions from '../actions';
import * as Types from '../types';
const Cart = Actions.Cart;
const {Action, ActionType} = Types;

jest.mock('../../uuid', (fakeId = 'fakeId') => jest.fn().mockReturnValue(fakeId));

describe('Cart', () => {
  let app;

  beforeEach(() => {
    app = createMockApp();
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('dispatch fetch', () => {
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        id: cart.id,
      },
      type: ActionType.FETCH,
    };
    cart.dispatch(Action.FETCH);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch setCustomer', () => {
    const data = {
      email: 'any email',
      firstName: 'any firstName',
      id: 123,
      lastName: 'any lastName',
      note: 'any note',
    };
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
      },
      type: ActionType.SET_CUSTOMER,
    };
    cart.dispatch(Action.SET_CUSTOMER, {data});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch removeCustomer', () => {
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        id: cart.id,
      },
      type: ActionType.REMOVE_CUSTOMER,
    };
    cart.dispatch(Action.REMOVE_CUSTOMER);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch addCustomerAddress', () => {
    const data = {
      address1: 'any address1',
      address2: 'any address2',
      city: 'any city',
      company: 'any company',
      country: 'any country',
      countryCode: 'any countryCode',
      firstName: 'any firstName',
      lastName: 'any lastName',
      name: 'any name',
      phone: 'any phone',
      provice: 'any provice',
      proviceCode: 'any proviceCode',
      zip: 'any zip',
    };
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
      },
      type: ActionType.ADD_CUSTOMER_ADDRESS,
    };
    cart.dispatch(Action.ADD_CUSTOMER_ADDRESS, {data});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch updateCustomerAddress', () => {
    const data = {
      address1: 'any address1',
      address2: 'any address2',
      city: 'any city',
      company: 'any company',
      country: 'any country',
      countryCode: 'any countryCode',
      firstName: 'any firstName',
      lastName: 'any lastName',
      name: 'any name',
      phone: 'any phone',
      provice: 'any provice',
      proviceCode: 'any proviceCode',
      zip: 'any zip',
    };
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
        index: 0,
      },
      type: ActionType.UPDATE_CUSTOMER_ADDRESS,
    };
    cart.dispatch(Action.UPDATE_CUSTOMER_ADDRESS, {data, index: 0});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch setDiscount with amount', () => {
    const data = {
      amount: 10,
      discountDescription: 'any discountDescription',
      type: 'any type',
    };
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
      },
      type: ActionType.SET_DISCOUNT,
    };
    cart.dispatch(Action.SET_DISCOUNT, {data});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch setDiscount with code', () => {
    const data = {
      discountCode: 'TEST',
    };
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
      },
      type: ActionType.SET_DISCOUNT,
    };
    cart.dispatch(Action.SET_DISCOUNT, {data});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch removeDiscount', () => {
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        id: cart.id,
      },
      type: ActionType.REMOVE_DISCOUNT,
    };
    cart.dispatch(Action.REMOVE_DISCOUNT);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch setProperties', () => {
    const data = {
      foo: 'bar',
      hello: 'moto',
    };
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
      },
      type: ActionType.SET_PROPERTIES,
    };
    cart.dispatch(Action.SET_PROPERTIES, {data});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch removeProperties', () => {
    const data = ['foo', 'hello'];
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
      },
      type: ActionType.REMOVE_PROPERTIES,
    };
    cart.dispatch(Action.REMOVE_PROPERTIES, {data});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch clear cart', () => {
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        id: cart.id,
      },
      type: ActionType.CLEAR,
    };
    cart.dispatch(Action.CLEAR);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch addLineItem', () => {
    const data = {
      price: 10,
      quantity: 1,
      title: 'addLineItem',
    };
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
      },
      type: ActionType.ADD_LINE_ITEM,
    };
    cart.dispatch(Action.ADD_LINE_ITEM, {data});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch updateLineItem', () => {
    const data = {
      quantity: 1,
    };
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
        index: 1,
      },
      type: ActionType.UPDATE_LINE_ITEM,
    };
    cart.dispatch(Action.UPDATE_LINE_ITEM, {data, index: 1});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch removeLineItem', () => {
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        id: cart.id,
        index: 1,
      },
      type: ActionType.REMOVE_LINE_ITEM,
    };
    cart.dispatch(Action.REMOVE_LINE_ITEM, {index: 1});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch setLineItemDiscount', () => {
    const data = {
      amount: 10,
      discountDescription: 'any discountDescription',
      type: 'any type',
    };
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
        index: 1,
      },
      type: Types.ActionType.SET_LINE_ITEM_DISCOUNT,
    };
    cart.dispatch(Action.SET_LINE_ITEM_DISCOUNT, {data, index: 1});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch removeLineItemDiscount', () => {
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        id: cart.id,
        index: 1,
      },
      type: ActionType.REMOVE_LINE_ITEM_DISCOUNT,
    };
    cart.dispatch(Action.REMOVE_LINE_ITEM_DISCOUNT, {index: 1});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch setLineItemProperties', () => {
    const data = {
      foo: 'bar',
      hello: 'moto',
    };
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
        index: 1,
      },
      type: ActionType.SET_LINE_ITEM_PROPERTIES,
    };
    cart.dispatch(Action.SET_LINE_ITEM_PROPERTIES, {data, index: 1});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatch removeLineItemProperties', () => {
    const data = ['foo', 'bar'];
    const cart = new Cart(app);
    const expectedAction = {
      group: 'Cart',
      payload: {
        data,
        id: cart.id,
        index: 1,
      },
      type: ActionType.REMOVE_LINE_ITEM_PROPERTIES,
    };
    cart.dispatch(Action.REMOVE_LINE_ITEM_PROPERTIES, {data, index: 1});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });
});

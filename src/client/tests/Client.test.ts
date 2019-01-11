import {forEachInEnum} from '../../actions/helper';
import {ActionType as ErrorActionType} from '../../actions/Error/types';
import {app as printApp} from '../../actions/Print';
import {MessageTransport} from '../../MessageTransport';
import * as MessageTransportModule from '../../MessageTransport';
import * as redirect from '../redirect';
import Hooks from '../Hooks';

import createAppDefault, {
  createAppWrapper,
  createClientApp,
  getShopOrigin,
  getUrlParams,
} from '../Client';
import {LifecycleHook} from '../types';

jest.mock('../print');

jest.mock('../../actions/validator', () => ({
  validatedAction: (action: any) => action,
}));

const print = require('../print');

const mockMessageTransport = (): MessageTransport => ({
  dispatch: jest.fn(),
  hostFrame: null,
  localOrigin: 'https://example.com',
  subscribe: jest.fn(),
});

describe('Client', () => {
  let mockFromWindow;
  beforeEach(() => {
    mockFromWindow = jest.fn();
    jest.mock('../../MessageTransport', () => ({
      fromWindow: mockFromWindow,
    }));
  });

  describe('default export', () => {
    it(' returns a function', () => {
      expect(typeof createAppWrapper({} as any)).toBe('function');
    });

    it('calls fromWindow with the top window and the current window origin', () => {
      const spy = jest.spyOn(MessageTransportModule, 'fromWindow');
      createAppDefault({apiKey: '123', shopOrigin: 'shop1.myshopify.io'});
      expect(spy).toHaveBeenCalledWith(window.top, window.location.origin);
    });

    it('calls to create hooks', () => {
      const app = createAppDefault({apiKey: '123', shopOrigin: 'shop1.myshopify.io'});
      expect(app.hooks).toBeInstanceOf(Hooks);
    });

    it('throws an error if window is undefined', () => {
      jest.spyOn(redirect, 'getWindow').mockReturnValueOnce(undefined);
      expect(() => createAppDefault({apiKey: '123', shopOrigin: 'shop1.myshopify.io'})).toThrow();
    });

    it('throws an error if shopOrigin is missing', () => {
      expect(() => createAppDefault({apiKey: '123', shopOrigin: null})).toThrowError(
        'APP::ERROR::INVALID_CONFIG: shopOrigin must be provided',
      );
    });

    it('throws an error if apiKey is missing', () => {
      expect(() => createAppDefault({apiKey: null, shopOrigin: 'shop1.myshopify.io'})).toThrowError(
        'APP::ERROR::INVALID_CONFIG: apiKey must be provided',
      );
    });
  });

  describe('createAppWrapper', () => {
    it('calls fromWindow with the given window and the current window origin', () => {
      const contentWindow = {} as any;
      const spy = jest.spyOn(MessageTransportModule, 'fromWindow');
      createAppWrapper(contentWindow);

      expect(spy).toHaveBeenCalledWith(contentWindow, window.location.origin);
    });

    it('calls fromWindow with the given window and origin', () => {
      const contentWindow = {} as any;
      const spy = jest.spyOn(MessageTransportModule, 'fromWindow');
      createAppWrapper(contentWindow, 'https://example.com');
      expect(spy).toHaveBeenCalledWith(contentWindow, 'https://example.com');
    });

    it('calls to create hooks with provided middlewares', () => {
      const middleware1 = jest.fn();
      const middleware2 = jest.fn();
      const app = createAppWrapper({} as Window, 'https://example.com', [middleware1, middleware2])(
        {
          apiKey: '123',
          shopOrigin: 'shop1.myshopify.io',
        },
      );

      expect(app.hooks).toBeInstanceOf(Hooks);

      expect(middleware1).toHaveBeenCalledWith(app.hooks, app);
      expect(middleware2).toHaveBeenCalledWith(app.hooks, app);
    });

    it('throws an error if window.location is undefined and localOrigin is not provided', () => {
      const contentWindow = {} as any;
      jest.spyOn(redirect, 'getLocation').mockReturnValueOnce(undefined);
      expect(() => createAppWrapper(contentWindow)).toThrow();
    });
  });

  describe('redirects', () => {
    let clientConfig;
    let redirectSpy;

    beforeEach(() => {
      clientConfig = {
        apiKey: 'foobar',
        forceRedirect: true,
        shopOrigin: 'shop1.myshopify.io',
      };
      redirectSpy = jest.spyOn(redirect, 'redirect').mockImplementation(jest.fn());
    });

    afterEach(() => {
      redirectSpy.mockRestore();
    });

    it('redirects if window is equivalent to host frame and `forceRedirect` is true', () => {
      const messageTransport = mockMessageTransport();
      messageTransport.hostFrame = window;
      createClientApp(messageTransport)(clientConfig);
      expect(redirectSpy).toHaveBeenCalledWith('https://shop1.myshopify.io/admin/apps/foobar/');
    });

    it('does not redirect if window is equivalent to host frame and `forceRedirect` is false', () => {
      const messageTransport = mockMessageTransport();
      messageTransport.hostFrame = window;
      createClientApp(messageTransport)({...clientConfig, forceRedirect: false});

      expect(redirectSpy).not.toHaveBeenCalled();
    });

    it('does not redirect if window is not equivalent to host frame', () => {
      const messageTransport = mockMessageTransport();
      messageTransport.hostFrame = {} as Window;
      createClientApp(messageTransport)(clientConfig);

      expect(redirectSpy).not.toHaveBeenCalled();
    });

    it('does not redirect if apiKey and shopOrigin is missing', () => {
      const messageTransport = mockMessageTransport();
      messageTransport.hostFrame = window;
      expect(() => createClientApp(messageTransport)({forceRedirect: true})).toThrow();
      expect(redirect.redirect).not.toHaveBeenCalled();
    });

    it('does not redirect if location is undefined', () => {
      const messageTransport = mockMessageTransport();
      messageTransport.hostFrame = window;

      jest.spyOn(redirect, 'getLocation').mockReturnValueOnce(undefined);

      createClientApp(messageTransport)(clientConfig);

      expect(redirectSpy).not.toHaveBeenCalled();
    });
  });

  describe('createClientApp', function() {
    let app;
    let config;
    let transport;

    beforeEach(() => {
      config = {apiKey: 'fifty', shopOrigin: 'shop1.myshopify.io'};
      transport = mockMessageTransport();

      app = createClientApp(transport)(config, {});
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('subscribes to events on the given transport', function() {
      expect(transport.subscribe).toHaveBeenCalledTimes(1);
    });

    it('dispatches an given action on the transport with source included', function() {
      app.dispatch('hi');
      expect(transport.dispatch).toHaveBeenCalledWith({
        payload: 'hi',
        source: config,
        type: 'dispatch',
      });
    });

    it('calls local handlers when dispatching an action', function() {
      const handler = jest.fn();
      const event = {
        data: {
          payload: {
            payload: 'lasagna',
            type: 'pasta',
          },
          type: 'dispatch',
        },
      };

      app.subscribe(handler);

      app.dispatch('hi');

      expect(handler).toHaveBeenCalledWith('hi');
    });

    it('asynchronously returns the application’s state and includes the source in the request', function() {
      const event = {
        data: {
          payload: 'hi',
          type: 'getState',
        },
      };

      expect(app.getState()).resolves.toEqual('hi');
      expect(transport.dispatch).toHaveBeenCalledWith({
        payload: undefined,
        source: config,
        type: 'getState',
      });

      transport.subscribe.mock.calls[0][0](event);
    });

    it('calls all subscribed handlers when actions are received', function() {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const event = {
        data: {
          payload: {
            payload: 'lasagna',
            type: 'pasta',
          },
          type: 'dispatch',
        },
      };

      app.subscribe(handler1);
      app.subscribe(handler2);

      transport.subscribe.mock.calls[0][0](event);

      expect(handler1).toHaveBeenCalledWith(event.data.payload);
      expect(handler2).toHaveBeenCalledWith(event.data.payload);
    });

    it('does not call unsubscribed handlers when actions are received', function() {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      const event = {
        data: {
          payload: {
            payload: 'ditali',
            type: 'pasta',
          },
          type: 'dispatch',
        },
      };

      app.subscribe(handler1);
      const unsubscribe = app.subscribe(handler2);
      app.subscribe(handler3);

      unsubscribe();
      transport.subscribe.mock.calls[0][0](event);

      expect(handler1).toHaveBeenCalledWith(event.data.payload);
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalledWith(event.data.payload);
    });

    it('calls all subscribed handlers for specific actions when those actions are received', function() {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const event = {
        data: {
          payload: {
            payload: 'rigatoni',
            type: 'pasta',
          },
          type: 'dispatch',
        },
      };

      app.subscribe('pasta', handler1);
      app.subscribe('zuppa', handler2);

      transport.subscribe.mock.calls[0][0](event);

      expect(handler1).toHaveBeenCalledWith('rigatoni');
      expect(handler2).not.toHaveBeenCalled();
    });

    it('does not call unsubscribed handlers for specific actions when those actions are received', function() {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const event = {
        data: {
          payload: {
            payload: 'fusili',
            type: 'pasta',
          },
          type: 'dispatch',
        },
      };

      app.subscribe('pasta', handler1);
      const unsubscribe = app.subscribe('pasta', handler2);

      unsubscribe();

      transport.subscribe.mock.calls[0][0](event);

      expect(handler1).toHaveBeenCalledWith('fusili');
      expect(handler2).not.toHaveBeenCalled();
    });

    it('calls handler with specific id and generic handler when action with id is received', function() {
      const id = '1234';
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      const payload = {
        id,
        item: 'rigatoni',
      };
      const event = {
        data: {
          payload: {
            payload,
            type: 'pasta',
          },
          type: 'dispatch',
        },
      };

      app.subscribe('pasta', handler1, id);
      app.subscribe('pasta', handler2);
      app.subscribe('zuppa', handler3);

      transport.subscribe.mock.calls[0][0](event);

      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).toHaveBeenCalledWith(payload);
      expect(handler3).not.toHaveBeenCalled();
    });

    it('calls to throw an error when no subscriptions exist for error action', function() {
      const event = {
        data: {
          payload: {
            payload: 'fusili',
            type: ErrorActionType.INVALID_ACTION,
          },
          type: 'dispatch',
        },
      };

      expect(() => transport.subscribe.mock.calls[0][0](event)).toThrow(
        new RegExp(ErrorActionType.INVALID_ACTION),
      );
    });

    it('calls error handler for specific error action when that error action is received', function() {
      const invalidActionHandler = jest.fn();
      const event = {
        data: {
          payload: {
            payload: 'fusili',
            type: ErrorActionType.INVALID_ACTION,
          },
          type: 'dispatch',
        },
      };

      app.subscribe(ErrorActionType.INVALID_ACTION, invalidActionHandler);
      expect(() => transport.subscribe.mock.calls[0][0](event)).not.toThrow();

      expect(invalidActionHandler).toHaveBeenCalledWith(event.data.payload.payload);
    });

    it('when given an id, calls only error handler with specific id and generic handler when that error action is received', function() {
      const id = '1234';
      const id2 = '5678';
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      const payload = {
        id,
        item: 'rigatoni',
      };
      const event = {
        data: {
          payload: {
            payload,
            type: ErrorActionType.INVALID_ACTION,
          },
          type: 'dispatch',
        },
      };

      app.subscribe(ErrorActionType.INVALID_ACTION, handler1, id);
      app.subscribe(ErrorActionType.INVALID_ACTION, handler2, id2);
      app.subscribe(ErrorActionType.INVALID_ACTION, handler3);

      transport.subscribe.mock.calls[0][0](event);

      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalledWith(payload);
    });

    it('calls error handler for all errors when subscriptions to error actions are created using app.error', function() {
      const errorHandler = jest.fn();
      app.error(errorHandler);

      forEachInEnum(ErrorActionType, errorType => {
        const event = {
          data: {
            payload: {
              payload: 'fusili',
              type: errorType,
            },
            type: 'dispatch',
          },
        };

        errorHandler.mockClear();
        transport.subscribe.mock.calls[0][0](event);

        expect(errorHandler).toHaveBeenCalledWith(event.data.payload.payload);
      });
    });

    it('calls error handler with specific id  when subscriptions to error actions are created using app.error', function() {
      const id = '1234';

      const payload = {
        id,
        item: 'rigatoni',
      };
      const errorHandler = jest.fn();
      const errorHandler2 = jest.fn();

      app.error(errorHandler, id);
      app.error(errorHandler2);

      forEachInEnum(ErrorActionType, errorType => {
        const event = {
          data: {
            payload: {
              payload,
              type: errorType,
            },
            type: 'dispatch',
          },
        };
        errorHandler.mockClear();
        errorHandler2.mockClear();
        transport.subscribe.mock.calls[0][0](event);

        expect(errorHandler).toHaveBeenCalledWith(payload);
        expect(errorHandler2).toHaveBeenCalledWith(payload);
      });
    });

    it('usubscribes error handler from all errors', function() {
      const errorHandler = jest.fn();
      const unsubscribe = app.error(errorHandler);

      unsubscribe();

      forEachInEnum(ErrorActionType, errorType => {
        const event = {
          data: {
            payload: {
              payload: {
                id: 1234,
                item: 'fusili',
              },
              type: errorType,
            },
            type: 'dispatch',
          },
        };
        errorHandler.mockClear();

        expect(() => transport.subscribe.mock.calls[0][0](event)).toThrow();

        expect(errorHandler).not.toHaveBeenCalled();
      });
    });

    it('calls handleAppPrint on print action', () => {
      app.dispatch(printApp());

      setTimeout(() => {
        expect(print.handleAppPrint).toHaveBeenCalledWith(app);
      });
    });

    it('calls DispatchAction hook and return the action when dispatching an action', () => {
      const action = {type: 'EAT', payload: {food: 'sushi'}};
      const hookRunSpy = jest.spyOn(app.hooks, 'run');
      const dispatchedAction = app.dispatch(action);

      expect(hookRunSpy).toHaveBeenCalledWith(
        LifecycleHook.DispatchAction,
        expect.any(Function),
        app,
        action,
      );

      expect(dispatchedAction).toBe(action);
    });

    it('returns the action when dispatching an action without hooks', () => {
      const action = {type: 'EAT', payload: {food: 'sushi'}};
      app.hooks = null;
      const dispatchedAction = app.dispatch(action);
      expect(dispatchedAction).toBe(action);
    });
  });

  it('getShopOrigin returns the shop URL param', () => {
    jest
      .spyOn(redirect, 'getLocation')
      .mockReturnValueOnce({search: '?shop=pet.myshopify.com&pets=cat'});
    expect(getShopOrigin()).toEqual('pet.myshopify.com');
  });

  it('getUrlParams returns decoded URL params', () => {
    jest.spyOn(redirect, 'getLocation').mockReturnValueOnce({
      search:
        '?shop=pet.myshopify.com&pets=cat%20and%20dog&link=http%3A%2F%2Fexample.com&other%20animals=snake%26otter',
    });

    const expectedObj = {
      link: 'http://example.com',
      pets: 'cat and dog',
      shop: 'pet.myshopify.com',
    };
    expectedObj['other animals'] = 'snake&otter';

    expect(getUrlParams()).toEqual(expectedObj);
  });

  it('getUrlParams returns an empty object when window location is not defined', () => {
    jest.spyOn(redirect, 'getLocation').mockReturnValueOnce(undefined);
    expect(getUrlParams()).toEqual({});
  });
});

import {Group} from '../actions';
import {findMatchInEnum, forEachInEnum} from '../actions/helper';
import {throwError, ActionType as ErrorTypes, fromAction, AppActionType} from '../actions/Error';
import {ActionType as PrintActionType} from '../actions/Print';
import {fromWindow} from '../MessageTransport';
import {addAndRemoveFromCollection} from '../util/collection';
import {isDevelopmentClient} from '../util/env';
import {handleAppPrint} from './print';
import {getLocation, getWindow, redirect, shouldRedirect} from './redirect';
import {
  ActionListener,
  ActionListenersMap,
  AppConfig,
  AppMiddleware,
  ClientApplication,
  ClientApplicationCreator,
  ClientApplicationTransportInjector,
  Handler,
  HandlerData,
  LifecycleHook,
  Params,
  Unsubscribe,
} from './types';
import Hooks from './Hooks';

const WINDOW_UNDEFINED_MESSAGE =
  'window is not defined. Running an app outside a browser is not supported';

function redirectHandler(hostFrame: Window, config: AppConfig) {
  const {apiKey, shopOrigin, forceRedirect = !isDevelopmentClient} = config;
  const location = getLocation();
  if (!location) {
    return;
  }
  if (forceRedirect && shouldRedirect(hostFrame) && apiKey && shopOrigin) {
    const url = `https://${shopOrigin}/admin/apps/${apiKey}${location.pathname}${location.search ||
      ''}`;
    redirect(url);
  }
}

function appSetUp(app: ClientApplication<any>) {
  app.subscribe(PrintActionType.APP, handleAppPrint);
}

/**
 * Extracts the query parameters from the current URL.
 * @deprecated This function has been deprecated.
 * @public
 */
export function getUrlParams() {
  const params: Params = {};
  const location = getLocation();

  if (!location) {
    return params;
  }

  const hashes = location.search.slice(location.search.indexOf('?') + 1).split('&');

  return hashes.reduce((acc, hash) => {
    const [key, val] = hash.split('=');

    return {
      ...acc,
      [decodeURIComponent(key)]: decodeURIComponent(val),
    };
  }, params);
}

/**
 * Extracts the `shop` query parameter from the current URL.
 * @deprecated This function has been deprecated, see {@link https://help.shopify.com/api/embedded-apps/shop-origin}
 * @public
 */
export function getShopOrigin() {
  const params = getUrlParams();

  return params.shop;
}

/**
 * @internal
 */
export const createClientApp: ClientApplicationTransportInjector = (
  transport,
  middlewares = [],
) => {
  const getStateListeners: Function[] = [];
  const listeners: ActionListener[] = [];
  const actionListeners: ActionListenersMap = {};

  const invokeCallbacks = (type: string, payload?: any) => {
    let hasCallback = false;
    if (actionListeners.hasOwnProperty(type)) {
      for (const listener of actionListeners[type]) {
        const {id, callback} = listener;
        const matchId = payload && payload.id === id;
        if (matchId || !id) {
          callback(payload);
          hasCallback = true;
        }
      }
    }
    if (hasCallback) {
      return;
    }
    // Throw an error if there are no subscriptions to this error
    const errorType = findMatchInEnum(ErrorTypes, type);
    if (errorType) {
      throwError(errorType, payload);
    }
  };

  const handler: Handler = (event: HandlerData) => {
    const action = event.data;

    switch (action.type) {
      case 'getState':
        const resolvers = getStateListeners.splice(0);
        resolvers.forEach(resolver => resolver(action.payload));
        break;

      case 'dispatch':
        const {payload} = action;
        invokeCallbacks(payload.type, payload.payload);
        listeners.forEach(listener => listener.callback(payload));
        break;

      default:
      // Silently swallow unknown actions
    }
  };

  transport.subscribe(handler);

  return (config: AppConfig /*initialState*/) => {
    if (!config.shopOrigin) {
      throw fromAction('shopOrigin must be provided', AppActionType.INVALID_CONFIG);
    }

    if (!config.apiKey) {
      throw fromAction('apiKey must be provided', AppActionType.INVALID_CONFIG);
    }

    redirectHandler(transport.hostFrame, config);

    const dispatch = <A>(action: A) => {
      const augmentedAction = {
        payload: action,
        source: config,
        type: 'dispatch',
      };

      handler({data: augmentedAction});
      transport.dispatch(augmentedAction);

      return action;
    };

    const hooks = new Hooks();
    const app: ClientApplication<any> = {
      localOrigin: transport.localOrigin,

      hooks,

      dispatch<A>(action: A) {
        if (!app.hooks) {
          return dispatch(action);
        }
        return app.hooks.run(LifecycleHook.DispatchAction, dispatch, app, action);
      },

      featuresAvailable(features?: Group[]) {
        return app.getState('features').then(state => {
          if (features) {
            Object.keys(state).forEach(feature => {
              if (!features.includes(feature as Group)) {
                delete state[feature];
              }
            });
          }

          return state;
        });
      },

      getState(query?: string) {
        return new Promise<any>(resolve => {
          getStateListeners.push(resolve);
          transport.dispatch({
            payload: undefined,
            source: config,
            type: 'getState',
          });
        }).then((state: any) => {
          if (query) {
            return query.split('.').reduce((value, key) => {
              if (typeof state !== 'object' || Array.isArray(state)) {
                return undefined;
              }
              value = state[key];
              state = value;

              return value;
            }, undefined);
          }

          return state;
        });
      },

      subscribe() {
        if (arguments.length < 2) {
          return addAndRemoveFromCollection(listeners, {callback: arguments[0]});
        }

        const eventNameSpace = arguments[0];
        const callback = arguments[1];
        const id = arguments[2];
        const actionCallback: ActionListener = {callback, id};
        if (!actionListeners.hasOwnProperty(eventNameSpace)) {
          actionListeners[eventNameSpace] = [];
        }

        return addAndRemoveFromCollection(actionListeners[eventNameSpace], actionCallback);
      },

      error(listener, id?) {
        const unsubscribeCb: Unsubscribe[] = [];
        forEachInEnum(ErrorTypes, eventNameSpace => {
          // tslint:disable-next-line:no-invalid-this
          unsubscribeCb.push(this.subscribe(eventNameSpace, listener, id));
        });

        return () => {
          unsubscribeCb.forEach(unsubscribe => unsubscribe());
        };
      },
    };

    for (const middleware of middlewares) {
      middleware(hooks, app);
    }

    appSetUp(app);

    return app;
  };
};

/**
 * @public
 */
export function createAppWrapper(
  frame: Window,
  localOrigin?: string,
  middleware: AppMiddleware[] = [],
): ClientApplicationCreator {
  if (!frame) {
    throw fromAction(WINDOW_UNDEFINED_MESSAGE, AppActionType.WINDOW_UNDEFINED);
  }

  const location = getLocation();
  const origin = localOrigin || (location && location.origin);

  if (!origin) {
    throw fromAction('local origin cannot be blank', AppActionType.MISSING_LOCAL_ORIGIN);
  }

  const transport = fromWindow(frame, origin);
  const appCreator = createClientApp(transport, middleware);

  return appCreator;
}

/**
 * Creates your application instance.
 * @param config - Both `apiKey` and `shopOrigin` are required.
 * @remarks
 * You will need to store `shopOrigin` during the authentication process and then retrieve it for the code to work properly. To learn more about this process, see {@link https://help.shopify.com/api/embedded-apps/shop-origin | Getting and storing the shop origin}.
 * @public
 */
export function createApp(config: AppConfig): ClientApplication<any> {
  const currentWindow = getWindow();

  if (!currentWindow) {
    throw fromAction(WINDOW_UNDEFINED_MESSAGE, AppActionType.WINDOW_UNDEFINED);
  }

  return createAppWrapper(currentWindow.top)(config);
}

/**
 * {@inheritdocs createApp}
 * @public
 */
export default createApp;

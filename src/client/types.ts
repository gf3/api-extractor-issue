import {
  ActionCallback,
  ActionSetInterface,
  ActionSetOptions,
  AnyAction,
  Dispatch,
  ErrorSubscriber,
  Group,
  MetaAction,
  Unsubscribe,
} from '../actions/types';
import {Handler, HandlerData, MessageTransport} from '../MessageTransport';

/**
 * @public
 */
export interface AppConfig {
  apiKey: string;
  shopOrigin: string;
  forceRedirect?: boolean;
}

/**
 * @internal
 */
export interface FeaturesAction {
  [key: string]: boolean;
}

/**
 * @internal
 */
export type FeaturesAvailable = {[key in Group]?: FeaturesAction};

/**
 * Application instance, required for use with actions.
 * @public
 */
export interface ClientApplication<S> {
  dispatch: Dispatch<AnyAction>;
  localOrigin: string;
  error: ErrorSubscriber;
  hooks?: HooksInterface;
  getState(query?: string): Promise<S>;
  featuresAvailable(features?: Group[]): Promise<FeaturesAvailable>;
  subscribe(callback: ActionCallback, id?: string): Unsubscribe;
  subscribe(eventNameSpace: string, callback: ActionCallback, id?: string): Unsubscribe;
}

/**
 * @internal
 */
export interface ClientApplicationCreator {
  <S>(config: AppConfig, initialState?: S): ClientApplication<S>;
}

/**
 * @internalremarks
 * TODO: Generalize—pramaterize return type
 * @internal
 */
export interface ClientApplicationTransportInjector {
  (transport: MessageTransport, middleware?: AppMiddleware[]): ClientApplicationCreator;
}

/**
 * @internal
 */
export interface ActionListenersMap {
  [index: string]: ActionListener[];
}

/**
 * @internal
 */
export interface ActionListener {
  id?: string;
  callback(data: any): void;
}

/**
 * @internal
 */
export interface TransportDispatch {
  type: 'getState' | 'dispatch';
  source: AppConfig;
  payload?: AnyAction;
}

/**
 * @deprecated Not to be used, there is no replacement.
 * @internal
 */
export interface Params {
  [key: string]: string;
}

/**
 * @internal
 */
export enum LifecycleHook {
  UpdateAction = 'UpdateAction',
  DispatchAction = 'DispatchAction',
}

/**
 * @internal
 */
export interface Hook {
  handler: LifecycleHandler;
  remove: Unsubscribe;
}

/**
 * @internal
 */
export interface HookMap {
  [key: string]: Hook[];
}

/**
 * @internal
 */
export interface HooksInterface {
  set(hook: LifecycleHook.UpdateAction, handler: UpdateActionHook): any;
  set(hook: LifecycleHook.DispatchAction, handler: DispatchActionHook): any;
  set(hook: LifecycleHook, handler: LifecycleHandler): any;
  get(hook: LifecycleHook): LifecycleHandler[] | undefined;
  run<C>(hook: LifecycleHook, final: Function, context: C, ...arg: any[]): any;
}

/**
 * @internal
 */
export interface AppMiddleware {
  (hooks: HooksInterface, app: ClientApplication<any>): void;
}

/**
 * @internal
 */
export interface LifecycleHandler {
  (next: Function): (...args: any[]) => any;
}

/**
 * @internal
 */
export interface UpdateActionHandler {
  <O>(this: ActionSetInterface & ActionSetOptions<O>, options: O): any;
}

/**
 * @internal
 */
export interface UpdateActionHook {
  (next: Function): UpdateActionHandler;
}

/**
 * @internal
 */
export interface DispatchActionHandler {
  <A extends MetaAction>(this: ClientApplication<any>, action: A): any;
}

/**
 * @internal
 */
export interface DispatchActionHook {
  (next: Function): DispatchActionHandler;
}

export {AnyAction, Dispatch, Handler, HandlerData, Unsubscribe};

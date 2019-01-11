import {ClientApplication} from '../client';
import {ActionSet} from './helper';
import {ErrorAction} from './Error/actions';

/**
 * Various action groups.
 * @public
 */
export enum Group {
  Button = 'Button',
  ButtonGroup = 'ButtonGroup',
  Camera = 'Camera',
  Cart = 'Cart',
  Error = 'Error',
  Features = 'Features',
  Toast = 'Toast',
  Loading = 'Loading',
  Modal = 'Modal',
  Navigation = 'Navigation',
  Print = 'Print',
  TitleBar = 'TitleBar',
  ResourcePicker = 'Resource_Picker',
}

/**
 * @internal
 */
export enum ComponentType {
  Button = 'Button',
  ButtonGroup = 'ButtonGroup',
}

/**
 * Base action interface.
 * @remarks
 * All action implementations should inherit from this interface.
 * @internalremarks
 * Should we remove the extraProps definition here, pushing it on sub-types?
 * @public
 */
export interface AnyAction {
  type: any;
  [extraProps: string]: any;
}

/**
 * @public
 */
export interface MetaAction extends AnyAction {
  readonly version: string;
  readonly group: string;
  readonly type: string;
  payload?: any;
}

/**
 * @public
 */
export interface ClickAction extends MetaAction {
  payload: {
    id: string;
    payload?: any;
  };
}

/**
 * @public
 */
export interface ActionCallback {
  (data: any): void;
}

/**
 * @public
 */
export interface ErrorCallback {
  (data: ErrorAction): void;
}

/**
 * @public
 */
export interface UpdateSubscribe {
  (group: string, subgroups: string[]): void;
}

/**
 * @public
 */
export interface Unsubscribe {
  (): void;
}

/**
 * @public
 */
export interface ErrorSubscriber {
  (callback: ErrorCallback): Unsubscribe;
}

/**
 * @internal
 */
export interface ActionSubscription {
  component: Component;
  eventType: string;
  callback: ActionCallback;
  unsubscribe: Unsubscribe;
  updateSubscribe: UpdateSubscribe;
}

/**
 * @internal
 */
export interface UpdateSubscription {
  (subscriptionToRemove: ActionSubscription, group: string, subgroups: string[]): void;
}

/**
 * @public
 */
export interface Component {
  readonly id: string;
  readonly type: string;
  subgroups?: string[];
}

/**
 * @public
 */
export interface ActionSetInterface extends Component {
  readonly app: ClientApplication<any>;
  readonly defaultGroup: string;
  group: string;
  component: Component;
  subscriptions: ActionSubscription[];
  updateSubscription: UpdateSubscription;
  error: ErrorSubscriber;
  subscribe(
    eventName: string,
    callback: ActionCallback,
    component?: Component,
    currentIndex?: number,
  ): Unsubscribe;
  unsubscribe(resetOnly: boolean): ActionSetInterface;
}

/**
 * @public
 */
export interface DispatchAction {
  type: string;
  payload: any;
}

/**
 * @public
 */
export interface SimpleDispatch {
  dispatch(action: string): ActionSet;
}

/**
 * @public
 */
export interface ComplexDispatch<P> {
  dispatch(action: string, payload: P): ActionSet;
}

/**
 * @public
 */
export interface ActionSetProps<T, P> extends SimpleDispatch {
  options: T;
  payload: P;
  set(options: Partial<T>): ActionSet;
}

/**
 * @public
 */
export interface ActionSetPayload<P> extends SimpleDispatch {
  payload: P;
}

/**
 * @public
 */
export interface ActionSetOptions<T> {
  options: T;
  set(options: Partial<T>): ActionSet;
}

/**
 * @public
 */
export interface Dispatch<_> {
  <A extends AnyAction>(action: A): A;
}

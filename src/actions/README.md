# Actions

Shopify App Bridge introduces a new concept of actions. An action provides a way for applications and hosts to trigger events with a statically-typed payload. The following actions are currently supported:

* [Button](./Button)
* [ButtonGroup](./ButtonGroup)
* [Cart](./Cart)
* [Error](./Error)
* [Flash](./Flash)
* [Loading](./Loading)
* [Modal](./Modal)
* [Navigation - History](./Navigation/History)
* [Navigation - Redirect](./Navigation/Redirect)
* [ResourcePicker](./ResourcePicker)
* [TitleBar](./TitleBar)
* [Toast](./Toast)

## Simple actions

Simple actions can be dispatched by both hosts and apps. Hosts can subscribe to actions through the App Bridge middleware. Here is an example of a simple action:

### In an app

An app can dispatch actions:

```ts
import createApp from '@shopify/app-bridge';
import {Redirect} from '@shopify/app-bridge/actions';

const app = createApp({
  apiKey: '12345',
});

// App dispatches a remote redirect action
app.dispatch(
  Redirect.toRemote({
    url: 'http://example.com',
  }),
);
```

### In a host using a Redux store

A Redux store can dispatch and listen to actions:

```ts
import {Redirect} from '@shopify/app-bridge/actions';
import {createStore, AnyAction} from 'redux';

interface AppStore {
  title: string;
}

function app(state: AppStore, action: Redirect.RemoteAction | AnyAction): AppStore {
  switch (action.type) {
    case Redirect.ActionType.REMOTE:
      const payload = (action as Redirect.RemoteAction).payload;
      //Set the window.location.href to the URL in the payload
      window.location.href = payload.url;

      return state;
    default:
      return state;
  }
}

const store = createStore(app);

// Dispatch the remote redirect action
store.dispatch(
  Redirect.toRemote({
    url: 'http://example.com',
  }),
);
```

## Action sets

Action sets are groups of simple actions that are created and used only by apps. They are generated with a unique ID, and provide the additional capability for apps to subscribe directly to them. They can be thought of as a persisted set of actions that can be dispatched or subscribed to at any time.

The following examples show the [toast](./src/actions/Toast) action set in an app and in a host using a Redux store.

### In an app

```ts
import createApp from '@shopify/app-bridge';
import {Toast} from '@shopify/app-bridge/actions';

const app = createApp({
  apiKey: '12345',
});

const toastOptions = {
  message: 'Product saved',
  duration: 5000,
};

const toastNotice = Toast.create(app, toastOptions);
toastNotice.subscribe(Toast.Action.SHOW, data => {
  // Do something with the show action
});

toastNotice.subscribe(Toast.Action.CLEAR, data => {
  // Do something with the clear action
});

// Dispatch the show toast action, using the toastOptions above
toastNotice.dispatch(Toast.Action.SHOW);
```

### In a host using a Redux store

Hosts can dispatch actions that are tied to a specific instance by including the unique ID:

```ts
import {Toast} from '@shopify/app-bridge/actions';
import { createStore, AnyAction } from 'redux'

interface ToastMessage {
  id: string;
  content: string;
}
interface AppStore {
  toastMessage?: ToastMessage;
}

function app(state: AppStore, action: Redirect.RemoteAction | AnyAction,
): AppStore {
  switch (action.type) {
    case Toast.ActionType.SHOW: {
      const payload = (action as Toast.ToastAction).payload;
      const {id, content} = payload;
      // Save the unique id of the Toast
      return {
        toastMessage: {
          id,
          content,
        }
        ...state,
      };
    }
    default:
      return state;
  }
}

const store = createStore(app);

// Get the current toast message in the store
const {toastMessage} = store.getState();
// Dispatching a clear action on a specific instance of the toast action
store.dispatch(
  Toast.clear({
    id: toastMessage.id,
  })
);
```

## Creating a action

Shopify App Bridge actions are similar to Redux actions. They consist of the following:

* a type
* a group
* a version
* a payload

You can use the `actionWrapper` helper method to create actions that conform to the required structure. The following example shows how to create a brand new group of actions called `Card`:

```ts
// All actions can be extended from the MetaAction interface
import {MetaAction} from '../types';
import {actionWrapper} from '../helper';

// Create a new group for this action
const GROUP = 'Card';

// Specify the actions types available in this group
export enum ActionType {
  SHOW = 'CARD::SHOW',
  HIDE = 'CARD::HIDE',
}

// Specify the actions available in this group
export enum Action {
  SHOW = 'SHOW',
  HIDE = 'HIDE',
}

// Specify the props that can be given to this action
export interface CardOptions {
  content: string;
}

// Specify the props that will be sent as a payload when an action is triggered
export interface CardPayload extends CardOptions {
  // id should always be sent
  readonly id?: string;
}

// Specify the props that will be sent as a payload when a hide action is triggered
export interface CardHidePayload {
  // id should always be sent
  readonly id?: string;
}

// Define the show action interface
export interface ShowAction extends MetaAction {
  readonly type: typeof ActionType.SHOW;
  readonly payload: CardPayload;
  readonly group: typeof GROUP;
}

// Define the hide action interface
export interface HideAction extends MetaAction {
  readonly type: typeof ActionType.CLEAR;
  readonly payload: CardHidePayload;
  readonly group: typeof GROUP;
}

// Use the actionWrapper helper method to create a show action
export function show(payload: CardPayload): ShowAction {
  /** Creates the following object:
    {
      group: 'Card',
      payload: {
        id: string,
        content: string,
      },
      type: 'CARD::SHOW',
      version: '1.0.0'
    }
   * */
  return actionWrapper({
    payload,
    group: GROUP,
    type: ActionType.SHOW,
  });
}

// Use the actionWrapper helper method to create a hide action
export function hide(payload: CardHidePayload): HideAction {
  /** Creates the following object:
    {
      group: 'Card',
      payload: {
        id: string,
      },
      type: 'CARD::HIDE',
      version: '1.0.0'
    }
   * */
  return actionWrapper({
    payload,
    group: GROUP,
    type: ActionType.HIDE,
  });
}
```

## Creating a new action set

Shopify App Bridge provides an `ActionSet` abstract class, which can be used to create new action sets. The abstract class handles the unique ID generation and logic for subscribing and unsubscribing. The action typically implements the following methods:

* `get payload`
* `get options`
* `set`
* `dispatch`

The following example shows a card action set:

```ts
// Using the CardOptions and CardPayload interface above
export class CardAction extends ActionSet implements ActionSetProps<CardOptions, CardPayload> {
  content: string;

  constructor(app: ClientApplication<any>, options: CardOptions) {
    //Set the component type and group for this action
    //The group and type can be set to the same value if this action should be the parent class
    super(app, 'Card', 'Card');
    this.set(options);
  }

  /**
   * Called when getting the props of this action
   * */
  get options(): CardOptions {
    return {
      content: this.content,
    };
  }

  /**
   * Called when getting the payload to be sent when an action is dispatched
   * */
  get payload(): CardPayload {
    return {
      id: this.id,
      ...this.options,
    };
  }
  /**
   * Called when updating the properties of this action
   * */
  set(options: CardPayload<CardOptions>) {
    // Calls a helper method to merge the new options with existing options
    const mergedOptions = getMergedProps(this.options, options);
    const {content} = mergedOptions;

    // Update options
    this.content = content;

    return this;
  }
  /**
   * Called when triggering actions
   * */
  dispatch(action: Action) {
    switch (action) {
      // Using the card actions in the example above
      case Action.SHOW:
        this.app.dispatch(show(this.payload));
        break;
      case Action.HIDE:
        this.app.dispatch(hide({id: this.id}));
        break;
      default:
    }

    return this;
  }
}
```

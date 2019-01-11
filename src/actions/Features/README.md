# Features

## Setup

Create an app and import the `Features` module from `@shopify/app-bridge/actions`. Note that we'll be referring to this sample application throughout the examples below.

```js
import createApp from '@shopify/app-bridge';
import {Features} from '@shopify/app-bridge/actions';

const app = createApp({
  apiKey: '12345',
  shopOrigin: getShopOrigin(),
});
```

## Features app

### Subscribe to Feature availablility updates:

```js
app.subscribe(Features.ActionType.UPDATE, (state: FeaturesAvailable) {
  // state will be a delta of what has changed in the store.
  // Either check the state for what has changed 
  // or call `app.featuresAvailable()` to get all available features
});
```

### App.featuresAvailable()

Calling app.featuresAvailable() returns a promise that evaluates to the entire list of available features for the app. This can be used when you want to check if a specific feature or group of features is available at any time, possibly for optional UI displaying.

```js
app.featuresAvailable().then(state => {
  // state will contain all `Group`s and `Action`s for the app.
  /* ie. The print.app action is available:
  {
    Print: {
      APP: true
    }
  } */
});
```

If you want to limit your resulting state to a subset of Groups then pass in a parameter, an array of `Group`s.

```js
app.featuresAvailable([Group.Cart]).then(state => {
  // state will contain only Cart actions
  /*
  {
    Cart: {
      FETCH: false,
      REMOVE_LINE_ITEM_PROPERTIES: false,
      ...
    }
  } */
});
```
# Camera

> This is a Pre-Release feature that only works on Point of Sale. To use this feature you must use [Point of Sale](https://github.com/Shopify/ios/tree/available-features) and enable `App Bridge` in `Store -> Settings` in the Point of Sale app. In Services Internal you must also enable the Feature Flags: `easdkv1` and `new-admin-pos`.

## Setup

Create an app and import the `Camera` module from `@shopify/app-bridge/actions`. Note that we'll be referring to this sample application throughout the examples below.

```js
import createApp from '@shopify/app-bridge';
import {Camera} from '@shopify/app-bridge/actions';

const app = createApp({
  apiKey: '12345',
});

const camera = Camera.create(app);
```

## Camera action

 Open the camera component. This will trigger a dialog to ask for Camera based permissions:

 ```js
 camera.dispatch(Camera.Action.OPEN, {
    data: {
      type: OpenType.Scan,
    }
 });
 ```

 Subscribe to Camera Capture:

 ```js
 camera.subscribe(Camera.Action.CAPTURE, payload => {
    // The payload will contain `scanData` or `imageData` depending on the type passed into the
    // `Camera.Action.OPEN` action.
 });
 ```
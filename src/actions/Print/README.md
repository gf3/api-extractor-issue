# Print

## Setup

Create an app and import the `Print` module from `@shopify/easdk/actions`. Note that we'll be referring to this sample application throughout the examples below.

```js
import createApp from '@shopify/easdk';
import {Print} from '@shopify/easdk/actions';

const app = createApp({
  apiKey: '12345',
});
```

## Print app

Open the print dialog with the content of the app:

```js
app.dispatch(Print.app());
```

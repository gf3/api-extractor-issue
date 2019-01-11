# Modal

## Setup

Create an app and import the `Modal` module from `@shopify/app-bridge/actions`. Note that we'll be referring to this sample application throughout the examples below.

```js
import createApp from '@shopify/app-bridge';
import {Modal} from '@shopify/app-bridge/actions';

const app = createApp({
  apiKey: '12345',
});
```

## Create a message modal

```js
const modalOptions = {
  title: 'My Modal',
  message: 'Hello world!',
};

const myModal = Modal.create(app, modalOptions);
```

## Create an iframe modal with an absolute url

```js
const modalOptions = {
  title: 'My Modal',
  url: 'http://example.com',
};

const myModal = Modal.create(app, modalOptions);
```

## Create an iframe modal a relative path

The iframe URL will be set to a path that's relative to your app root:

```js
const modalOptions = {
  title: 'My Modal',
  path: '/setting',
};

const myModal = Modal.create(app, modalOptions);
```

## Create a modal with footer buttons

You can attach buttons to the modal footer. To learn more about buttons, see [Button](../Button).

```js
const okButton = Button.create(app, {label: 'Ok'});
const cancelButton = Button.create(app, {label: 'Cancel'});
const modalOptions = {
  title: 'My Modal',
  message: 'Hello world!',
  footer: {
    buttons: {
      primary: okButton,
      secondary: [cancelButton],
    },
  },
};

const myModal = Modal.create(app, modalOptions);
```

## Subscribe to actions

You can subscribe to modal actions by calling `subscribe`. This returns a method that you can call to unsubscribe from the action:

```js
const modalOptions = {
  title: 'My Modal',
  url: 'http://example.com',
};

const myModal = Modal.create(app, modalOptions);

const openUnsubscribe = myModal.subscribe(Modal.Action.OPEN, () => {
  // Do something with the open event
});

const closeUnsubscribe = myModal.subscribe(Modal.Action.CLOSE, () => {
  // Do something with the close event
});

// Unsubscribe to actions
openUnsubscribe();
closeUnsubscribe();
```

## Unsubscribe

You can call `unsubscribe` to remove all subscriptions on the modal and its children (including buttons):

```js
const okButton = Button.create(app, {label: 'Ok'});
okButton.subscribe(Button.Action.CLICK, () => {
  // Do something with the click action
});
const cancelButton = Button.create(app, {label: 'Cancel'});
cancelButton.subscribe(Button.Action.CLICK, () => {
  // Do something with the click action
});
const modalOptions = {
  title: 'My Modal',
  url: 'http://example.com',
  footer: {
    buttons: {
      primary: okButton,
      secondary: [cancelButton],
    },
  },
};

const myModal = Modal.create(app, modalOptions);

myModal.subscribe(Modal.Action.OPEN, () => {
  // Do something with the open event
});

myModal.subscribe(Modal.Action.CLOSE, () => {
  // Do something with the close event
});

// Unsubscribe from modal open and close actions
// Unsubscribe from okButton and cancelButton click actions
myModal.unsubscribe();
```

## Unsubscribe from modal actions only

You can call `unsubscribe` with `false` to remove only modal subscriptions while leaving child subscriptions intact. For example, you might want to unsubscribe from the modal but keep button listeners so that the buttons can be reused in a different modal.

```js
const okButton = Button.create(app, {label: 'Ok'});
okButton.subscribe(Button.Action.CLICK, () => {
  // Do something with the click action
});
const cancelButton = Button.create(app, {label: 'Cancel'});
cancelButton.subscribe(Button.Action.CLICK, () => {
  // Do something with the click action
});

const modalOptions = {
  title: 'My Modal',
  message: 'Hello world!',
  footer: {
    buttons: {
      primary: okButton,
      secondary: [cancelButton],
    },
  },
};

const myModal = Modal.create(app, modalOptions);

// Unsubscribe only from modal open and close actions
myModal.unsubscribe(false);

// The buttons above can be reused in a new modal
// Their subscriptions will be left intact

const newModalOptions = {
  title: 'Confirm',
  message: 'Are you sure?',
  footer: {
    buttons: {
      primary: okButton,
      secondary: [cancelButton],
    },
  },
};

const confirmModal = Modal.create(app, newModalOptions);
```

## Dispatch actions

```js
const modalOptions = {
  title: 'My Modal',
  url: 'http://example.com',
};

const myModal = Modal.create(app, modalOptions);

myModal.dispatch(Modal.Action.OPEN);

// Close modal
myModal.dispatch(Modal.Action.CLOSE);
```

## Update options

You can call the `set` method with partial modal options to update the options of an existing modal. This automatically triggers the `update` action on the modal and merges the given options with the existing options.

```js
const modalOptions = {
  title: 'My Modal',
  url: 'http://example.com',
};

const myModal = Modal.create(app, modalOptions);

myModal.set({title: 'My new title'});
```

## Update footer buttons

You can update buttons attached to a modal's footer. Any updates made to the modal's children automatically trigger an `update` action on the modal:

```js
const okButton = Button.create(app, {label: 'Ok'});
const cancelButton = Button.create(app, {label: 'Cancel'});
const modalOptions = {
  title: 'My Modal',
  message: 'Hello world!',
  footer: {
    buttons: {
      primary: okButton,
      secondary: [cancelButton],
    },
  },
};

const myModal = Modal.create(app, modalOptions);
myModal.dispatch(Modal.Action.OPEN);

okButton.set({label: 'Good to go!'});
```

## Set modal size

By default, modals have a size of `small`. You can customize the size of a modal by passing in a different `Modal.Size` value:

```js
const modalOptions = {
  title: 'My Modal',
  message: 'Hello world!',
  size: Modal.Size.Large,
};

const myModal = Modal.create(app, modalOptions);
myModal.dispatch(Modal.Action.OPEN);
```

You can also set the modal size to full screen:

```js
const modalOptions = {
  title: 'My Modal',
  message: 'Hello world!',
  size: Modal.Size.Full,
};

const myModal = Modal.create(app, modalOptions);
myModal.dispatch(Modal.Action.OPEN);
```

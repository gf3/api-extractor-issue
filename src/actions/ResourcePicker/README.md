# Resource Picker

## Setup

Create an app and import the `ResourcePicker` module from `@shopify/app-bridge/actions`. Note that we'll be referring to this sample application throughout the examples below.

```js
import createApp from '@shopify/app-bridge';
import {ResourcePicker} from '@shopify/app-bridge/actions';

const app = createApp({
  apiKey: '12345',
});
```

## Create a product picker

```js
const productPicker = ResourcePicker.create(app, {
  resourceType: ResourcePicker.ResourceType.Product,
});
```

## Create a product variant picker

```js
const variantPicker = ResourcePicker.create(app, {
  resourceType: ResourcePicker.ResourceType.ProductVariant,
});
```

## Create a collection picker

```js
const collectionPicker = ResourcePicker.create(app, {
  resourceType: ResourcePicker.ResourceType.Collection,
});
```

## Picker selection and cancellation

Resource pickers have two main actions that you can subscribe to:

* `ResourcePicker.Action.CANCEL` - This action is dispatched when the user cancels the resource picker without making a selection.
* `ResourcePicker.Action.SELECT` - This action is dispatched after the user makes a selection and confirms it. This action receives a `SelectPayload` argument, which is an `Object` with `id` and `selection` keys. The `selection` key is an array of all the selected resources.

```js
const picker = ResourcePicker.create(app, {
  resourceType: ResourcePicker.ResourceType.Product,
});

picker.subscribe(ResourcePicker.Action.SELECT, ({selection}) => {
  // Do something with `selection`
});

picker.subscribe(ResourcePicker.Action.CANCEL, () => {
  // Picker was cancelled
});
```

## Options

#### initialQuery

- default value: `undefined`
- optional
- type: `string`

#### selectMultiple

- default value: `true`
- optional
- type: `boolean`

#### showHidden

- default value: `false`
- optional
- type: `boolean`

#### showVariants

- default value: `true`
- optional
- type: `string`
- note: Only applies to the `Product` resource type picker

## Subscribe to actions

You can subscribe to modal actions by calling `subscribe`. This returns a method that you can call to unsubscribe from the action:

```js
const productPicker = ResourcePicker.create(app, {
  resourceType: ResourcePicker.ResourceType.Product,
  options: {
    selectMultiple: true,
    showHidden: false,
  },
});

const selectUnsubscribe = productPicker.subscribe(ResourcePicker.Action.SELECT, ({selection}) => {
  // Do something with `selection`
});

const cancelUnsubscribe = productPicker.subscribe(ResourcePicker.Action.CANCEL, () => {
  // Picker was cancelled
});

// Unsubscribe to actions
selectUnsubscribe();
cancelUnsubscribe();
```

## Unsubscribe

You can call `unsubscribe` to remove all subscriptions on the resource picker:

```js
const productPicker = ResourcePicker.create(app, {
  resourceType: ResourcePicker.ResourceType.Product,
  options: {
    selectMultiple: true,
    showHidden: false,
  },
});

productPicker.subscribe(ResourcePicker.Action.SELECT, () => {
  // Do something with `selection`
});

productPicker.subscribe(ResourcePicker.Action.CANCEL, () => {
  // Picker was cancelled
});

// Unsubscribe from all actions
productPicker.unsubscribe();
```

## Dispatch actions

```js
const collectionPicker = ResourcePicker.create(app, {
  resourceType: ResourcePicker.ResourceType.Collection,
  options: {
    selectMultiple: true
    showHidden: false,
  }
});

// Open the collection picker
collectionPicker.dispatch(ResourcePicker.Action.OPEN);
```

## Update options

You can call the `set` method with partial picker options. This automatically triggers the `update` action on the modal and merges the given options with the existing options:

```js
const collectionPicker = ResourcePicker.create(app, {
  resourceType: ResourcePicker.ResourceType.Collection,
  options: {
    selectMultiple: true,
    showHidden: false,
  },
});

collectionPicker.set({showHidden: true});
```

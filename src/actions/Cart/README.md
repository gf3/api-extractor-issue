# Cart

## Setup

Create an app and import the `Cart` module from `@shopify/app-bridge/actions`. Note that we'll be referring to this sample application throughout the examples below.

```js
import createApp from '@shopify/app-bridge';
import {Cart} from '@shopify/app-bridge/actions';

const app = createApp({
  apiKey: '12345',
});
```

## Create a cart

Create a cart and subscribe to cart updates:

```js
const cart = Cart.create(app);
cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] cart update', payload);
});
```

## Handling error

```js
app.error((data: Error.ErrorAction) => {
  console.info('[client] Error received: ', data);
});
```

## Fetch cart

A cart needs to call fetch before receiving data in `Cart.Action.UPDATE`:

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] fetchCart', payload);
  unsubscriber();
});
cart.dispatch(Cart.fetch());
```

## Set customer

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] setCustomer', payload);
  unsubscriber();
});
cart.dispatch(
  Cart.setCustomer({
    email: 'dev@shopify.com',
    firstName: 'dev',
    id: 123,
    lastName: 'shopify',
    note: 'some note',
  }),
);
```

## Add customer address

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] addCustomerAddress', payload);
  unsubscriber();
});
cart.dispatch(
  Cart.addCustomerAddress({
    address1: 'any address1',
    address2: 'any address2',
    city: 'any city',
    company: 'any company',
    country: 'any country',
    countryCode: 'any countryCode',
    firstName: 'any firstName',
    lastName: 'any lastName',
    name: 'any name',
    phone: 'any phone',
    provice: 'any provice',
    proviceCode: 'any proviceCode',
    zip: 'any zip',
  }),
);
```

## Update customer address

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] updateCustomerAddress', payload);
  unsubscriber();
});
cart.dispatch(
  Cart.updateCustomerAddress(0, {
    address1: 'any address1',
    address2: 'any address2',
    city: 'any city',
    company: 'any company',
    country: 'any country',
    countryCode: 'any countryCode',
    firstName: 'any firstName',
    lastName: 'any lastName',
    name: 'any name',
    phone: 'any phone',
    provice: 'any provice',
    proviceCode: 'any proviceCode',
    zip: 'any zip',
  }),
);
```

## Remove customer

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] removeCustomer', payload);
  unsubscriber();
});
cart.dispatch(Cart.removeCustomer());
```

## Set discount

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] setDiscount', payload);
  unsubscriber();
});
cart.dispatch(
  Cart.setDiscount({
    amount: '1',
    discountDescription: new Date().toISOString(),
    type: 'flat',
  }),
);
```

## Remove discount

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] removeDiscount', payload);
  unsubscriber();
});
cart.dispatch(Cart.removeDiscount());
```

## Set cart properties

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] setProperties', payload);
  unsubscriber();
});
cart.dispatch(
  Cart.setProperties({
    foo: 'bar',
    hello: 'moto',
  }),
);
```

## Remove cart properties

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] removeProperties', payload);
  unsubscriber();
});
cart.dispatch(Cart.removeProperties(['foo', 'hello']));
```

## Clear cart

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] clear', payload);
  unsubscriber();
});
cart.dispatch(Cart.clear());
```

## Add line item

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] addLineItem', payload);
  unsubscriber();
});
cart.dispatch(
  Cart.addLineItem({
    price: '20',
    quantity: 1,
    title: 'Some CartLineItem title',
  }),
);
```

## Update line item

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] updateLineItem', payload);
  unsubscriber();
});
cart.dispatch(
  Cart.updateLineItem(0, {
    quantity: 100,
  }),
);
```

## Remove line item

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] removeLineItem', payload);
  unsubscriber();
});
cart.dispatch(Cart.removeLineItem(0));
```

## Set line item discount

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] setLineItemDiscount', payload);
  unsubscriber();
});
cart.dispatch(
  Cart.setLineItemDiscount(0, {
    amount: '1',
    discountDescription: 'some description',
    type: 'flat',
  }),
);
```

## Remove line item discount

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] removeLineItemDiscount', payload);
  unsubscriber();
});
cart.dispatch(Cart.removeLineItemDiscount(0));
```

## Set line item properties

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] setLineItemProperties', payload);
  unsubscriber();
});
cart.dispatch(
  Cart.setLineItemProperties(0, {
    foo: 'bar',
    hello: 'moto',
  }),
);
```

## Remove line item properties

```js
const unsubscriber = cart.subscribe(Cart.Action.UPDATE, (payload: Cart.Payload) => {
  console.log('[Client] removeLineItemProperties', payload);
  unsubscriber();
});
cart.dispatch(Cart.removeLineItemProperties(0, ['foo', 'hello']));
```

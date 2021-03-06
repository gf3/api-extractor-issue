/**
 * @module Cart
 */

export enum ActionType {
  FETCH = 'APP::CART::FETCH',
  UPDATE = 'APP::CART::UPDATE',
  SET_CUSTOMER = 'APP::CART::SET_CUSTOMER',
  REMOVE_CUSTOMER = 'APP::CART::REMOVE_CUSTOMER',
  ADD_CUSTOMER_ADDRESS = 'APP::CART::ADD_CUSTOMER_ADDRESS',
  UPDATE_CUSTOMER_ADDRESS = 'APP::CART::UPDATE_CUSTOMER_ADDRESS',
  SET_DISCOUNT = 'APP::CART::SET_DISCOUNT',
  REMOVE_DISCOUNT = 'APP::CART::REMOVE_DISCOUNT',
  SET_PROPERTIES = 'APP::CART::SET_PROPERTIES',
  REMOVE_PROPERTIES = 'APP::CART::REMOVE_PROPERTIES',
  CLEAR = 'APP::CART::CLEAR',
  ADD_LINE_ITEM = 'APP::CART::ADD_LINE_ITEM',
  UPDATE_LINE_ITEM = 'APP::CART::UPDATE_LINE_ITEM',
  REMOVE_LINE_ITEM = 'APP::CART::REMOVE_LINE_ITEM',
  SET_LINE_ITEM_DISCOUNT = 'APP::CART::SET_LINE_ITEM_DISCOUNT',
  REMOVE_LINE_ITEM_DISCOUNT = 'APP::CART::REMOVE_LINE_ITEM_DISCOUNT',
  SET_LINE_ITEM_PROPERTIES = 'APP::CART::SET_LINE_ITEM_PROPERTIES',
  REMOVE_LINE_ITEM_PROPERTIES = 'APP::CART::REMOVE_LINE_ITEM_PROPERTIES',
}

export enum Action {
  FETCH = 'FETCH',
  UPDATE = 'UPDATE',
  SET_CUSTOMER = 'SET_CUSTOMER',
  REMOVE_CUSTOMER = 'REMOVE_CUSTOMER',
  ADD_CUSTOMER_ADDRESS = 'ADD_CUSTOMER_ADDRESS',
  UPDATE_CUSTOMER_ADDRESS = 'UPDATE_CUSTOMER_ADDRESS',
  SET_DISCOUNT = 'SET_DISCOUNT',
  REMOVE_DISCOUNT = 'REMOVE_DISCOUNT',
  SET_PROPERTIES = 'SET_PROPERTIES',
  REMOVE_PROPERTIES = 'REMOVE_PROPERTIES',
  CLEAR = 'CLEAR',
  ADD_LINE_ITEM = 'ADD_LINE_ITEM',
  UPDATE_LINE_ITEM = 'UPDATE_LINE_ITEM',
  REMOVE_LINE_ITEM = 'REMOVE_LINE_ITEM',
  SET_LINE_ITEM_DISCOUNT = 'SET_LINE_ITEM_DISCOUNT',
  REMOVE_LINE_ITEM_DISCOUNT = 'REMOVE_LINE_ITEM_DISCOUNT',
  SET_LINE_ITEM_PROPERTIES = 'SET_LINE_ITEM_PROPERTIES',
  REMOVE_LINE_ITEM_PROPERTIES = 'REMOVE_LINE_ITEM_PROPERTIES',
}

export interface Data {
  cartDiscount?: Discount;
  customer?: CustomerWithAddresses;
  grandTotal?: string;
  lineItems?: LineItem[];
  noteAttributes?: NoteAttributes;
  subTotal?: string;
  taxTotal?: string;
}

export interface Payload {
  readonly data: Data;
}

export interface Options {
  readonly id?: string;
}

export interface AddCustomerAddressPayload {
  readonly data: Address;
}

export interface AddLineItemPayload {
  readonly data: LineItem;
}

export interface SetCustomerPayload {
  readonly data: Customer;
}

export interface UpdateCustomerAddressPayload {
  readonly data: Address;
  readonly index: number;
}

export interface SetDiscountPayload {
  readonly data: DiscountAmount | DiscountCode;
}

export interface SetPropertiesPayload {
  readonly data: Properties;
}

export interface RemovePropertiesPayload {
  readonly data: string[];
}

export interface UpdateLineItemData {
  quantity: number;
}
export interface UpdateLineItemPayload {
  readonly data: UpdateLineItemData;
  readonly index: number;
}

export interface RemoveLineItemPayload {
  readonly index: number;
}

export interface SetLineItemDiscountPayload {
  readonly data: DiscountAmount;
  readonly index: number;
}

export interface RemoveLineItemDiscountPayload {
  readonly index: number;
}

export interface SetLineItemPropertiesPayload {
  readonly data: Properties;
  readonly index: number;
}

export interface RemoveLineItemPropertiesPayload {
  readonly data: string[];
  readonly index: number;
}

/**
 * Cart types
 */

export interface Customer {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  note?: string;
}

export interface CustomerWithAddresses extends Customer {
  addresses?: Address[];
}

export interface Address {
  address1?: string;
  address2?: string;
  city?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  provice?: string;
  country?: string;
  zip?: string;
  name?: string;
  proviceCode?: string;
  countryCode?: string;
}

export interface DiscountAmount {
  amount: number;
  discountDescription?: string;
  type?: string;
}

export interface DiscountCode {
  discountCode: string;
}

export interface Discount extends DiscountAmount, DiscountCode {}

export interface LineItem {
  price?: number;
  quantity: number;
  title?: string;
  variantId?: number;
}

export type NoteAttributes = Array<{
  name: string;
  value: string;
}>;

export interface Properties {
  [index: string]: string;
}

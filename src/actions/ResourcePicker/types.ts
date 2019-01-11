/**
 * @module ResourcePicker
 */

export enum Action {
  OPEN = 'OPEN',
  SELECT = 'SELECT',
  CLOSE = 'CLOSE', // Deprecated in 0.5.0
  UPDATE = 'UPDATE',
  CANCEL = 'CANCEL',
}

export enum ActionType {
  OPEN = 'APP::RESOURCE_PICKER::OPEN',
  SELECT = 'APP::RESOURCE_PICKER::SELECT',
  CLOSE = 'APP::RESOURCE_PICKER::CLOSE', // Deprecated in 0.5.0
  UPDATE = 'APP::RESOURCE_PICKER::UPDATE',
  CANCEL = 'APP::RESOURCE_PICKER::CANCEL',
}

export type Money = string;

export enum CollectionSortOrder {
  Manual = 'MANUAL',
  BestSelling = 'BEST_SELLING',
  AlphaAsc = 'ALPHA_ASC',
  AlphaDesc = 'ALPHA_DESC',
  PriceDesc = 'PRICE_DESC',
  PriceAsc = 'PRICE_ASC',
  CreatedDesc = 'CREATED_DESC',
  Created = 'CREATED',
}

export enum FulfillmentServiceType {
  GiftCard = 'GIFT_CARD',
  Manual = 'MANUAL',
  ThirdParty = 'THIRD_PARTY',
}

export enum WeightUnit {
  Kilograms = 'KILOGRAMS',
  Grams = 'GRAMS',
  Pounds = 'POUNDS',
  Ounces = 'OUNCES',
}

export enum ProductVariantInventoryPolicy {
  Deny = 'DENY',
  Continue = 'CONTINUE',
}

export enum ProductVariantInventoryManagement {
  Shopify = 'SHOPIFY',
  NotManaged = 'NOT_MANAGED',
  FulfillmentService = 'FULFILLMENT_SERVICE',
}

export interface Image {
  id: string;
  altText?: string;
  originalSrc: string;
}

export interface Resource {
  id: string;
  updatedAt: string;
}

export interface Collection extends Resource {
  availablePublicationCount: number;
  description: string;
  descriptionHtml: string;
  handle: string;
  id: string;
  image?: Image | null;
  productsAutomaticallySortedCount: number;
  productsCount: number;
  productsManuallySortedCount: number;
  publicationCount: number;
  seo: {
    description?: string | null;
    title?: string | null;
  };
  sortOrder: CollectionSortOrder;
  storefrontId: string;
  templateSuffix?: string | null;
  title: string;
}

export interface ProductVariant extends Resource {
  availableForSale: boolean;
  barcode?: string | null;
  compareAtPrice?: Money | null;
  createdAt: string;
  displayName: string;
  fulfillmentService?: {
    id: string;
    inventoryManagement: boolean;
    productBased: boolean;
    serviceName: string;
    type: FulfillmentServiceType;
  };
  image?: Image | null;
  inventoryItem: {id: string};
  inventoryManagement: ProductVariantInventoryManagement;
  inventoryPolicy: ProductVariantInventoryPolicy;
  inventoryQuantity?: number | null;
  position: number;
  price: Money;
  product: Partial<Product>;
  requiresShipping: boolean;
  selectedOptions: {value?: string | null}[];
  sku?: string | null;
  taxable: boolean;
  title: string;
  weight?: number | null;
  weightUnit: WeightUnit;
}

export interface Product extends Resource {
  availablePublicationCount: number;
  createdAt: string;
  descriptionHtml: string;
  handle: string;
  hasOnlyDefaultVariant: boolean;
  images: Image[];
  options: {
    id: string;
    name: string;
    position: number;
    values: string[];
  }[];
  productType: string;
  publishedAt?: string | null;
  tags: string[];
  templateSuffix?: string | null;
  title: string;
  totalInventory: number;
  tracksInventory: boolean;
  variants: Partial<ProductVariant>[];
  vendor: string;
}

export interface CancelPayload {
  readonly id?: string;
}

export type ClosePayload = CancelPayload;

export interface Payload {
  readonly id?: string;
  initialQuery?: string;
  selectMultiple?: boolean;
  showHidden?: boolean;
  showVariants?: boolean;
  resourceType: ResourceType;
}

export type ResourceSelection = Product | ProductVariant | Collection;

export interface SelectPayload {
  readonly id?: string;
  selection: ResourceSelection[];
}

export interface Options {
  initialQuery?: string;
  showHidden?: boolean;
  selectMultiple?: boolean;
}

export interface ProductOptions extends Options {
  showVariants?: boolean;
}

export interface BaseOptions {
  resourceType: ResourceType;
  options?: Options | ProductOptions;
}

export enum ResourceType {
  Product = 'product',
  ProductVariant = 'variant',
  Collection = 'collection',
}

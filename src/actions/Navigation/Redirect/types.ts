export interface BasePayload {
  id?: string;
}

export interface BaseAdminPayload extends BasePayload {
  newContext?: boolean;
}

export interface AppPayload extends BasePayload {
  path: string;
}

export interface AdminPathPayload extends BaseAdminPayload {
  path: string;
}

export interface RemotePayload extends BaseAdminPayload {
  url: string;
}

export interface CreateResource {
  create: boolean;
}

export interface ResourceInfo {
  id: string;
}

export interface Section {
  name: ResourceType;
  resource?: CreateResource | ResourceInfo | ProductVariantResource;
}

export interface AdminSectionPayload extends BaseAdminPayload {
  section: Section;
}

export interface ProductVariantResource extends ResourceInfo {
  variant: CreateResource | ResourceInfo;
}

export enum Action {
  ADMIN_PATH = 'ADMIN::PATH',
  ADMIN_SECTION = 'ADMIN::SECTION',
  REMOTE = 'REMOTE',
  APP = 'APP',
}

export enum ActionType {
  ADMIN_SECTION = 'APP::NAVIGATION::REDIRECT::ADMIN::SECTION',
  ADMIN_PATH = 'APP::NAVIGATION::REDIRECT::ADMIN::PATH',
  REMOTE = 'APP::NAVIGATION::REDIRECT::REMOTE',
  APP = 'APP::NAVIGATION::REDIRECT::APP',
}

export enum ResourceType {
  Product = 'products',
  Collection = 'collections',
  Order = 'orders',
  Customer = 'customers',
  Discount = 'discounts',
}

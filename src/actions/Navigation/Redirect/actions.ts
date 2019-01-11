/**
 * @module Redirect
 */

import {ClientApplication} from '../../../client';
import {actionWrapper, ActionSet} from '../../helper';
import {ComplexDispatch, Group, MetaAction} from '../../types';
import {
  Action,
  ActionType,
  AdminPathPayload,
  AdminSectionPayload,
  AppPayload,
  CreateResource,
  ProductVariantResource,
  RemotePayload,
  ResourceInfo,
  Section,
} from './types';

export interface ActionBase extends MetaAction {
  readonly group: typeof Group.Navigation;
}

export interface AdminPathAction extends ActionBase {
  readonly type: typeof ActionType.ADMIN_PATH;
  readonly payload: AdminPathPayload;
}

export interface AdminSectionAction extends ActionBase {
  readonly type: typeof ActionType.ADMIN_SECTION;
  readonly payload: AdminSectionPayload;
}

export interface AppAction extends ActionBase {
  readonly type: typeof ActionType.APP;
  readonly payload: AdminPathPayload;
}

export interface RemoteAction extends ActionBase {
  readonly type: typeof ActionType.REMOTE;
  readonly payload: RemotePayload;
}

export type RedirectAction =
  | AdminPathAction
  | RemoteAction
  | AppAction
  | AdminSectionAction
  | MetaAction;

export function isResourcePayload(resource: ResourceInfo | object): resource is ResourceInfo {
  // tslint:disable-next-line:no-boolean-literal-compare
  return typeof (resource as ResourceInfo).id === 'string';
}

export function isCreateResourcePayload(
  resource: CreateResource | object,
): resource is CreateResource {
  // tslint:disable-next-line:no-boolean-literal-compare
  return (resource as CreateResource).create === true;
}

export function isProductVariantResourcePayload(
  resource: ProductVariantResource | object,
): resource is ProductVariantResource {
  const castResource = resource as ProductVariantResource;

  // tslint:disable-next-line:no-boolean-literal-compare
  return castResource.id !== undefined && castResource.variant !== undefined;
}

export function isProductVariantCreateResourcePayload(
  resource: ProductVariantResource | object,
): resource is ProductVariantResource & {variant: CreateResource} {
  if (!isProductVariantResourcePayload(resource)) {
    return false;
  }

  return isCreateResourcePayload(resource.variant);
}

export function toAdminPath(payload: AdminPathPayload): AdminPathAction {
  return actionWrapper({
    payload,
    group: Group.Navigation,
    type: ActionType.ADMIN_PATH,
  });
}

export function toAdminSection(payload: AdminSectionPayload): AdminSectionAction {
  return actionWrapper({
    payload,
    group: Group.Navigation,
    type: ActionType.ADMIN_SECTION,
  });
}

export function toRemote(payload: RemotePayload): RemoteAction {
  return actionWrapper({
    payload,
    group: Group.Navigation,
    type: ActionType.REMOTE,
  });
}

export function toApp(payload: AppPayload): AppAction {
  return actionWrapper({
    payload,
    group: Group.Navigation,
    type: ActionType.APP,
  });
}

function isAdminPathPayload(payload: any): payload is AdminPathPayload {
  return typeof payload === 'object' && payload.hasOwnProperty('path');
}

function isAdminSectionPayload(payload: any): payload is AdminSectionPayload {
  return (
    typeof payload === 'object' &&
    typeof payload.section === 'object' &&
    payload.section.hasOwnProperty('name')
  );
}

function isRemotePayload(payload: any): payload is RemotePayload {
  return typeof payload === 'object' && payload.hasOwnProperty('url');
}

export class Redirect extends ActionSet implements ComplexDispatch<Section | string> {
  constructor(app: ClientApplication<any>) {
    super(app, 'Redirect', Group.Navigation);
  }

  get payload() {
    return {id: this.id};
  }

  dispatch(action: Action.ADMIN_SECTION, payload: Section | AdminSectionPayload): ActionSet;

  dispatch(action: Action.ADMIN_PATH, payload: string | AdminPathPayload): ActionSet;

  dispatch(action: Action.REMOTE, payload: string | RemotePayload): ActionSet;

  dispatch(action: Action.APP, payload: string): ActionSet;

  dispatch(
    action: Action,
    payload: Section | string | AdminSectionPayload | AdminPathPayload | RemotePayload,
  ) {
    switch (action) {
      case Action.ADMIN_PATH:
        const adminPathPayload = isAdminPathPayload(payload) ? payload : {path: payload as string};
        this.app.dispatch(toAdminPath({...this.payload, ...adminPathPayload}));
        break;

      case Action.ADMIN_SECTION:
        const adminSectionPayload = isAdminSectionPayload(payload)
          ? payload
          : {section: payload as Section};
        this.app.dispatch(toAdminSection({...this.payload, ...adminSectionPayload}));
        break;

      case Action.APP:
        this.app.dispatch(toApp({...this.payload, path: payload as string}));
        break;

      case Action.REMOTE:
        const remotePayload = isRemotePayload(payload) ? payload : {url: payload as string};
        this.app.dispatch(toRemote({...this.payload, ...remotePayload}));
        break;
    }

    return this;
  }
}

export function create(app: ClientApplication<any>) {
  return new Redirect(app);
}

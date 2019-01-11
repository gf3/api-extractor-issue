import {createMockApp} from 'test/helper';
import * as Helper from '../../../helper';
import {
  create,
  isCreateResourcePayload,
  isProductVariantCreateResourcePayload,
  isProductVariantResourcePayload,
  toAdminPath,
  toAdminSection,
  toApp,
  toRemote,
  Redirect,
} from '../actions';
import {Action, ResourceType} from '../types';

describe('Redirect Actions', () => {
  const specificResource = {
    section: {
      name: ResourceType.Collection,
      resource: {
        id: '123',
      },
    },
  };

  const createResource = {
    section: {
      name: ResourceType.Collection,
      resource: {
        create: true,
      },
    },
  };

  const productVariantResource = {
    section: {
      name: ResourceType.Product,
      resource: {
        id: '123',
        variant: {
          id: '456',
        },
      },
    },
  };

  const productVariantCreateResource = {
    section: {
      name: ResourceType.Product,
      resource: {
        id: '123',
        variant: {
          create: true,
        },
      },
    },
  };

  const adminSection = {
    section: {
      name: ResourceType.Collection,
    },
  };

  beforeEach(() => {
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('dispatches redirect to remote url', () => {
    const payload = {
      url: 'http://example.com',
    };
    const expectedAction = {
      payload,
      group: 'Navigation',
      type: 'APP::NAVIGATION::REDIRECT::REMOTE',
    };
    expect(toRemote(payload)).toEqual(expectedAction);
  });

  it('dispatches redirect to app path', () => {
    const payload = {
      path: '/settings',
    };
    const expectedAction = {
      payload,
      group: 'Navigation',
      type: 'APP::NAVIGATION::REDIRECT::APP',
    };
    expect(toApp(payload)).toEqual(expectedAction);
  });

  it('dispatches redirect to admin path', () => {
    const payload = {
      path: '/products',
    };
    const expectedAction = {
      payload,
      group: 'Navigation',
      type: 'APP::NAVIGATION::REDIRECT::ADMIN::PATH',
    };
    expect(toAdminPath(payload)).toEqual(expectedAction);
  });

  it('dispatches redirect to admin section', () => {
    const expectedAction = {
      group: 'Navigation',
      payload: adminSection,
      type: 'APP::NAVIGATION::REDIRECT::ADMIN::SECTION',
    };
    expect(toAdminSection(adminSection)).toEqual(expectedAction);
  });

  it('isProductVariantResourcePayload returns correct value', () => {
    const tests = [
      {
        input: specificResource.section.resource,
        result: false,
      },
      {
        input: createResource.section.resource,
        result: false,
      },
      {
        input: productVariantResource.section.resource,
        result: true,
      },
      {
        input: productVariantCreateResource.section.resource,
        result: true,
      },
    ];

    tests.forEach(test => {
      const {input, result} = test;
      expect(isProductVariantResourcePayload(input)).toBe(result);
    });
  });

  it('isCreateResourcePayload returns correct value', () => {
    const tests = [
      {
        input: specificResource.section.resource,
        result: false,
      },
      {
        input: createResource.section.resource,
        result: true,
      },
      {
        input: productVariantResource.section.resource,
        result: false,
      },
      {
        input: productVariantCreateResource.section.resource,
        result: false,
      },
    ];

    tests.forEach(test => {
      const {input, result} = test;
      expect(isCreateResourcePayload(input)).toBe(result);
    });
  });

  it('isProductVariantCreateResourcePayload returns correct value', () => {
    const tests = [
      {
        input: specificResource.section.resource,
        result: false,
      },
      {
        input: createResource.section.resource,
        result: false,
      },
      {
        input: productVariantResource.section.resource,
        result: false,
      },
      {
        input: productVariantCreateResource.section.resource,
        result: true,
      },
    ];

    tests.forEach(test => {
      const {input, result} = test;
      expect(isProductVariantCreateResourcePayload(input)).toBe(result);
    });
  });
});

describe('Redirect', () => {
  let app;
  beforeEach(() => {
    app = createMockApp();
    jest.spyOn(Helper, 'actionWrapper').mockImplementation(jest.fn(obj => obj));
  });

  it('dispatches app action', () => {
    const redirect = new Redirect(app);
    const path = '/settings';
    const expectedAction = {
      group: 'Navigation',
      payload: {id: redirect.id, path},
      type: 'APP::NAVIGATION::REDIRECT::APP',
    };
    redirect.dispatch(Action.APP, path);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches admin path action', () => {
    const redirect = new Redirect(app);
    const path = '/apps';
    const expectedAction = {
      group: 'Navigation',
      payload: {id: redirect.id, path},
      type: 'APP::NAVIGATION::REDIRECT::ADMIN::PATH',
    };
    redirect.dispatch(Action.ADMIN_PATH, path);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches admin path action with newContext', () => {
    const redirect = new Redirect(app);
    const path = '/apps';
    const newContext = true;
    const expectedAction = {
      group: 'Navigation',
      payload: {id: redirect.id, path, newContext},
      type: 'APP::NAVIGATION::REDIRECT::ADMIN::PATH',
    };
    redirect.dispatch(Action.ADMIN_PATH, {newContext, path});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches admin section action', () => {
    const redirect = new Redirect(app);
    const section = {name: ResourceType.Product};
    const expectedAction = {
      group: 'Navigation',
      payload: {id: redirect.id, section},
      type: 'APP::NAVIGATION::REDIRECT::ADMIN::SECTION',
    };
    redirect.dispatch(Action.ADMIN_SECTION, section);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches admin section action with newContext', () => {
    const redirect = new Redirect(app);
    const section = {name: ResourceType.Product};
    const newContext = true;
    const expectedAction = {
      group: 'Navigation',
      payload: {id: redirect.id, section, newContext},
      type: 'APP::NAVIGATION::REDIRECT::ADMIN::SECTION',
    };
    redirect.dispatch(Action.ADMIN_SECTION, {section, newContext});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches remote action', () => {
    const redirect = new Redirect(app);
    const url = '/settings';
    const expectedAction = {
      group: 'Navigation',
      payload: {id: redirect.id, url},
      type: 'APP::NAVIGATION::REDIRECT::REMOTE',
    };
    redirect.dispatch(Action.REMOTE, url);
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('dispatches remote action with newContext', () => {
    const redirect = new Redirect(app);
    const url = '/settings';
    const newContext = true;
    const expectedAction = {
      group: 'Navigation',
      payload: {id: redirect.id, url, newContext},
      type: 'APP::NAVIGATION::REDIRECT::REMOTE',
    };
    redirect.dispatch(Action.REMOTE, {url, newContext});
    expect(app.dispatch).toHaveBeenCalledTimes(1);
    expect(app.dispatch.mock.calls[0][0]).toMatchObject(expectedAction);
  });

  it('create generates a new Redirect instance', () => {
    const obj = create(app);
    expect(obj instanceof Redirect).toBe(true);
    expect(obj.group).toEqual('Navigation');
    expect(obj.type).toEqual('Redirect');
  });
});

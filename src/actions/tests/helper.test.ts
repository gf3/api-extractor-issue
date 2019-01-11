import {createMockApp} from 'test/helper';
import {ClientApplication, LifecycleHook} from '../../client';
import Hooks from '../../client/Hooks';
import {getGroupedButton} from '../buttonGroupHelper';
import {getSingleButton} from '../buttonHelper';
import {
  actionWrapper,
  forEachInEnum,
  getEventNameSpace,
  getMergedProps,
  isValidOptionalNumber,
  isValidOptionalString,
  updateActionFromPayload,
  ActionSet,
  ActionSetWithChildren,
} from '../helper';
import * as DeepMerge from '../merge';
import {ActionSetInterface, ActionSubscription} from '../types';
import {clickButton, Action as ButtonAction, Button} from '../Button';
import {Action as ButtonGroupAction, ButtonGroup} from '../ButtonGroup';
import {Action as ErrorActions} from '../Error/types';

class ParentActionSet extends ActionSetWithChildren {
  constructor(myApp: ClientApplication<any>) {
    super(myApp, 'ParentType', 'SomeParentGroup');
  }
  dispatch(action: string, payload?: any) {
    switch (action) {
      case 'click':
        this.app.dispatch(clickButton(this.group, this.component, payload));
        break;
      default:
    }
  }
}

class ChildActionSet extends ActionSet {
  constructor(myApp: ClientApplication<any>) {
    super(myApp, 'ChildType', 'SomeChildGroup');
  }
  dispatch(action: string, payload?: any) {
    switch (action) {
      case 'click':
        this.app.dispatch(clickButton(this.group, this.component, payload));
        break;
      default:
    }
  }
}

class FakeButton extends ChildActionSet {
  label: string;
  constructor(myApp: ClientApplication<any>, options: {label: string}) {
    super(myApp);
    this.label = options.label;
  }
}

class FakeButtonGroup extends ChildActionSet {
  label: string;
  buttons: FakeButton[];
  disabled: boolean;
  constructor(
    myApp: ClientApplication<any>,
    options: {label: string; buttons: FakeButton[]; disabled: boolean},
  ) {
    super(myApp);
    this.label = options.label;
    this.buttons = options.buttons;
  }
}

describe('Helper', () => {
  it('actionWrapper wraps an object with the version number', () => {
    const actionObj = {name: 'Dispatch'};
    const wrappedObj = actionWrapper(actionObj);
    const version = require('../../../package.json').version;
    expect(wrappedObj).toMatchObject({version});
  });

  it('isValidOptionalNumber should return expected result', () => {
    expect(isValidOptionalNumber(null)).toBe(true);
    expect(isValidOptionalNumber(undefined)).toBe(true);
    expect(isValidOptionalNumber('1')).toBe(false);
    expect(isValidOptionalNumber(false)).toBe(false);
    expect(isValidOptionalNumber(1)).toBe(true);
  });

  it('isValidOptionalString should return expected result', () => {
    expect(isValidOptionalString(null)).toBe(true);
    expect(isValidOptionalString(undefined)).toBe(true);
    expect(isValidOptionalString('1')).toBe(true);
    expect(isValidOptionalString(false)).toBe(false);
    expect(isValidOptionalString(1)).toBe(false);
  });
});

describe('ActionSet', () => {
  const unsubscribeStub = jest.fn();
  const app = createMockApp();

  beforeEach(() => {
    app.subscribe = () => unsubscribeStub;
    jest.resetAllMocks();
  });

  it('subscribe method should use given component', () => {
    const fakeComponent = new ChildActionSet(app);
    const subscriptionCbSpy = jest.fn();
    const component = {
      id: '123',
      type: 'test',
    };
    app.subscribe = jest.fn().mockReturnValue(jest.fn());
    fakeComponent.subscribe('SOME_EVENT', subscriptionCbSpy, component);

    expect(app.subscribe).toHaveBeenCalledWith(
      getEventNameSpace(fakeComponent.group, 'SOME_EVENT', component),
      expect.any(Function),
      component.id,
    );
    expect(fakeComponent.subscriptions[0]).toEqual({
      component,
      callback: expect.any(Function),
      eventType: 'SOME_EVENT',
      unsubscribe: expect.any(Function),
      updateSubscribe: expect.any(Function),
    });
  });

  it('subscribe method should use this.component by default', () => {
    const fakeComponent = new ChildActionSet(app);
    const subscriptionCbSpy = jest.fn();

    app.subscribe = jest.fn().mockReturnValue(jest.fn());
    fakeComponent.subscribe('SOME_EVENT', subscriptionCbSpy);

    expect(app.subscribe).toHaveBeenCalledWith(
      getEventNameSpace(fakeComponent.group, 'SOME_EVENT', fakeComponent.component),
      expect.any(Function),
      fakeComponent.component.id,
    );
    expect(fakeComponent.subscriptions[0]).toEqual({
      callback: expect.any(Function),
      component: fakeComponent.component,
      eventType: 'SOME_EVENT',
      unsubscribe: expect.any(Function),
      updateSubscribe: expect.any(Function),
    });
  });

  it('subscribe method calls app.subscribe and creates subscription as expected', () => {
    const fakeComponent = new ChildActionSet(app);
    const updateSubscribtionSpy = jest.spyOn(fakeComponent, 'updateSubscription');
    const subscriptionCbSpy = jest.fn();
    const unsubscribeSpy = jest.fn();
    app.subscribe = jest.fn().mockReturnValue(unsubscribeSpy);
    fakeComponent.subscribe('SOME_EVENT', subscriptionCbSpy);

    expect(app.subscribe).toHaveBeenCalledWith(
      getEventNameSpace(fakeComponent.group, 'SOME_EVENT', fakeComponent.component),
      expect.any(Function),
      fakeComponent.component.id,
    );

    const expectedSubscription = {
      callback: expect.any(Function),
      component: fakeComponent.component,
      eventType: 'SOME_EVENT',
      unsubscribe: unsubscribeSpy,
      updateSubscribe: expect.any(Function),
    };
    expect(fakeComponent.subscriptions[0]).toEqual(expectedSubscription);

    fakeComponent.subscriptions[0].unsubscribe();
    expect(unsubscribeSpy).toHaveBeenCalled();

    fakeComponent.subscriptions[0].callback();
    expect(subscriptionCbSpy).toHaveBeenCalled();

    fakeComponent.subscriptions[0].updateSubscribe('NewGroup', ['New Subgroup']);

    const expectedUpdatedSubscription = {
      callback: expect.any(Function),
      component: {...fakeComponent.component, subgroups: ['New Subgroup']},
      eventType: 'SOME_EVENT',
      unsubscribe: unsubscribeSpy,
      updateSubscribe: expect.any(Function),
    };

    expect(updateSubscribtionSpy).toHaveBeenCalledWith(expectedUpdatedSubscription, 'NewGroup', [
      'New Subgroup',
    ]);
  });

  it('subscribe method returns unsubscribe function created from calling app.subscribe', () => {
    const fakeComponent = new ChildActionSet(app);
    const subscriptionCbSpy = jest.fn();
    const unsubscribeSpy = jest.fn();
    app.subscribe = jest.fn().mockReturnValue(unsubscribeSpy);
    const result = fakeComponent.subscribe('SOME_EVENT', subscriptionCbSpy);

    expect(result).toBe(unsubscribeSpy);
  });

  it('error method calls subscribe for each error type', () => {
    const fakeComponent = new ChildActionSet(app);
    const subscriptionCbSpy = jest.spyOn(fakeComponent, 'subscribe');
    const unsubscribeSpy = jest.fn();
    const errorHandler = jest.fn();
    app.subscribe = jest.fn().mockReturnValue(unsubscribeSpy);

    fakeComponent.error(errorHandler);

    forEachInEnum(ErrorActions, action => {
      expect(subscriptionCbSpy).toHaveBeenCalledWith(action, errorHandler);
    });
  });

  it('error method returns an unsubscribe method that unsubscribes the handler from all errors', () => {
    const fakeComponent = new ChildActionSet(app);
    const unsubscribeSpy = jest.fn();
    const errorHandler = jest.fn();

    let errorTypesCount = 0;
    forEachInEnum(ErrorActions, action => {
      errorTypesCount++;
    });

    app.subscribe = jest.fn().mockReturnValue(unsubscribeSpy);

    const unsubscribe = fakeComponent.error(errorHandler);
    fakeComponent.subscribe('SOME_EVENT', jest.fn());

    expect(fakeComponent.subscriptions.length).toBe(errorTypesCount + 1);
    unsubscribe();

    expect(unsubscribeSpy).toHaveBeenCalledTimes(errorTypesCount);

    expect(fakeComponent.subscriptions.length).toBe(1);
    expect(fakeComponent.subscriptions[0]).toMatchObject({
      eventType: 'SOME_EVENT',
    });
  });

  it('error method returns an unsubscribe method that unsubscribes the handler from all errors, even if error subscriptions have been updated', () => {
    const fakeComponent = new ChildActionSet(app);
    const unsubscribeSpy = jest.fn();
    const errorHandler = jest.fn();

    let errorTypesCount = 0;
    forEachInEnum(ErrorActions, action => {
      errorTypesCount++;
    });

    app.subscribe = jest.fn().mockReturnValue(unsubscribeSpy);

    const unsubscribe = fakeComponent.error(errorHandler);
    fakeComponent.subscribe('SOME_EVENT', jest.fn());

    expect(fakeComponent.subscriptions.length).toBe(errorTypesCount + 1);

    fakeComponent.subscriptions.forEach(subscription =>
      subscription.updateSubscribe('NewGroup', ['New Subgroup']),
    );
    unsubscribeSpy.mockClear();

    unsubscribe();

    expect(unsubscribeSpy).toHaveBeenCalledTimes(errorTypesCount);

    expect(fakeComponent.subscriptions.length).toBe(1);
    expect(fakeComponent.subscriptions[0]).toMatchObject({
      eventType: 'SOME_EVENT',
    });
  });

  it('subscribe method updates existing subscription if given a valid subscription index', () => {
    const fakeComponent = new ChildActionSet(app);
    const subscriptionCbSpy = jest.fn();
    const fakeSubscription: ActionSubscription = {
      callback: subscriptionCbSpy,
      component: {
        id: '123',
        type: 'test',
      },
      eventType: 'SOME_EVENT',
      unsubscribe: jest.fn(),
      updateSubscribe: jest.fn(),
    };

    app.subscribe = jest.fn().mockReturnValue(jest.fn());

    fakeComponent.subscriptions = [fakeSubscription];

    fakeComponent.subscribe('SOME_EVENT', subscriptionCbSpy, fakeComponent.component, 0);

    expect(app.subscribe).toHaveBeenCalledWith(
      getEventNameSpace(fakeComponent.group, 'SOME_EVENT', fakeComponent.component),
      subscriptionCbSpy,
      fakeComponent.id,
    );
    expect(fakeSubscription).toEqual({
      callback: subscriptionCbSpy,
      component: {
        id: '123',
        type: 'test',
      },
      eventType: 'SOME_EVENT',
      unsubscribe: expect.any(Function),
      updateSubscribe: expect.any(Function),
    });
  });

  it('updateSubscription unsubscribes existing subscription and then calls subscribe with index of existing subscription', () => {
    const fakeComponent = new ChildActionSet(app);
    const subscriptionCbSpy = jest.fn();
    const subscriptionCbSpy2 = jest.fn();
    const unsubscribeSpy = jest.fn();
    app.subscribe = jest.fn().mockReturnValue(unsubscribeSpy);

    fakeComponent.subscribe('SOME_EVENT', subscriptionCbSpy);
    fakeComponent.subscribe('SOME_OTHER_EVENT', subscriptionCbSpy2);
    const subscribeSpy = jest.spyOn(fakeComponent, 'subscribe');

    const subscriptionToUpdate = fakeComponent.subscriptions[1];
    const result = fakeComponent.updateSubscription(subscriptionToUpdate, 'New Group', [
      'New sub group',
    ]);

    expect(subscribeSpy).toHaveBeenCalledWith(
      subscriptionToUpdate.eventType,
      subscriptionToUpdate.callback,
      subscriptionToUpdate.component,
      1,
    );
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });

  it('updateSubscription does NOT call unsubscribe if subscription does not already exist', () => {
    const fakeComponent = new ChildActionSet(app);
    const subscriptionCbSpy = jest.fn();

    const unsubscribeSpy = jest.fn();
    app.subscribe = jest.fn().mockReturnValue(unsubscribeSpy);

    fakeComponent.subscribe('SOME_EVENT', subscriptionCbSpy);

    const subscribeSpy = jest.spyOn(fakeComponent, 'subscribe');

    const subscriptionToUpdate = {
      callback: subscriptionCbSpy,
      component: {
        id: '123',
        type: 'test',
      },
      eventType: 'SOME_EVENT',
      unsubscribe: jest.fn(),
      updateSubscribe: jest.fn(),
    };

    const result = fakeComponent.updateSubscription(subscriptionToUpdate, 'New Group', [
      'New sub group',
    ]);

    expect(subscribeSpy).toHaveBeenCalledWith(
      subscriptionToUpdate.eventType,
      subscriptionToUpdate.callback,
      subscriptionToUpdate.component,
      undefined,
    );

    expect(unsubscribeSpy).not.toHaveBeenCalled();
  });

  it('updateSubscription updates groups and subgroups and component as expected', () => {
    const fakeComponent = new ChildActionSet(app);
    const subscriptionCbSpy = jest.fn();

    const unsubscribeSpy = jest.fn();
    app.subscribe = jest.fn().mockReturnValue(unsubscribeSpy);

    fakeComponent.subscribe('SOME_EVENT', subscriptionCbSpy);

    const subscribeSpy = jest.spyOn(fakeComponent, 'subscribe');

    const result = fakeComponent.updateSubscription(fakeComponent.subscriptions[0], 'New Group', [
      'New sub group',
    ]);

    expect(fakeComponent.group).toEqual('New Group');
    expect(fakeComponent.subgroups).toEqual(['New sub group']);

    expect(fakeComponent.subscriptions[0].component).toEqual({
      ...fakeComponent.subscriptions[0].component,
      subgroups: ['New sub group'],
    });
  });

  it('set returns result of child class set method', () => {
    class MyActionSet extends ActionSet {
      constructor(myApp: ClientApplication<any>) {
        super(myApp, 'ChildType', 'SomeChildGroup');
      }
      set() {
        return 'mama mia!';
      }
    }

    const fakeComponent = new MyActionSet(app);

    expect(fakeComponent.set()).toEqual('mama mia!');
  });

  describe('with Hooks', () => {
    it('set calls to run UpdateAction hook with current action instance and given options', () => {
      app.hooks = new Hooks();
      const fakeComponent = new ChildActionSet(app);
      const hookRunSpy = jest.spyOn(app.hooks, 'run');
      const options = {type: 'linguini'};

      fakeComponent.set(options);

      expect(hookRunSpy).toHaveBeenCalledWith(
        LifecycleHook.UpdateAction,
        expect.any(Function),
        fakeComponent,
        options,
      );
    });

    it('set returns result of child class set method', () => {
      app.hooks = new Hooks();

      class MyActionSet extends ActionSet {
        constructor(myApp: ClientApplication<any>) {
          super(myApp, 'ChildType', 'SomeChildGroup');
        }
        set() {
          return 'mama mia!';
        }
      }

      const fakeComponent = new MyActionSet(app);

      expect(fakeComponent.set()).toEqual('mama mia!');
    });
  });
});

describe('ActionSetWithChildren', () => {
  const unsubscribeStub = jest.fn();
  const app = createMockApp();
  const fakeButton = new Button(app, {label: 'Button A'});

  const fakeButtonGroup = new ButtonGroup(app, {
    buttons: [fakeButton],
    disabled: false,
    label: 'Button Group',
  });

  beforeEach(() => {
    app.subscribe = () => unsubscribeStub;
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('unsubscribes removes ONLY parent subscriptions and resets group/subgroups for children when called with unsubscribeChildren = `false`', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);
    fakeParent.addChild(fakeChild, fakeParent.group, ['SomeSubgroup']);
    fakeParent.subscribe('click', jest.fn());
    fakeChild.subscribe('click', jest.fn());

    unsubscribeStub.mockClear();
    fakeParent.unsubscribe(false);
    expect(fakeParent.subscriptions.length).toBe(0);

    // Child should still have a subscription and its group and subgroups should have been reset
    expect(fakeChild.subscriptions.length).toBe(1);
    expect(fakeChild).toMatchObject({
      group: 'SomeChildGroup',
      subgroups: [],
    });
  });

  it('unsubscribes removes subscriptions for parent and all children by default', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);

    fakeChild.subscribe('click', jest.fn());
    fakeParent.addChild(fakeChild, fakeParent.group, ['SomeSubgroup']);
    fakeParent.subscribe('click', jest.fn());

    unsubscribeStub.mockClear();
    fakeParent.unsubscribe();

    expect(fakeParent.subscriptions.length).toBe(0);
    expect(fakeChild.subscriptions.length).toBe(0);
  });

  it('unsubscribes keeps all subscriptions and resets group/subgroups for parent and children when unsubscribe is called with unsubscribeChildren = `false` and resetParent = `true`', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);
    fakeParent.group = 'SomeNewGroup';

    fakeParent.addChild(fakeChild, fakeParent.group, ['SomeSubgroup']);
    fakeParent.subscribe('click', jest.fn());
    fakeChild.subscribe('click', jest.fn());

    unsubscribeStub.mockClear();

    // Subscription should match new group
    expect(fakeParent.subscriptions.length).toBe(1);
    expect(fakeParent).toMatchObject({
      group: 'SomeNewGroup',
      subgroups: [],
    });

    // Subscription should match new parent group and given subgroups
    expect(fakeChild.subscriptions.length).toBe(1);
    expect(fakeChild).toMatchObject({
      group: 'SomeNewGroup',
      subgroups: ['SomeSubgroup'],
    });

    unsubscribeStub.mockClear();

    fakeParent.unsubscribe(false, true);

    // Subscription resets to default parent group
    expect(fakeParent.subscriptions.length).toBe(1);
    expect(fakeParent).toMatchObject({
      group: 'SomeParentGroup',
      subgroups: [],
    });

    // Subscription resets to default child group
    expect(fakeChild.subscriptions.length).toBe(1);
    expect(fakeChild).toMatchObject({
      group: 'SomeChildGroup',
      subgroups: [],
    });
  });

  it('unsubscribes removes resets group/subgroups for parent and removes all children subscriptions when unsubscribe is called with unsubscribeChildren = `true` and resetParent = `true`', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);
    fakeParent.group = 'SomeNewGroup';

    fakeParent.addChild(fakeChild, fakeParent.group, ['SomeSubgroup']);
    fakeParent.subscribe('click', jest.fn());
    fakeChild.subscribe('click', jest.fn());

    unsubscribeStub.mockClear();
    fakeParent.unsubscribe(true, true);

    // Subscription resets to default parent group
    expect(fakeParent.subscriptions.length).toBe(1);
    expect(fakeParent).toMatchObject({
      group: 'SomeParentGroup',
      subgroups: [],
    });

    expect(fakeChild.subscriptions.length).toBe(0);
  });

  it('subscribeToChild updates subscription if it already exists', () => {
    const eventName = 'SOME_ACTION';
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);
    const updateCb = jest.fn();
    fakeParent.addChild(fakeChild, fakeParent.group, fakeParent.subgroups);

    fakeParent.subscribeToChild(fakeChild, eventName, updateCb);

    // Update group and subgroup
    fakeParent.group = 'New parent group';
    fakeChild.subgroups = ['New subgroup'];

    fakeParent.subscribeToChild(fakeChild, eventName, updateCb);

    const subscriptions = fakeParent.getChildSubscriptions(fakeChild.id, eventName);
    expect(subscriptions).toHaveLength(1);

    expect(subscriptions[0]).toMatchObject({
      component: {
        id: fakeChild.id,
        subgroups: fakeChild.subgroups,
        type: fakeChild.type,
      },
      eventType: eventName,
    });
  });

  it('subscribeToChild accepts an array of event names and subscribes to each one', () => {
    const eventNames = ['SOME_ACTION', 'ANOTHER_ACTION'];
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);
    const updateCb = jest.fn();
    fakeParent.addChild(fakeChild, fakeParent.group, fakeParent.subgroups);

    fakeParent.subscribeToChild(fakeChild, eventNames, updateCb);

    const subscriptions = fakeParent.getChildSubscriptions(fakeChild.id);
    expect(subscriptions).toHaveLength(2);
    subscriptions.forEach((sub, index) => {
      expect(sub.eventType).toBe(eventNames[index]);
    });
  });

  it('removeChild removes child from parent and remove any subscriptions to the child', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);
    fakeParent.addChild(fakeChild, fakeParent.group, fakeParent.subgroups);
    fakeParent.subscribeToChild(fakeChild, 'SOME_ACTION', jest.fn());

    expect(fakeParent.getChildSubscriptions(fakeChild.id, 'SOME_ACTION')).toHaveLength(1);
    expect(fakeParent.getChild(fakeChild.id)).toBe(fakeChild);
    fakeParent.removeChild(fakeChild.id);

    expect(fakeParent.getChildSubscriptions(fakeChild.id, 'SOME_ACTION')).toHaveLength(0);
    expect(fakeParent.getChild(fakeChild.id)).not.toBeDefined();
  });

  it('getSingleButton calls addChild with expected args', () => {
    const fakeParent = new ParentActionSet(app);
    const addChildSpy = jest.spyOn(fakeParent, 'addChild');
    fakeParent.group = 'SomeNewGroup';

    getSingleButton(fakeParent, fakeButton, ['SomeSubgroup'], jest.fn());

    expect(addChildSpy).toHaveBeenCalledWith(fakeButton, 'SomeNewGroup', ['SomeSubgroup']);
  });

  it('getSingleButton calls subscribeToChild with expected args', () => {
    const fakeParent = new ParentActionSet(app);
    fakeParent.group = 'SomeGroup';

    const updateStub = jest.fn();
    const subscribeToChildSpy = jest.spyOn(fakeParent, 'subscribeToChild');
    getSingleButton(fakeParent, fakeButton, ['SomeSubgroup'], updateStub);

    expect(subscribeToChildSpy).toHaveBeenCalledWith(fakeButton, ButtonAction.UPDATE, updateStub);
  });

  it('getGroupedButton calls addChild with expected args', () => {
    const fakeParent = new ParentActionSet(app);
    const addChildSpy = jest.spyOn(fakeParent, 'addChild');
    fakeParent.group = 'SomeGroup';

    getGroupedButton(fakeParent, fakeButtonGroup, ['SomeSubgroup'], jest.fn());

    expect(addChildSpy).toHaveBeenCalledWith(fakeButtonGroup, 'SomeGroup', ['SomeSubgroup']);
  });

  it('getGroupedButton calls subscribeToChild with expected args', () => {
    const fakeParent = new ParentActionSet(app);
    const subscribeToChildSpy = jest.spyOn(fakeParent, 'subscribeToChild');
    fakeParent.group = 'SomeGroup';

    const updateStub = jest.fn();

    getGroupedButton(fakeParent, fakeButtonGroup, ['SomeSubgroup'], updateStub);
    expect(subscribeToChildSpy).toHaveBeenCalledWith(
      fakeButtonGroup,
      ButtonGroupAction.UPDATE,
      updateStub,
    );
  });

  it('getChildIndex returns correct index for child matching given id', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild1 = new ChildActionSet(app);
    const fakeChild2 = new ChildActionSet(app);
    const fakeChild3 = new ChildActionSet(app);

    fakeParent.addChild(fakeChild1, fakeParent.group, fakeParent.subgroups);
    fakeParent.addChild(fakeChild2, fakeParent.group, fakeParent.subgroups);
    fakeParent.addChild(fakeChild3, fakeParent.group, fakeParent.subgroups);
    expect(fakeParent.getChildIndex(fakeChild2.id)).toBe(1);
  });

  it('getChild returns child matching given id', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);
    fakeParent.addChild(fakeChild, fakeParent.group, fakeParent.subgroups);
    expect(fakeParent.getChild(fakeChild.id)).toBe(fakeChild);
  });

  it('getChild returns undefined when no child exists for given id', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);
    fakeParent.addChild(fakeChild, fakeParent.group, fakeParent.subgroups);
    expect(fakeParent.getChild('1234')).toBe(undefined);
  });

  it('getUpdatedChildActions calls to remove all children if new array of children is empty', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild1 = new ChildActionSet(app);
    const fakeChild2 = new ChildActionSet(app);
    const fakeChild3 = new ChildActionSet(app);

    fakeParent.addChild(fakeChild1, fakeParent.group, fakeParent.subgroups);
    fakeParent.addChild(fakeChild2, fakeParent.group, fakeParent.subgroups);
    fakeParent.addChild(fakeChild3, fakeParent.group, fakeParent.subgroups);

    const removeSpy = jest.spyOn(fakeParent, 'removeChild');
    fakeParent.getUpdatedChildActions([], fakeParent.children);
    expect(removeSpy).toHaveBeenCalledTimes(3);
    expect(removeSpy).toHaveBeenCalledWith(fakeChild1.id);
    expect(removeSpy).toHaveBeenCalledWith(fakeChild2.id);
    expect(removeSpy).toHaveBeenCalledWith(fakeChild3.id);
  });

  it('getUpdatedChildActions calls to remove all children that do not exist in the new child array', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild1 = new ChildActionSet(app);
    const fakeChild2 = new ChildActionSet(app);
    const fakeChild3 = new ChildActionSet(app);

    fakeParent.addChild(fakeChild1, fakeParent.group, fakeParent.subgroups);
    fakeParent.addChild(fakeChild2, fakeParent.group, fakeParent.subgroups);
    fakeParent.addChild(fakeChild3, fakeParent.group, fakeParent.subgroups);

    const removeSpy = jest.spyOn(fakeParent, 'removeChild');
    fakeParent.getUpdatedChildActions([fakeChild1], fakeParent.children);
    expect(removeSpy).toHaveBeenCalledTimes(2);
    expect(removeSpy).toHaveBeenCalledWith(fakeChild2.id);
    expect(removeSpy).toHaveBeenCalledWith(fakeChild3.id);
  });

  it('getUpdatedChildActions returns a list of unique children', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild1 = new ChildActionSet(app);
    const fakeChild2 = new ChildActionSet(app);
    const fakeChild3 = new ChildActionSet(app);

    fakeParent.addChild(fakeChild1, fakeParent.group, fakeParent.subgroups);

    const newActions = fakeParent.getUpdatedChildActions(
      [fakeChild1, fakeChild2, fakeChild2, fakeChild2, fakeChild3],
      fakeParent.children,
    );
    expect(newActions).toEqual([fakeChild1, fakeChild2, fakeChild3]);
  });

  it("addChild only adds child if it doesn't already exist", () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);
    fakeParent.addChild(fakeChild, fakeParent.group, fakeParent.subgroups);

    expect(fakeParent.children).toEqual([fakeChild]);
    fakeParent.addChild(fakeChild, fakeParent.group, fakeParent.subgroups);

    expect(fakeParent.children).toEqual([fakeChild]);
  });

  it('addChild assigns new subgroups and group for child', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);

    fakeParent.addChild(fakeChild, 'SomeGroup', ['SomeSubgroup']);
    expect(fakeChild.group).toEqual('SomeGroup');
    expect(fakeChild.subgroups).toEqual(['SomeSubgroup']);
  });

  it('addChild call updateSubscribe for each child subscription', () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChild = new ChildActionSet(app);

    const fakeSubscription1: ActionSubscription = {
      callback: jest.fn(),
      component: {
        id: '123',
        type: 'test',
      },
      eventType: 'SOME_EVENT',
      unsubscribe: jest.fn(),
      updateSubscribe: jest.fn(),
    };
    const fakeSubscription2: ActionSubscription = {
      callback: jest.fn(),
      component: {
        id: '456',
        type: 'test',
      },
      eventType: 'SOME_EVENT',
      unsubscribe: jest.fn(),
      updateSubscribe: jest.fn(),
    };

    fakeChild.subscriptions = [fakeSubscription1, fakeSubscription2];

    fakeParent.addChild(fakeChild, 'SomeGroup', ['SomeSubgroup']);
    expect(fakeSubscription1.updateSubscribe).toHaveBeenLastCalledWith('SomeGroup', [
      'SomeSubgroup',
    ]);
    expect(fakeSubscription2.updateSubscribe).toHaveBeenLastCalledWith('SomeGroup', [
      'SomeSubgroup',
    ]);
  });

  it("addChild calls addChild for child's children with correct group and subgroup", () => {
    const fakeParent = new ParentActionSet(app);
    const fakeChildWithChildrenChild = new ParentActionSet(app);
    const fakeChild1 = new ChildActionSet(app);
    const fakeChild2 = new ChildActionSet(app);
    fakeChildWithChildrenChild.children = [fakeChild1, fakeChild2];

    const addChildSpy = jest.spyOn(fakeParent, 'addChild');
    fakeParent.addChild(fakeChildWithChildrenChild, 'SomeGroup', ['SomeSubgroup']);

    expect(addChildSpy).toHaveBeenCalledTimes(3);
    expect(addChildSpy).toHaveBeenCalledWith(fakeChild1, 'SomeGroup', ['SomeSubgroup']);
    expect(addChildSpy).toHaveBeenCalledWith(fakeChild2, 'SomeGroup', ['SomeSubgroup']);
  });
});

describe('updateActionFromPayload', () => {
  interface Greeting extends ActionSetInterface {
    greeting: string;
    name: string;
  }
  const org: Greeting = {
    app: createMockApp(),
    defaultGroup: '',
    greeting: 'Hello',
    group: 'Friendly',
    id: '123',
    name: 'You',
    subgroups: [],
    subscriptions: [],
    type: 'Greeting',
  };

  it('returns true if object was updated with new props', () => {
    const newProps: Partial<Greeting> = {
      greeting: 'Howdy',
      id: '123',
    };
    expect(updateActionFromPayload(org, newProps)).toBe(true);
  });

  it('returns false if object was NOT updated with new props', () => {
    const newProps: Partial<Greeting> = {
      greeting: 'Morning!',
      id: '456',
    };

    const newProps2: Partial<Greeting> = {
      greeting: 'Howdy',
    };
    expect(updateActionFromPayload(org, newProps)).toBe(false);
    expect(updateActionFromPayload(org, newProps2)).toBe(false);
  });

  it('updates object with new props if id matches', () => {
    const newProps: Partial<Greeting> = {
      greeting: 'Morning!',
      id: '123',
      type: 'Daytime Greeting',
    };
    updateActionFromPayload(org, newProps);
    expect(org).toEqual({...org, greeting: 'Morning!', type: 'Daytime Greeting'});
  });
});

describe('getMergedProps', () => {
  it('returns shallow merged object if deepMerge results in undefined', () => {
    jest.spyOn(DeepMerge, 'default').mockImplementationOnce(jest.fn().mockReturnValue(undefined));
    const result = getMergedProps(
      {label: 'test', component: {type: 'some type'}},
      {label: 'updated', component: {something: 'a'}},
    );
    expect(result).toEqual({
      component: {something: 'a'},
      label: 'updated',
    });
  });

  it('returns deep merged object', () => {
    const result = getMergedProps(
      {label: 'test', component: {type: 'some type'}},
      {label: 'updated', component: {something: 'a'}},
    );
    expect(result).toEqual({
      label: 'updated',
      component: {type: 'some type', something: 'a'},
    });
  });
});

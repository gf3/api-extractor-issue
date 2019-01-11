import {ClientApplication} from '../../client';
import {createMockApp} from 'test/helper';
import mergeProps from '../merge';
import {Button} from '../Button';
import {ButtonGroup} from '../ButtonGroup';

describe('mergeProps', () => {
  it('should update existing nested props and add new nested props', () => {
    const org = {
      attributes: {
        component: {
          group: {
            subgroup: {
              subSubGroup: {
                a: 1,
                b: 2,
              },
            },
          },
          id: '123',
        },
        type: 'My Type',
      },
      name: 'A',
    };
    const newProps = {
      attributes: {
        component: {
          id: '234',
        },
        options: {
          a: 1,
          b: 2,
          c: {
            name: 'C',
          },
        },
      },
      name: 'B',
    };
    const result = mergeProps(org, newProps);
    expect(result).toEqual({
      attributes: {
        component: {
          group: {
            subgroup: {
              subSubGroup: {
                a: 1,
                b: 2,
              },
            },
          },
          id: '234',
        },
        options: {
          a: 1,
          b: 2,
          c: {
            name: 'C',
          },
        },
        type: 'My Type',
      },
      name: 'B',
    });
  });

  it('should merge updated props with value set to undefined', () => {
    const org = {
      attributes: {
        component: {
          group: {
            subgroup: {
              subSubGroup: {
                a: 1,
                b: 2,
              },
            },
          },
          id: '123',
        },
        type: 'My Type',
      },
      name: 'A',
    };
    const newProps = {
      attributes: {
        component: {
          group: {
            subgroup: undefined,
          },
        },
        options: {
          a: 1,
          b: 2,
        },
      },
      name: 'B',
    };
    const result = mergeProps(org, newProps);
    expect(result).toEqual({
      attributes: {
        component: {
          group: {
            subgroup: undefined,
          },
          id: '123',
        },
        options: {
          a: 1,
          b: 2,
        },
        type: 'My Type',
      },
      name: 'B',
    });
  });

  it('should replace entire array when updating props', () => {
    const org = {
      attributes: {
        component: {
          groups: [
            {
              name: 'X',
            },
            {
              name: 'Y',
            },
            {
              name: 'Z',
            },
          ],
          id: '123',
        },
        type: 'My Type',
      },
      name: 'A',
    };
    const newProps = {
      attributes: {
        component: {
          groups: [
            {
              name: 'ZZZ',
            },
          ],
        },
        options: {
          a: 1,
          b: 2,
        },
      },
      name: 'B',
    };
    const result = mergeProps(org, newProps);
    expect(result).toEqual({
      attributes: {
        component: {
          groups: [
            {
              name: 'ZZZ',
            },
          ],
          id: '123',
        },
        options: {
          a: 1,
          b: 2,
        },
        type: 'My Type',
      },
      name: 'B',
    });
  });

  it('should merge complex objects without cloning', () => {
    const app = createMockApp();
    const button1 = new Button(app, {label: 'Button A', disabled: true});
    const button2 = new Button(app, {label: 'Button B', disabled: false});
    const button3 = new Button(app, {label: 'Button A - New', disabled: false});
    const button4 = new Button(app, {label: 'Brand new button', disabled: false});
    const buttonGroup = new ButtonGroup(app, {label: 'Button C', disabled: true, buttons: []});

    const org = {
      buttonA: button1,
      buttonB: button2,
      buttonC: button4,
      name: '123',
    };
    const newProps = {
      buttonA: button3,
      buttonB: buttonGroup,
      name: '456',
    };
    const result = mergeProps(org, newProps);
    expect(result).toEqual({
      buttonA: button3,
      buttonB: buttonGroup,
      buttonC: button4,
      name: '456',
    });
    expect(result.buttonA).toBe(button3);
    expect(result.buttonB).toBe(buttonGroup);
    expect(result.buttonC).toBe(button4);
  });

  it('should merge new props when existing object is not defined', () => {
    const newProps = {
      name: 'A',
    };
    const result = mergeProps(undefined, newProps);
    expect(result).toEqual(newProps);
  });
});

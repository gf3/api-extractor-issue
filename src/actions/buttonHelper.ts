import {Action as ButtonAction, Button, Payload} from '../actions/Button';
import {ActionSetWithChildren} from './helper';

/**
 * @internal
 */
export function getSingleButton(
  action: ActionSetWithChildren,
  button: Button,
  subgroups: string[],
  updateCb: (newPayload: Payload) => void,
): Payload {
  action.addChild(button, action.group, subgroups);

  action.subscribeToChild(button, ButtonAction.UPDATE, updateCb);

  return button.payload;
}

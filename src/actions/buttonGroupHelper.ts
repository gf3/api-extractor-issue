import {Payload as ButtonPayload} from '../actions/Button';
import {
  Action as ButtonGroupAction,
  ButtonGroup,
  Payload as ButtonGroupPayload,
} from '../actions/ButtonGroup';
import {ActionSetWithChildren} from './helper';

/**
 * @internal
 */
export function getGroupedButton(
  action: ActionSetWithChildren,
  button: ButtonGroup,
  subgroups: string[],
  updateCb: (newPayload: ButtonPayload | ButtonGroupPayload) => void,
): ButtonGroupPayload {
  action.addChild(button, action.group, subgroups);

  const {id, label, disabled, buttons} = button;

  action.subscribeToChild(button, ButtonGroupAction.UPDATE, updateCb);

  return {id, label, buttons, disabled};
}

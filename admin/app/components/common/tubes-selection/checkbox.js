import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class TubesSelectionCheckbox extends Component {
  @action
  updateState(element) {
    if (this.args.state === 'checked') {
      element.checked = true;
      element.indeterminate = false;
    } else if (this.args.state === 'indeterminate') {
      element.checked = false;
      element.indeterminate = true;
    } else {
      element.checked = false;
      element.indeterminate = false;
    }
  }
}

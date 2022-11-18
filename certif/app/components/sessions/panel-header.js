import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class PanelHeader extends Component {
  @service fileSaver;
  @service session;
  @service featureToggles;
  @service notifications;

  get shouldRenderImportTemplateButton() {
    return this.featureToggles.featureToggles.isMassiveSessionManagementEnabled;
  }

  @action
  async downloadSessionImportTemplate() {
    const url = '/api/sessions/import';
    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch (e) {
      this.notifications.error("Une erreur s'est produite pendant le téléchargement");
    }
  }
}

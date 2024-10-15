import PixButton from '@1024pix/pix-ui/components/pix-button';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';

export default class OrganizationInvitations extends Component {
  @service accessControl;

  get sortedInvitations() {
    return this.args.invitations.sortBy('updatedAt').reverse();
  }

  <template>
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">Invitations</h2>
      </header>
      <div class="content-text content-text--small">
        <div class="table-admin">
          {{#if this.sortedInvitations}}
            <table>
              <thead>
                <tr>
                  <th>Adresse e-mail</th>
                  <th>Rôle</th>
                  <th>Date de dernier envoi</th>
                  {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
                    <th>Actions</th>
                  {{/if}}
                </tr>
              </thead>
              <tbody>
                {{#each this.sortedInvitations as |invitation|}}
                  <tr aria-label="Invitation en attente de {{invitation.email}}">
                    <td>{{invitation.email}}</td>
                    <td>{{invitation.roleInFrench}}</td>
                    <td>{{dayjsFormat invitation.updatedAt "DD/MM/YYYY [-] HH:mm"}}</td>
                    {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
                      <td>
                        <PixButton
                          @size="small"
                          @variant="error"
                          class="organization-invitations-actions__button"
                          aria-label="Annuler l’invitation de {{invitation.email}}"
                          @triggerAction={{fn @onCancelOrganizationInvitation invitation}}
                          @iconBefore="delete"
                        >
                          Annuler l’invitation
                        </PixButton>
                      </td>
                    {{/if}}
                  </tr>
                {{/each}}
              </tbody>
            </table>
          {{/if}}
          {{#unless this.sortedInvitations}}
            <p class="organization-invitations__message">Aucune invitation en attente</p>
          {{/unless}}
        </div>
      </div>
    </section>
  </template>
}

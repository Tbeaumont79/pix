import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

import StateTag from './state-tag';

export default class TrainingListSummaryItems extends Component {
  searchedId = this.args.id;
  searchedTitle = this.args.title;

  <template>
    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <caption class="screen-reader-only">Liste des contenus formatifs</caption>
          <thead>
            <tr>
              <th class="table__column table__column--id" id="training-id" scope="col">ID</th>
              <th id="training-titre" scope="col">Titre</th>
              <th id="training-prerequisite-threshold" scope="col" class="col-status">Prérequis</th>
              <th id="training-goal-threshold" scope="col" class="col-status">Objectif à ne pas dépasser</th>
              <th id="training-target-profile-count" scope="col" class="col-status">Profils cibles associés</th>
              <th id="training-state" scope="col" class="col-status">État</th>
            </tr>
            {{#if @triggerFiltering}}
              <tr>
                <td class="table__column table__column--id">
                  <PixInput
                    type="text"
                    value={{this.searchedId}}
                    oninput={{fn @triggerFiltering "id"}}
                    aria-label="Filtrer les contenus formatifs par un id"
                  />
                </td>
                <td>
                  <PixInput
                    type="text"
                    value={{this.searchedTitle}}
                    oninput={{fn @triggerFiltering "title"}}
                    aria-label="Filtrer les contenus formatifs par un titre"
                  />
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            {{/if}}
          </thead>

          {{#if @summaries}}
            <tbody>
              {{#each @summaries as |summary|}}
                <tr aria-label="Contenu formatif">
                  <td headers="training-id" class="table__column table__column--id">{{summary.id}}</td>
                  <td headers="training-title">
                    <LinkTo @route="authenticated.trainings.training" @model={{summary.id}}>
                      {{summary.title}}
                    </LinkTo>
                  </td>
                  <td headers="training-prerequisite-threshold">
                    {{summary.prerequisiteThreshold}}
                  </td>
                  <td headers="training-goal-threshold">
                    {{summary.goalThreshold}}
                  </td>
                  <td headers="training-target-profiles-count">
                    {{summary.targetProfilesCount}}
                  </td>
                  <td headers="training-state">
                    <StateTag @isDisabled={{summary.isDisabled}} />
                  </td>
                </tr>
              {{/each}}
            </tbody>
          {{/if}}
        </table>

        {{#unless @summaries}}
          <div class="table__empty">Aucun résultat</div>
        {{/unless}}
      </div>
    </div>

    {{#if @summaries}}
      <PixPagination @pagination={{@summaries.meta.pagination}} />
    {{/if}}
  </template>
}

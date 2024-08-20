import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { LinkTo } from '@ember/routing';

<template>
  <div class="content-text content-text--small">
    <table class="table-admin">
      <thead>
        <tr>
          <th class="table__column table__column--id">ID</th>
          <th>Prénom</th>
          <th>Nom</th>
          <th>Adresse e-mail</th>
          <th>Identifiant</th>
        </tr>
      </thead>

      {{#if @users}}
        <tbody>
          {{#each @users as |user|}}
            <tr aria-label="Informations de l'utilisateur {{user.firstName}} {{user.lastName}}">
              <td class="table__column table__column--id">
                <LinkTo @route="authenticated.users.get" @model={{user.id}}>
                  {{user.id}}
                </LinkTo>
              </td>
              <td>{{user.firstName}}</td>
              <td>{{user.lastName}}</td>
              <td>{{user.email}}</td>
              <td>{{user.username}}</td>
            </tr>
          {{/each}}
        </tbody>
      {{/if}}
    </table>

    {{#unless @users}}
      <div class="table__empty">Aucun résultat</div>
    {{/unless}}
  </div>

  {{#if @users}}
    <PixPagination @pagination={{@users.meta}} />
  {{/if}}
</template>

import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';

<template>
  <PixModal
    @title="Déplacer la méthode de connexion"
    @onCloseButtonClick={{fn @toggleReassignOidcAuthenticationMethodModal null}}
    @showModal={{@isDisplayed}}
  >
    <:content>
      <p class="reassign-authentication-method-modal__form-body__information">
        Vous vous apprêtez à déplacer la méthode
        {{@oidcAuthenticationMethod.name}}
        sur un autre utilisateur. Cela signifie qu'elle n'existera plus pour cet utilisateur.
      </p>
      <PixInput
        @id="user-id-for-reassign-authentication-method"
        {{on "change" @onChangeTargetUserId}}
        type="number"
        required
      >
        <:label>Id de l'utilisateur à qui vous souhaitez ajouter la méthode de connexion</:label>
      </PixInput>
    </:content>

    <:footer>
      <PixButton
        @size="small"
        @variant="secondary"
        @triggerAction={{fn @toggleReassignOidcAuthenticationMethodModal null}}
      >Annuler</PixButton>
      <PixButton
        @type="submit"
        @size="small"
        @triggerAction={{fn @submitReassignOidcAuthenticationMethod @oidcAuthenticationMethod.code}}
      >
        Valider le déplacement
      </PixButton>

    </:footer>
  </PixModal>
</template>

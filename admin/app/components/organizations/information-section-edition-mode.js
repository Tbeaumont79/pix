import Object, { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { validator, buildValidations } from 'ember-cp-validations';
import { getOwner } from '@ember/application';

const Validations = buildValidations({
  name: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'Le nom ne peut pas être vide',
      }),
      validator('length', {
        min: 1,
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères',
      }),
    ],
  },
  externalId: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: "La longueur de l'identifiant externe ne doit pas excéder 255 caractères",
      }),
    ],
  },
  provinceCode: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: 'La longueur du département ne doit pas excéder 255 caractères',
      }),
    ],
  },
  email: {
    validators: [
      validator('length', {
        max: 255,
        message: "La longueur de l'email ne doit pas excéder 255 caractères.",
      }),
      validator('format', {
        allowBlank: true,
        type: 'email',
        message: "L'e-mail n'a pas le bon format.",
      }),
    ],
  },
  credit: {
    validators: [
      validator('number', {
        allowString: true,
        integer: true,
        positive: true,
        message: 'Le nombre de crédits doit être un nombre supérieur ou égal à 0.',
      }),
    ],
  },
  isManagingStudents: {
    validators: [
      validator('inclusion', {
        in: [true, false],
      }),
    ],
  },
  documentationUrl: {
    validators: [
      validator('absolute-url', {
        allowBlank: true,
        message: "Le lien n'est pas valide.",
      }),
    ],
  },
  showSkills: {
    validators: [
      validator('inclusion', {
        in: [true, false],
      }),
    ],
  },
});

class Form extends Object.extend(Validations) {
  @tracked name;
  @tracked externalId;
  @tracked provinceCode;
  @tracked email;
  @tracked credit;
  @tracked isManagingStudents;
  @tracked documentationUrl;
  @tracked showSkills;
}

export default class OrganizationInformationSectionEditionMode extends Component {
  @service accessControl;
  @tracked isEditMode = false;
  @tracked showArchivingConfirmationModal = false;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
    this._initForm();
  }

  @action
  closeAndResetForm() {
    this.args.toggleEditMode();
    this._initForm();
  }

  @action
  async updateOrganization(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }

    this.args.organization.set('name', this.form.name);
    this.args.organization.set('externalId', this.form.externalId);
    this.args.organization.set('provinceCode', this.form.provinceCode);
    this.args.organization.set('email', this.form.email);
    this.args.organization.set('credit', this.form.credit);
    this.args.organization.set('isManagingStudents', this.form.isManagingStudents);
    this.args.organization.set('documentationUrl', this.form.documentationUrl);
    this.args.organization.set('showSkills', this.form.showSkills);

    this.closeAndResetForm();
    return this.args.onSubmit();
  }

  _initForm() {
    this.form.name = this.args.organization.name;
    this.form.externalId = this.args.organization.externalId;
    this.form.provinceCode = this.args.organization.provinceCode;
    this.form.email = this.args.organization.email;
    this.form.credit = this.args.organization.credit;
    this.form.isManagingStudents = this.args.organization.isManagingStudents;
    this.form.documentationUrl = this.args.organization.documentationUrl;
    this.form.showSkills = this.args.organization.showSkills;
  }
}

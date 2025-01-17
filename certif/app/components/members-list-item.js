import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const ARIA_LABEL_MEMBER_TRANSLATION = 'pages.team.members.actions.select-role.options.member';
const ARIA_LABEL_ADMIN_TRANSLATION = 'pages.team.members.actions.select-role.options.admin';

export default class MembersListItem extends Component {
  @service currentUser;
  @service pixToast;
  @service intl;
  @tracked isEditionMode = false;

  roleOptions = [
    {
      value: 'ADMIN',
      label: this.intl.t(ARIA_LABEL_ADMIN_TRANSLATION),
      disabled: false,
    },
    {
      value: 'MEMBER',
      label: this.intl.t(ARIA_LABEL_MEMBER_TRANSLATION),
      disabled: false,
    },
  ];

  displayRoleByOrganizationRole = {
    ADMIN: this.intl.t(ARIA_LABEL_ADMIN_TRANSLATION),
    MEMBER: this.intl.t(ARIA_LABEL_MEMBER_TRANSLATION),
  };

  get shouldDisplayManagingColumn() {
    return this.currentUser.isAdminOfCurrentCertificationCenter;
  }

  get shouldDisplayMemberManageButton() {
    return this.shouldDisplayChangeRoleOption || this.shouldDisplayLeaveCertificationCenterOption;
  }

  get shouldDisplayChangeRoleOption() {
    if (this.isCurrentUserMembership) {
      return false;
    }

    if (!this.currentUser.isAdminOfCurrentCertificationCenter) {
      return false;
    }

    return !this.isEditionMode;
  }

  get shouldDisplayLeaveCertificationCenterOption() {
    return this.args.isMultipleAdminsAvailable && this.isCurrentUserMembership;
  }

  get isCurrentUserMembership() {
    return this.currentUser.certificationPointOfContact.id === this.args.member.id;
  }

  @action
  setRoleSelection(value) {
    this.args.member.role = value;
  }

  @action
  toggleEditionMode() {
    this.isEditionMode = true;
  }

  @action
  async updateMember(member) {
    this.isEditionMode = false;
    try {
      await member.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.team.members.notifications.change-member-role.success'),
      });
    } catch (e) {
      member.rollbackAttributes();
      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.team.members.notifications.change-member-role.error'),
      });
    }
  }

  @action
  cancelUpdateRoleOfMember() {
    this.isEditionMode = false;
    this.args.member.rollbackAttributes();
  }
}

import lodash from 'lodash';

import { STUDENT_RECONCILIATION_ERRORS } from '../../../../shared/domain/constants.js';
import {
  CampaignCodeError,
  OrganizationLearnerAlreadyLinkedToUserError,
  UserShouldNotBeReconciledOnAnotherAccountError,
} from '../../../../shared/domain/errors.js';

const { isEmpty } = lodash;

const reconcileScoOrganizationLearnerManually = async function ({
  campaignCode,
  reconciliationInfo,
  withReconciliation,
  campaignRepository,
  libOrganizationLearnerRepository,
  organizationLearnerRepository,
  registrationOrganizationLearnerRepository,
  studentRepository,
  userRepository,
  obfuscationService,
  userReconciliationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const organizationLearnerOfUserAccessingCampaign =
    await userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo({
      organizationId: campaign.organizationId,
      reconciliationInfo,
      organizationLearnerRepository: libOrganizationLearnerRepository,
    });

  await userReconciliationService.assertStudentHasAnAlreadyReconciledAccount(
    organizationLearnerOfUserAccessingCampaign,
    userRepository,
    obfuscationService,
    studentRepository,
  );

  await _checkIfAnotherStudentIsAlreadyReconciledWithTheSameOrganizationAndUser(
    reconciliationInfo.id,
    campaign.organizationId,
    registrationOrganizationLearnerRepository,
  );

  await _checkIfUserIsConnectedOnAnotherAccount({
    organizationLearnerOfUserAccessingCampaign,
    authenticatedUserId: reconciliationInfo.id,
    libOrganizationLearnerRepository,
  });

  if (withReconciliation) {
    return organizationLearnerRepository.reconcileUserToOrganizationLearner({
      userId: reconciliationInfo.id,
      organizationLearnerId: organizationLearnerOfUserAccessingCampaign.id,
    });
  }
};

export { reconcileScoOrganizationLearnerManually };

async function _checkIfAnotherStudentIsAlreadyReconciledWithTheSameOrganizationAndUser(
  userId,
  organizationId,
  registrationOrganizationLearnerRepository,
) {
  const organizationLearnerFound = await registrationOrganizationLearnerRepository.findOneByUserIdAndOrganizationId({
    userId,
    organizationId,
  });

  if (organizationLearnerFound) {
    const detail = 'Un autre étudiant est déjà réconcilié dans la même organisation et avec le même compte utilisateur';
    const error = STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_SAME_ORGANIZATION.anotherStudentIsAlreadyReconciled;
    const meta = {
      shortCode: error.shortCode,
    };
    throw new OrganizationLearnerAlreadyLinkedToUserError(detail, error.code, meta);
  }
}

async function _checkIfUserIsConnectedOnAnotherAccount({
  organizationLearnerOfUserAccessingCampaign,
  authenticatedUserId,
  libOrganizationLearnerRepository,
}) {
  const loggedAccountReconciledOrganizationLearners = await libOrganizationLearnerRepository.findByUserId({
    userId: authenticatedUserId,
  });

  const loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds =
    loggedAccountReconciledOrganizationLearners.filter(
      (organizationLearner) => !!organizationLearner.nationalStudentId,
    );

  if (isEmpty(loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds)) {
    return;
  }

  const isUserNationalStudentIdDifferentFromLoggedAccount =
    loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds.every(
      (organizationLearner) =>
        organizationLearner.nationalStudentId !== organizationLearnerOfUserAccessingCampaign.nationalStudentId,
    );

  if (isUserNationalStudentIdDifferentFromLoggedAccount) {
    const isUserBirthdayDifferentFromLoggedAccount =
      loggedAccountReconciledOrganizationLearnersWithoutNullNationalStudentIds.every(
        (organizationLearner) => organizationLearner.birthdate !== organizationLearnerOfUserAccessingCampaign.birthdate,
      );

    if (isUserBirthdayDifferentFromLoggedAccount) {
      const error = STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.ACCOUNT_BELONGING_TO_ANOTHER_USER;
      const meta = {
        shortCode: error.shortCode,
      };
      throw new UserShouldNotBeReconciledOnAnotherAccountError({ code: error.code, meta });
    }
  }
}

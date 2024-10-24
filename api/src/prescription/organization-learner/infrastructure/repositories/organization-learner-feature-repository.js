import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { OrganizationLearner } from '../../domain/read-models/OrganizationLearner.js';

async function getOrganizationLearnersByFeature({ organizationId, featureKey }) {
  const knexConn = DomainTransaction.getConnection();
  const rawOrganizationLearnerFeatures = await knexConn
    .select('organization-learners.*')
    .from('organization-learners')
    .join(
      'organization-learner-features',
      'organization-learner-features.organizationLearnerId',
      'organization-learners.id',
    )
    .join('features', 'features.id', 'organization-learner-features.featureId')
    .where({ key: featureKey, organizationId });

  return rawOrganizationLearnerFeatures.map(
    (rawOrganizationLearnerFeature) => new OrganizationLearner(rawOrganizationLearnerFeature),
  );
}

export { getOrganizationLearnersByFeature };

import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';

const TARGET_PROFILE_TABLE_NAME = 'target-profiles';
const TARGET_PROFILE_TUBES_TABLE_NAME = 'target-profile_tubes';

const update = async function (targetProfile, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConn = domainTransaction?.knexTransaction || (await knex.transaction());

  const {
    id: targetProfileId,
    name,
    imageUrl,
    description,
    comment,
    category,
    areKnowledgeElementsResettable,
  } = targetProfile;

  await knexConn(TARGET_PROFILE_TABLE_NAME).where({ id: targetProfileId }).update({
    name,
    imageUrl,
    description,
    comment,
    category,
    areKnowledgeElementsResettable,
  });

  if (targetProfile.tubes?.length > 0) {
    const tubesData = targetProfile.tubes.map((tube) => ({
      targetProfileId,
      tubeId: tube.id,
      level: tube.level,
    }));

    await knexConn(TARGET_PROFILE_TUBES_TABLE_NAME).delete().where({ targetProfileId });
    await knexConn(TARGET_PROFILE_TUBES_TABLE_NAME).insert(tubesData);
  }

  if (!domainTransaction?.knexTransaction) {
    await knexConn.commit();
  }
};

export { update };

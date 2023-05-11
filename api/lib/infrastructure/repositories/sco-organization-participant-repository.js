const _ = require('lodash');
const { filterByFullName } = require('../utils/filter-utils.js');

const AuthenticationMethod = require('../../domain/models/AuthenticationMethod.js');
const { knex } = require('../../../db/knex-database-connection.js');
const { fetchPage } = require('../utils/knex-utils.js');
const ScoOrganizationParticipant = require('../../domain/read-models/ScoOrganizationParticipant.js');
const CampaignTypes = require('../../domain/models/CampaignTypes.js');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses.js');

function _setFilters(qb, { search, divisions, connectionTypes, certificability } = {}) {
  if (search) {
    filterByFullName(
      qb,
      search,
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName'
    );
  }
  if (!_.isEmpty(divisions)) {
    qb.whereIn('division', divisions);
  }
  if (!_.isEmpty(connectionTypes)) {
    qb.where(function () {
      if (connectionTypes.includes('none')) {
        this.orWhere(function () {
          this.whereRaw('"users"."username" IS NULL');
          this.whereRaw('"users"."email" IS NULL');
          // we only retrieve GAR authentication method in join clause
          this.whereRaw('"authentication-methods"."externalIdentifier" IS NULL');
        });
      }
      if (connectionTypes.includes('identifiant')) {
        this.orWhereRaw('"users"."username" IS NOT NULL');
      }
      if (connectionTypes.includes('email')) {
        this.orWhereRaw('"users"."email" IS NOT NULL');
      }
      if (connectionTypes.includes('mediacentre')) {
        // we only retrieve GAR authentication method in join clause
        this.orWhereRaw('"authentication-methods"."externalIdentifier" IS NOT NULL');
      }
    });
  }
  if (certificability) {
    qb.where(function (query) {
      query.whereInArray('subquery.isCertifiable', certificability);
      if (certificability.includes(null)) {
        query.orWhereRaw('"subquery"."isCertifiable" IS NULL');
      }
    });
  }
}

function _buildIsCertifiable(queryBuilder, organizationId) {
  queryBuilder
    .distinct('view-active-organization-learners.id')
    .select([
      'view-active-organization-learners.id as organizationLearnerId',
      knex.raw(
        'FIRST_VALUE("isCertifiable") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "isCertifiable"'
      ),
      knex.raw(
        'FIRST_VALUE("sharedAt") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "certifiableAt"'
      ),
    ])
    .from('view-active-organization-learners')
    .join(
      'campaign-participations',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId'
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.status', CampaignParticipationStatuses.SHARED)
    .where('campaigns.type', CampaignTypes.PROFILES_COLLECTION)
    .where('view-active-organization-learners.organizationId', organizationId)
    .where('campaigns.organizationId', organizationId)
    .where('campaign-participations.deletedAt', null);
}

module.exports = {
  async findPaginatedFilteredScoParticipants({ organizationId, filter, page = {}, sort = {} }) {
    const { totalScoParticipants } = await knex
      .count('id', { as: 'totalScoParticipants' })
      .from('view-active-organization-learners')
      .where({ organizationId: organizationId, isDisabled: false })
      .first();

    const orderByClause = [
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.id',
    ];
    if (sort?.participationCount) {
      orderByClause.unshift({
        column: 'participationCount',
        order: sort.participationCount == 'desc' ? 'desc' : 'asc',
      });
    }
    if (sort?.lastnameSort) {
      orderByClause.unshift({
        column: 'view-active-organization-learners.lastName',
        order: sort.lastnameSort == 'desc' ? 'desc' : 'asc',
      });
    }

    const query = knex
      .with('subquery', (qb) => _buildIsCertifiable(qb, organizationId))
      .distinct('view-active-organization-learners.id')
      .select([
        'view-active-organization-learners.id',
        'view-active-organization-learners.firstName',
        'view-active-organization-learners.lastName',
        knex.raw('LOWER("view-active-organization-learners"."firstName") AS "lowerFirstName"'),
        knex.raw('LOWER("view-active-organization-learners"."lastName") AS "lowerLastName"'),
        'view-active-organization-learners.birthdate',
        'view-active-organization-learners.division',
        'view-active-organization-learners.userId',
        'view-active-organization-learners.organizationId',
        'users.username',
        'users.email',
        'authentication-methods.externalIdentifier as samlId',
        'subquery.isCertifiable',
        'subquery.certifiableAt',
        knex.raw(
          'FIRST_VALUE("name") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignName"'
        ),
        knex.raw(
          'FIRST_VALUE("campaign-participations"."status") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "participationStatus"'
        ),
        knex.raw(
          'FIRST_VALUE("type") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignType"'
        ),
        knex.raw(
          'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "view-active-organization-learners"."id") AS "participationCount"'
        ),
        knex.raw(
          'max("campaign-participations"."createdAt") OVER(PARTITION BY "view-active-organization-learners"."id") AS "lastParticipationDate"'
        ),
      ])
      .from('view-active-organization-learners')
      .leftJoin('subquery', 'subquery.organizationLearnerId', 'view-active-organization-learners.id')
      .leftJoin('campaign-participations', function () {
        this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id')
          .andOn('campaign-participations.isImproved', '=', knex.raw('false'))
          .andOn('campaign-participations.deletedAt', knex.raw('is'), knex.raw('null'));
      })
      .leftJoin('users', 'users.id', 'view-active-organization-learners.userId')
      .leftJoin('authentication-methods', function () {
        this.on('users.id', 'authentication-methods.userId').andOnVal(
          'authentication-methods.identityProvider',
          AuthenticationMethod.identityProviders.GAR
        );
      })
      .leftJoin('campaigns', function () {
        this.on('campaigns.id', 'campaign-participations.campaignId').andOn(
          'campaigns.organizationId',
          'view-active-organization-learners.organizationId'
        );
      })
      .where('view-active-organization-learners.isDisabled', false)
      .where('view-active-organization-learners.organizationId', organizationId)
      .modify(_setFilters, filter)
      .orderBy(orderByClause);

    const { results, pagination } = await fetchPage(query, page);

    const scoOrganizationParticipants = results.map((result) => {
      return new ScoOrganizationParticipant({
        ...result,
        isAuthenticatedFromGAR: !!result.samlId,
      });
    });
    return {
      data: scoOrganizationParticipants,
      meta: { ...pagination, participantCount: totalScoParticipants },
    };
  },
};

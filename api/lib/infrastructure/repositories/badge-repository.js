const { knex } = require('../bookshelf');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const BookshelfBadge = require('../orm-models/Badge');
const Badge = require('../../domain/models/Badge');
const omit = require('lodash/omit');
const bookshelfUtils = require('../utils/knex-utils');
const { AlreadyExistingEntityError } = require('../../domain/errors');

const TABLE_NAME = 'badges';

module.exports = {

  findByTargetProfileId(targetProfileId) {
    return BookshelfBadge
      .where({ targetProfileId })
      .fetchAll({
        require: false,
        withRelated: ['badgeCriteria', 'badgePartnerCompetences'],
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfBadge, results));
  },

  findByCampaignId(campaignId) {
    return BookshelfBadge
      .query((qb) => {
        qb.join('target-profiles', 'target-profiles.id', 'badges.targetProfileId');
        qb.join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
      })
      .where('campaigns.id', campaignId)
      .fetchAll({
        require: false,
        withRelated: ['badgeCriteria', 'badgePartnerCompetences'],
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfBadge, results));
  },

  findByCampaignParticipationId(campaignParticipationId) {
    return BookshelfBadge
      .query((qb) => {
        qb.join('target-profiles', 'target-profiles.id', 'badges.targetProfileId');
        qb.join('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
        qb.join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id');
      })
      .where('campaign-participations.id', campaignParticipationId)
      .fetchAll({
        require: false,
        withRelated: ['badgeCriteria', 'badgePartnerCompetences'],
      })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfBadge, results));
  },

  async get(id) {
    const bookshelfBadge = await BookshelfBadge
      .where('id', id)
      .fetch({
        withRelated: ['badgeCriteria', 'badgePartnerCompetences'],
      });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, bookshelfBadge);
  },

  async getByKey(key) {
    const bookshelfBadge = await BookshelfBadge
      .where({ key })
      .fetch({
        withRelated: ['badgeCriteria', 'badgePartnerCompetences'],
      });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfBadge, bookshelfBadge);
  },

  async save(badge) {
    try {
      const [savedBadge] = await knex(TABLE_NAME).insert(_adaptModelToDb(badge)).returning('*');
      return new Badge(savedBadge);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError(`The badge key ${badge.key} already exists`);
      }
      throw err;
    }
  },

  async isKeyAvailable(key) {
    const result = await knex(TABLE_NAME).select('key').where('key', key);
    if (result.length) {
      throw new AlreadyExistingEntityError(`The badge key ${key} already exists`);
    }
    return true;
  },
};

function _adaptModelToDb(badge) {
  return omit(badge, [
    'id',
    'badgeCriteria',
    'badgePartnerCompetences',
  ]);
}

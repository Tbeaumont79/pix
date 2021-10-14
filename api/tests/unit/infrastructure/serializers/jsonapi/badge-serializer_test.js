const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/badge-serializer');
const BadgeCriterion = require('../../../../../lib/domain/models/BadgeCriterion');

describe('Unit | Serializer | JSONAPI | badge-serializer', function () {
  describe('#serialize', function () {
    it('should convert a Badge model object into JSON API data', function () {
      // given
      const badge = domainBuilder.buildBadge({
        id: '1',
        altMessage: 'You won a banana badge',
        imageUrl: '/img/banana.svg',
        message: 'Congrats, you won a banana badge',
        key: 'BANANA',
        title: 'Banana',
        targetProfileId: '1',
        isCertifiable: false,
        isAlwaysVisible: true,
        badgeCriteria: [domainBuilder.buildBadgeCriterion({ skillSetIds: null })],
        badgePartnerCompetences: [],
      });

      const expectedSerializedBadge = {
        data: {
          attributes: {
            'alt-message': 'You won a banana badge',
            'image-url': '/img/banana.svg',
            'is-certifiable': false,
            'is-always-visible': true,
            message: 'Congrats, you won a banana badge',
            title: 'Banana',
            key: 'BANANA',
          },
          id: '1',
          type: 'badges',
        },
      };

      // when
      const json = serializer.serialize(badge);

      // then
      expect(json).to.deep.equal(expectedSerializedBadge);
    });

    it('should convert a Badge model with badge partner competence object into JSON API data', function () {
      // given
      const badge = domainBuilder.buildBadge({
        id: '1',
        altMessage: 'You won a banana badge',
        imageUrl: '/img/banana.svg',
        message: 'Congrats, you won a banana badge',
        key: 'BANANA',
        title: 'Banana',
        targetProfileId: '1',
        isCertifiable: false,
        isAlwaysVisible: true,
      });

      const expectedSerializedBadge = {
        data: {
          attributes: {
            'alt-message': 'You won a banana badge',
            'image-url': '/img/banana.svg',
            'is-certifiable': false,
            'is-always-visible': true,
            message: 'Congrats, you won a banana badge',
            title: 'Banana',
            key: 'BANANA',
          },
          id: '1',
          type: 'badges',
        },
      };

      // when
      const json = serializer.serialize(badge);

      // then
      expect(json).to.deep.equal(expectedSerializedBadge);
    });

    it('should convert a Badge model and scope with every partner competence badge criteria scope into JSON API data', function () {
      // given
      const badge = domainBuilder.buildBadge({
        id: '1',
        altMessage: 'You won a banana badge',
        imageUrl: '/img/banana.svg',
        message: 'Congrats, you won a banana badge',
        key: 'BANANA',
        title: 'Banana',
        targetProfileId: '1',
        isCertifiable: false,
        isAlwaysVisible: true,
        badgeCriteria: [
          domainBuilder.buildBadgeCriterion({
            scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
            threshold: 40,
            skillSetIds: [],
          }),
        ],
      });

      const expectedSerializedBadge = {
        data: {
          attributes: {
            'alt-message': 'You won a banana badge',
            'image-url': '/img/banana.svg',
            'is-certifiable': false,
            'is-always-visible': true,
            message: 'Congrats, you won a banana badge',
            title: 'Banana',
            key: 'BANANA',
          },
          id: '1',
          type: 'badges',
        },
      };

      // when
      const json = serializer.serialize(badge);

      // then
      expect(json).to.deep.equal(expectedSerializedBadge);
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API data into a Badge model object', function () {
      // given
      const jsonBadge = {
        data: {
          type: 'badges',
          attributes: {
            key: 'BADGE_KEY',
            'alt-message': 'alt-message',
            'image-url': 'https://example.net/image.svg',
            message: 'message',
            title: 'title',
            'is-certifiable': false,
            'is-always-visible': true,
          },
        },
      };

      // when
      const badge = serializer.deserialize(jsonBadge);

      // then
      const expectedBadge = {
        key: 'BADGE_KEY',
        altMessage: 'alt-message',
        imageUrl: 'https://example.net/image.svg',
        message: 'message',
        title: 'title',
        isCertifiable: false,
        isAlwaysVisible: true,
      };
      expect(badge).to.deep.equal(expectedBadge);
    });
  });
});

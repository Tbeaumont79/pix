import { OrganizationFeaturesDTO } from '../../../../../src/organizational-entities/application/api/OrganizationFeaturesDTO.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | application | API | OrganizationFeaturesDTO', function () {
  describe('#hasLeanersImportFeature', function () {
    it('should return true', function () {
      const organizationFeature = new OrganizationFeaturesDTO({
        features: [{ name: ORGANIZATION_FEATURE.LEARNER_IMPORT.key }],
      });

      expect(organizationFeature.hasLeanersImportFeature).to.be.true;
    });

    it('should return false', function () {
      const organizationFeature = new OrganizationFeaturesDTO({ features: [] });

      expect(organizationFeature.hasLeanersImportFeature).to.be.false;
    });
  });
});

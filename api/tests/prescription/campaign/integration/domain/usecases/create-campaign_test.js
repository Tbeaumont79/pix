import { expect, databaseBuilder, mockLearningContent } from '../../../../../test-helper.js';
import _ from 'lodash';

import * as campaignAdministrationRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-administration-repository.js';
import * as campaignCreatorRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-creator-repository.js';

import { createCampaign } from '../../../../../../src/prescription/campaign/domain/usecases/create-campaign.js';
import { Campaign } from '../../../../../../src/prescription/campaign/domain/read-models/Campaign.js';
import { CampaignTypes } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignTypes.js';

import * as codeGenerator from '../../../../../../lib/domain/services/code-generator.js';

describe('Integration | UseCases | create-campaign', function () {
  let userId;
  let organizationId;
  let targetProfileId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;

    targetProfileId = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId }).id;

    databaseBuilder.factory.buildMembership({
      organizationId,
      userId,
    });

    await databaseBuilder.commit();

    const learningContent = {
      skills: [{ id: 'recSkill1' }],
    };

    mockLearningContent(learningContent);
  });

  it('should save a new campaign of type ASSESSMENT', async function () {
    // given
    const campaign = {
      name: 'a name',
      type: CampaignTypes.ASSESSMENT,
      title: 'a title',
      idPixLabel: 'id Pix label',
      customLandingPageText: 'Hello',
      creatorId: userId,
      ownerId: userId,
      organizationId,
      targetProfileId,
    };

    const expectedAttributes = ['type', 'title', 'idPixLabel', 'name', 'customLandingPageText'];

    // when
    const result = await createCampaign({
      campaign,
      campaignAdministrationRepository,
      campaignCreatorRepository,
      codeGenerator,
    });

    // then
    expect(result).to.be.an.instanceOf(Campaign);

    expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));
  });

  it('should save a new campaign of type PROFILES_COLLECTION', async function () {
    // given
    const campaign = {
      name: 'a name',
      type: CampaignTypes.PROFILES_COLLECTION,
      idPixLabel: 'id Pix label',
      customLandingPageText: 'Hello',
      creatorId: userId,
      ownerId: userId,
      organizationId,
    };

    const expectedAttributes = ['type', 'idPixLabel', 'name', 'customLandingPageText'];

    // when
    const result = await createCampaign({
      campaign,
      campaignAdministrationRepository,
      campaignCreatorRepository,
      codeGenerator,
    });

    // then
    expect(result).to.be.an.instanceOf(Campaign);
    expect(_.pick(result, expectedAttributes)).to.deep.equal(_.pick(campaign, expectedAttributes));
    expect(result.code).to.have.lengthOf.above(0);
  });
});
import { CertificationEligibility } from '../read-models/CertificationEligibility.js';

const getUserCertificationEligibility = async function ({
  userId,
  placementProfileService,
  certificationBadgesService,
}) {
  const now = new Date();
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: now });
  const pixCertificationEligible = placementProfile.isCertifiable();

  if (!pixCertificationEligible) {
    return CertificationEligibility.notCertifiable({ userId });
  }

  const stillValidBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId,
  });

  const eligibleComplementaryCertifications = stillValidBadgeAcquisitions.map(
    ({ complementaryCertificationBadgeLabel, complementaryCertificationBadgeImageUrl }) => ({
      label: complementaryCertificationBadgeLabel,
      imageUrl: complementaryCertificationBadgeImageUrl,
    })
  );

  return new CertificationEligibility({
    id: userId,
    pixCertificationEligible,
    eligibleComplementaryCertifications,
  });
};

export { getUserCertificationEligibility };

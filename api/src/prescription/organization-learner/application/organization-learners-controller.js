import { NoProfileRewardsFoundError } from '../../../profile/domain/errors.js';
import { usecases } from '../domain/usecases/index.js';

const getAttestationZipForDivisions = async function (request, h) {
  const organizationId = request.params.organizationId;
  const attestationKey = request.params.attestationKey;
  const divisions = request.query.divisions;

  try {
    const buffer = await usecases.getAttestationZipForDivisions({ attestationKey, organizationId, divisions });
    return h.response(buffer).header('Content-Type', 'application/zip');
  } catch (error) {
    if (error instanceof NoProfileRewardsFoundError) {
      return h.response().code(204);
    }
    throw error;
  }
};

const organizationLearnersController = {
  getAttestationZipForDivisions,
};

export { organizationLearnersController };

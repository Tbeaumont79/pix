import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { config } from '../../../../shared/config.js';
import { ValidateOrganizationImportFileJob } from '../../domain/models/ValidateOrganizationImportFileJob.js';
import { usecases } from '../../domain/usecases/index.js';

class ValidateOrganizationLearnersImportFileJobController extends JobController {
  constructor() {
    super(ValidateOrganizationImportFileJob.name);
  }

  get isJobEnabled() {
    return config.pgBoss.validationFileJobEnabled;
  }

  async handle(event) {
    const { organizationImportId } = event;

    await usecases.validateSiecleXmlFile({ organizationImportId });
  }
}

export { ValidateOrganizationLearnersImportFileJobController };
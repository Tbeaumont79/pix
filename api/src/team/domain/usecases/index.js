import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as mailService from '../../../../lib/domain/services/mail-service.js';
import * as certificationCenterRepository from '../../../certification/shared/infrastructure/repositories/certification-center-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as certificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository.js';
import * as certificationCenterInvitationService from '../services/certification-center-invitation-service.js';

const path = dirname(fileURLToPath(import.meta.url));

const dependencies = {
  certificationCenterRepository,
  certificationCenterInvitationRepository,
  certificationCenterInvitationService,
  mailService,
};

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
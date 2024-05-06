import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { mailService } from '../../../../lib/domain/services/mail-service.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import { config } from '../../../shared/config.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import * as userService from '../../../shared/domain/services/user-service.js';
import * as passwordValidator from '../../../shared/domain/validators/password-validator.js';
import * as userValidator from '../../../shared/domain/validators/user-validator.js';
import * as adminMemberRepository from '../../../shared/infrastructure/repositories/admin-member-repository.js';
import * as authenticationMethodRepository from '../../../shared/infrastructure/repositories/authentication-method-repository.js';
import * as userLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as userRepository from '../../../shared/infrastructure/repositories/user-repository.js';
import * as userToCreateRepository from '../../../shared/infrastructure/repositories/user-to-create-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { oidcProviderRepository } from '../../infrastructure/repositories/oidc-provider-repository.js';
import * as pixAuthenticationService from '../services/pix-authentication-service.js';
import * as refreshTokenService from '../services/refresh-token-service.js';
import { addOidcProviderValidator } from '../validators/add-oidc-provider.validator.js';

const path = dirname(fileURLToPath(import.meta.url));

const repositories = {
  authenticationMethodRepository,
  campaignRepository,
  adminMemberRepository,
  oidcProviderRepository,
  userLoginRepository,
  userRepository,
  userToCreateRepository,
};
const services = {
  cryptoService,
  mailService,
  pixAuthenticationService,
  refreshTokenService,
  tokenService,
  userService,
};
const validators = {
  addOidcProviderValidator,
  userValidator,
  passwordValidator,
};
const dependencies = Object.assign({ config }, repositories, services, validators);

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

/**
 * @typedef AuthenticationUsecases
 * @type {object}
 * @property {addOidcProvider} addOidcProvider
 */
export { usecases };
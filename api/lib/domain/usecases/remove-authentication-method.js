import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../src/identity-access-management/domain/constants/identity-providers.js';
import * as OidcIdentityProviders from '../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { UserNotAuthorizedToRemoveAuthenticationMethod } from '../../../src/shared/domain/errors.js';

export const removeAuthenticationMethod = async function ({
  userId,
  authenticationMethodType,
  userRepository,
  authenticationMethodRepository,
}) {
  const user = await userRepository.get(userId);
  switch (authenticationMethodType) {
    case 'EMAIL':
      if (!user.username) {
        await _removeAuthenticationMethod(userId, NON_OIDC_IDENTITY_PROVIDERS.PIX.code, authenticationMethodRepository);
      }
      await userRepository.updateEmail({ id: userId, email: null });
      break;
    case 'USERNAME':
      if (!user.email) {
        await _removeAuthenticationMethod(userId, NON_OIDC_IDENTITY_PROVIDERS.PIX.code, authenticationMethodRepository);
      }
      await userRepository.updateUsername({ id: userId, username: null });
      break;
    case NON_OIDC_IDENTITY_PROVIDERS.GAR.code:
      await _removeAuthenticationMethod(userId, NON_OIDC_IDENTITY_PROVIDERS.GAR.code, authenticationMethodRepository);
      break;
    case OidcIdentityProviders.POLE_EMPLOI.code:
      await _removeAuthenticationMethod(userId, OidcIdentityProviders.POLE_EMPLOI.code, authenticationMethodRepository);
      break;
    default:
      await _removeAuthenticationMethod(userId, authenticationMethodType, authenticationMethodRepository);
  }
};

async function _removeAuthenticationMethod(userId, identityProvider, authenticationMethodRepository) {
  const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId });

  if (authenticationMethods.length === 1) {
    throw new UserNotAuthorizedToRemoveAuthenticationMethod();
  }

  await authenticationMethodRepository.removeByUserIdAndIdentityProvider({ userId, identityProvider });
}

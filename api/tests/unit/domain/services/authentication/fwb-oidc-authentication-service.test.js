import { FwbOidcAuthenticationService } from '../../../../../lib/domain/services/authentication/fwb-oidc-authentication-service.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Services | fwb-oidc-authentication-service', function () {
  describe('#constructor', function () {
    it('has specific properties related to this identity provider', async function () {
      // when
      const fwbOidcAuthenticationService = new FwbOidcAuthenticationService();

      // then
      expect(fwbOidcAuthenticationService.source).to.equal('fwb');
      expect(fwbOidcAuthenticationService.identityProvider).to.equal('FWB');
      expect(fwbOidcAuthenticationService.slug).to.equal('fwb');
      expect(fwbOidcAuthenticationService.organizationName).to.equal('Fédération Wallonie-Bruxelles');
      expect(fwbOidcAuthenticationService.shouldCloseSession).to.be.true;
    });
  });
});

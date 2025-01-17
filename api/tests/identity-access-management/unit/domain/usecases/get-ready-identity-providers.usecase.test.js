import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { getReadyIdentityProviders } from '../../../../../src/identity-access-management/domain/usecases/get-ready-identity-providers.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCases | get-ready-identity-providers', function () {
  let oneOidcProviderService;
  let anotherOidcProviderService;
  let oidcAuthenticationServiceRegistryStub;

  beforeEach(function () {
    oneOidcProviderService = {};
    anotherOidcProviderService = {};
    oidcAuthenticationServiceRegistryStub = {
      loadOidcProviderServices: sinon.stub().resolves(),
      getReadyOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
      getReadyOidcProviderServicesForPixAdmin: sinon
        .stub()
        .returns([oneOidcProviderService, anotherOidcProviderService]),
    };
  });

  describe('when an audience is provided', function () {
    describe('when the provided audience is equal to "admin"', function () {
      it('returns oidc providers from getReadyOidcProviderServicesForPixAdmin', async function () {
        // when
        const identityProviders = await getReadyIdentityProviders({
          audience: PIX_ADMIN.AUDIENCE,
          oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
        });

        // then
        expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
        expect(oidcAuthenticationServiceRegistryStub.getReadyOidcProviderServicesForPixAdmin).to.have.been.calledOnce;
        expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
      });
    });
  });

  it('returns oidc providers from getReadyOidcProviderServices', async function () {
    // when
    const identityProviders = await getReadyIdentityProviders({
      audience: null,
      oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
    });

    // then
    expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
    expect(oidcAuthenticationServiceRegistryStub.getReadyOidcProviderServices).to.have.been.calledOnce;
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});

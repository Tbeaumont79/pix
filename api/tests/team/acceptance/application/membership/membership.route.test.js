import _ from 'lodash';

import { Membership } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | membership-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/memberships/{id}', function () {
    let options;
    let userId;
    let organizationId;
    let membershipId;
    let newOrganizationRole;

    beforeEach(async function () {
      const externalId = 'externalId';
      organizationId = databaseBuilder.factory.buildOrganization({ externalId, type: 'SCO' }).id;
      const adminUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: adminUserId,
        organizationRole: Membership.roles.ADMIN,
      });

      userId = databaseBuilder.factory.buildUser().id;
      membershipId = databaseBuilder.factory.buildMembership({
        organizationId,
        userId,
        organizationRole: Membership.roles.MEMBER,
      }).id;
      databaseBuilder.factory.buildCertificationCenter({ externalId });

      await databaseBuilder.commit();

      newOrganizationRole = Membership.roles.ADMIN;
      options = {
        method: 'PATCH',
        url: `/api/memberships/${membershipId}`,
        payload: {
          data: {
            id: membershipId.toString(),
            type: 'memberships',
            attributes: {
              'organization-role': newOrganizationRole,
            },
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: userId,
                },
              },
              organization: {
                data: {
                  type: 'organizations',
                  id: organizationId,
                },
              },
            },
          },
        },
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUserId),
        },
      };
    });

    context('Success cases', function () {
      it('should return the updated membership and add certification center membership', async function () {
        // given
        const expectedMembership = {
          data: {
            type: 'memberships',
            id: membershipId.toString(),
            attributes: {
              'organization-role': newOrganizationRole,
            },
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: userId.toString(),
                },
              },
              organization: {
                data: {
                  type: 'organizations',
                  id: organizationId.toString(),
                },
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(_.omit(response.result, 'included')).to.deep.equal(expectedMembership);
      });
    });

    context('Error cases', function () {
      it('should respond with a 403 if user is not admin of membership organization', async function () {
        // given
        const notAdminUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({
          organizationId,
          userId: notAdminUserId,
          organizationRole: Membership.roles.MEMBER,
        });
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(notAdminUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 400 if membership does not exist', async function () {
        // given
        options.url = '/api/memberships/NOT_NUMERIC';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
        const firstError = response.result.errors[0];
        expect(firstError.detail).to.equal('"id" must be a number');
      });
    });
  });
});
import { adminMemberRoutes } from './admin-member/admin-member.route.js';
import { certificationCenterInvitationAdminRoutes } from './certification-center-invitation/certification-center-invitation.admin.route.js';
import { certificationCenterInvitationRoutes } from './certification-center-invitation/certification-center-invitation.route.js';
import { membershipRoutes } from './membership/membership.route.js';
import { organizationInvitationAdminRoutes } from './organization-invitations/organization-invitation.admin.route.js';
import { organizationInvitationRoutes } from './organization-invitations/organization-invitation.route.js';
import { prescriberInformationsRoute } from './prescriber-informations.route.js';

const register = async function (server) {
  server.route([
    ...adminMemberRoutes,
    ...certificationCenterInvitationRoutes,
    ...certificationCenterInvitationAdminRoutes,
    ...membershipRoutes,
    ...prescriberInformationsRoute,
    ...organizationInvitationRoutes,
    ...organizationInvitationAdminRoutes,
  ]);
};

const name = 'team-api';

export const teamRoutes = [{ register, name }];

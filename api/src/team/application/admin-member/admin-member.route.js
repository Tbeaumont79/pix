import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { adminMemberController } from './admin-member.controller.js';

export const adminMemberRoutes = [
  {
    method: 'POST',
    path: '/api/admin/admin-members',
    config: {
      validate: {
        payload: Joi.object({
          data: Joi.object({
            attributes: Joi.object({
              email: Joi.string().email().required(),
              role: Joi.string().valid('SUPER_ADMIN', 'SUPPORT', 'METIER', 'CERTIF').required(),
            }),
          }),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
        },
      ],
      handler: (request, h) => adminMemberController.saveAdminMember(request, h),
      notes: [
        "- Cette route est restreinte aux utilisateurs ayant les droits d'accès\n" +
          '- Elle permet de donner un accès à Pix Admin à un nouveau membre\n' +
          'ou à réactiver un membre désactivé',
      ],
      tags: ['api', 'admin', 'admin-members'],
    },
  },
];
